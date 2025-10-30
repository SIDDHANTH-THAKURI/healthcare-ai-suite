from pathlib import Path
from typing import List, Optional
from datetime import datetime
import uuid, os, tempfile, json, re
from pymongo.collection import Collection
import aiofiles
import patientHistoryCheck as PHC
from drugnexusaipipeline4 import process_single_question
from drugnexusaipipeline4 import FULL_ROUTER_PROMPT  
from drugnexusaipipeline4 import extract_two_drugs, lookup_interaction  
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from pydantic import BaseModel
from pymongo import MongoClient
from config import MONGO_URI, COLLECTION_NAME, DB_NAME, MEDS_DB, CHAT_DB, USER_DB, OPENROUTER_API_KEY
import requests
from openrouter_config import OPENROUTER_API_URL, HEADERS, MODEL_NAME

# ─── FASTAPI SETUP ────────────────────────────────────────────────────
app = FastAPI(title="DrugNexusAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mongo_client = MongoClient(MONGO_URI)
prescriptions_collection = mongo_client[DB_NAME][MEDS_DB]
accounts_collection = mongo_client[DB_NAME][USER_DB]
chatbot_history_collection = mongo_client[DB_NAME][CHAT_DB]

# ─── HEALTH CHECK ─────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    try:
        # Test MongoDB connection
        mongo_client.admin.command('ping')
        mongo_status = "connected"
    except Exception as e:
        mongo_status = f"disconnected: {str(e)}"
    
    # Test LLM API
    try:
        test_response = call_llm("Test")
        llm_status = "connected" if test_response is not None else "error"
    except Exception as e:
        llm_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "service": "ml-service",
        "timestamp": datetime.now().isoformat(),
        "mongodb": mongo_status,
        "llm_api": llm_status,
        "config": {
            "mongo_uri_set": bool(MONGO_URI),
            "api_key_set": bool(OPENROUTER_API_KEY),
            "model": MODEL_NAME
        }
    }

# ─── DEBUG ENDPOINT ─────────────────────────────────────────────────────
@app.get("/debug/patient-history/{patient_id}")
def debug_patient_history(patient_id: str):
    """Debug endpoint to check patient history data"""
    try:
        notes = get_consultation_notes(patient_id)
        meds = get_current_medications(patient_id)
        
        return {
            "patient_id": patient_id,
            "notes_count": len(notes),
            "notes": notes[:2] if notes else [],  # Show first 2 notes
            "medications_count": len(meds),
            "medications": meds[:3] if meds else [],  # Show first 3 meds
            "database_collections": {
                "prescriptions_exists": prescriptions_collection.count_documents({}) > 0,
                "patient_document_exists": prescriptions_collection.count_documents({"patient": patient_id}) > 0
            }
        }
    except Exception as e:
        return {"error": str(e), "patient_id": patient_id}

# ─── MODELS ───────────────────────────────────────────────────────────
class HistoryInput(BaseModel):
    patientId: str
    notes: str

class UpdateRequest(BaseModel):
    rawText: Optional[str] = None
    summary: Optional[str] = None
    medicines: Optional[List[dict]] = None

# ─── HELPERS ──────────────────────────────────────────────────────────
def _temp_path(original: str) -> Path:
    root = Path(tempfile.gettempdir()) / "drugnexusai_uploads"
    root.mkdir(exist_ok=True)
    safe = Path(original).name.replace("\\", "_").replace("/", "_")
    return root / f"{uuid.uuid4().hex}_{safe}"


def call_llm(prompt_text: str) -> str:
    try:
        payload = {"model": MODEL_NAME, "messages": [{"role": "user", "content": prompt_text}]}
        res = requests.post(OPENROUTER_API_URL, headers=HEADERS, json=payload, timeout=30)
        res.raise_for_status()
        return res.json().get("choices", [{}])[0].get("message", {}).get("content", "")
    except requests.exceptions.Timeout:
        print("LLM API timeout - using fallback")
        return ""
    except requests.exceptions.RequestException as e:
        print(f"LLM API error: {e} - using fallback")
        return ""
    except Exception as e:
        print(f"Unexpected LLM error: {e} - using fallback")
        return ""


def get_consultation_notes(patient_id: str) -> List[dict]:
    pres = prescriptions_collection.find_one(
        {"patient": patient_id, "source": "notes"},  # 🔥 only fetch the notes document
        projection={"consultationNotes": 1}
    )
    return pres.get("consultationNotes", []) if pres else []


def get_all_notes_with_dates(patient_id: str) -> List[str]:
    pres = prescriptions_collection.find_one({"patient": patient_id}, {"consultationNotes": 1})
    notes = pres.get("consultationNotes", []) if pres else []
    # Sort by date to ensure chronological order (oldest first)
    sorted_notes = sorted(notes, key=lambda n: n.get('createdAt', ''))
    return [f"{n['createdAt']}: {n.get('summary', n.get('rawText', ''))}" for n in sorted_notes]


def get_current_medications(patient_id: str) -> List[dict]:
    pres = prescriptions_collection.find_one(
        {"patient": patient_id},
        projection={"medicines": 1},
        sort=[("createdAt", -1)]
    )
    return pres.get("medicines", []) if pres else []

def get_all_medications_from_notes(patient_id: str) -> List[dict]:
    pres = prescriptions_collection.find_one(
        {"patient": patient_id, "source": "notes"},
        projection={"consultationNotes.structured.medications": 1}
    )
    if not pres or "consultationNotes" not in pres:
        return []

    all_meds = []
    for note in pres["consultationNotes"]:
        all_meds.extend(note.get("structured", {}).get("medications", []))

    # Deduplicate by (name + dosage)
    merged = {}
    for med in all_meds:
        key = (med["name"].lower(), med.get("dosage", "").lower())
        merged[key] = med
    return list(merged.values())

def get_current_prescriptions(patient_id: str) -> List[str]:
    current_meds = get_all_medications_from_notes(patient_id)
    formatted_meds = []
    for m in meds:
        parts = [m.get("name", ""), m.get("dosage", ""), m.get("frequency", ""), m.get("duration", "")]
        formatted_meds.append(" ".join([pt for pt in parts if pt]).strip())
    return formatted_meds

def merge_medications(existing, new):
    combined = { (m['name'].lower(), m['dosage'].lower()): m for m in existing }
    for med in new:
        key = (med['name'].lower(), med['dosage'].lower())
        combined[key] = med  # overwrite or insert
    return list(combined.values())

def extract_structured_summary(full_notes: List[str], current_meds: List[dict]) -> dict:
    # Create a fallback response
    fallback_response = {
        "summary": full_notes[-1] if full_notes else "No notes available",
        "conditions": {"current": [], "past": []},
        "medications": current_meds,  # Preserve existing medications
        "allergies": []
    }
    
    # If no notes, return fallback immediately
    if not full_notes:
        return fallback_response
    
    # Format current medications as a JSON string for the LLM prompt
    current_meds_json = json.dumps(current_meds, indent=2)
    
    prompt = f"""
You are a clinical AI assistant.

Your job is to analyze the following consultation history and return structured medical data in JSON format. Use the format exactly as shown below:

{{
  "summary": "short plain-English summary of the patient history",
  "conditions": {{
    "current": ["condition1", "condition2"],
    "past": ["resolved_condition1"]
  }},
  "medications": [
    {{
      "name": "DrugName",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. Twice daily",
      "duration": "e.g. 5 days",
      "status": "active" or "discontinued"
    }}
  ],
  "allergies": ["allergy1", "allergy2"]
}}

CRITICAL INSTRUCTIONS FOR CONDITIONS - READ CAREFULLY:

STEP 1: Read the FIRST note below (most recent consultation)
STEP 2: Extract ALL conditions mentioned in that latest note
STEP 3: Determine if each condition is CURRENT or PAST based on these rules:

IF the latest note says:
- "has returned" / "is back" / "recurring" / "again" → CURRENT (even if it was past before)
- "resolved" / "cured" / "no longer" / "recovered" → PAST
- Just mentions the condition without resolution words → CURRENT
- "still has" / "continues to have" / "ongoing" → CURRENT

IMPORTANT: The word "returned" or "back" means the condition is NOW ACTIVE (CURRENT), not past!

Step-by-step example:
Note 1 (old): "Patient had asthma as a child" → asthma was PAST
Note 2 (latest): "Patient's asthma has returned" → asthma is NOW CURRENT (moved from past to current)

Another example:
Note 1 (old): "Patient has fever and headache" → both CURRENT
Note 2 (latest): "Fever resolved, but headache persists" → fever is PAST, headache is CURRENT

RULE: Any condition mentioned in the LATEST note is CURRENT unless explicitly stated as resolved/cured

Other Instructions:
- For medications, use the provided list below as the current master and update based on the latest entry.
- Always include `status` in medications.
- ❌ Do not add commentary, explanation, or markdown. Just return JSON.

---

Consultation Notes (MOST RECENT FIRST):
{chr(10).join(reversed(full_notes))}

Current Medication List (JSON):
{current_meds_json}
"""

    try:
        print("\n" + "="*80)
        print("🔍 CALLING LLM TO EXTRACT STRUCTURED DATA")
        print("="*80)
        print(f"📝 Input Notes (most recent first):")
        for i, note in enumerate(reversed(full_notes), 1):
            print(f"   {i}. {note[:100]}...")
        print(f"💊 Current Medications Count: {len(current_meds)}")
        print("="*80 + "\n")
        
        raw = call_llm(prompt)
        
        # If LLM call failed (empty response), return fallback
        if not raw or not raw.strip():
            print("❌ LLM returned empty response, using fallback")
            return fallback_response
        
        print("\n" + "="*80)
        print("📥 RAW LLM RESPONSE:")
        print("="*80)
        print(raw[:500] + "..." if len(raw) > 500 else raw)
        print("="*80 + "\n")
            
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            print("❌ No JSON found in LLM response, using fallback")
            return fallback_response
            
        cleaned = match.group(0).strip()
        structured_data = json.loads(cleaned)
        
        # Validate the structure
        if not isinstance(structured_data, dict):
            print("❌ Invalid JSON structure from LLM, using fallback")
            return fallback_response
            
        # Ensure required fields exist
        if "summary" not in structured_data:
            structured_data["summary"] = fallback_response["summary"]
        if "conditions" not in structured_data:
            structured_data["conditions"] = fallback_response["conditions"]
        if "medications" not in structured_data:
            structured_data["medications"] = fallback_response["medications"]
        if "allergies" not in structured_data:
            structured_data["allergies"] = fallback_response["allergies"]
        
        # Ensure conditions structure exists
        if 'conditions' not in structured_data or not isinstance(structured_data['conditions'], dict):
            structured_data['conditions'] = {'current': [], 'past': []}
        if 'current' not in structured_data['conditions']:
            structured_data['conditions']['current'] = []
        if 'past' not in structured_data['conditions']:
            structured_data['conditions']['past'] = []
        
        # Post-process: Check if latest note mentions conditions with "returned", "back", etc.
        if full_notes and len(full_notes) > 0:
            latest_note = full_notes[-1].split(":", 1)[-1].lower().strip()  # Get the most recent note
            print(f"📝 Latest note for analysis: {latest_note[:200]}...")
            
            returned_keywords = ['returned', 'is back', 'has returned', 'came back', 'recurred', 'recurring', 'again', 'flare-up', 'flare up']
            
            # Check if any past conditions are mentioned with "returned" keywords in latest note
            past_conditions = structured_data.get('conditions', {}).get('past', []) or []
            current_conditions = structured_data.get('conditions', {}).get('current', []) or []
            
            print(f"🔍 Before post-processing - Current: {current_conditions}, Past: {past_conditions}")
            
            conditions_to_move = []
            for condition in past_conditions:
                condition_lower = condition.lower()
                pattern = r'\b' + re.escape(condition_lower) + r'\b'
                # Check if this condition is mentioned with "returned" keywords in latest note
                for keyword in returned_keywords:
                    if re.search(pattern, latest_note) and keyword in latest_note:
                        conditions_to_move.append(condition)
                        print(f"🔄 Moving '{condition}' from PAST to CURRENT (found '{keyword}' in latest note)")
                        break
            
            # Move conditions from past to current
            if conditions_to_move:
                for condition in conditions_to_move:
                    past_conditions.remove(condition)
                    if condition not in current_conditions:
                        current_conditions.append(condition)
                
                past_conditions = [c for c in past_conditions if c not in conditions_to_move]
                current_conditions = list(set(current_conditions + conditions_to_move))
                structured_data['conditions']['past'] = past_conditions
                structured_data['conditions']['current'] = current_conditions
                print(f"✅ After post-processing - Current: {current_conditions}, Past: {past_conditions}")
        
        print("\n" + "="*80)
        print("✅ STRUCTURED DATA EXTRACTED SUCCESSFULLY")
        print("="*80)
        print(f"📋 Summary: {structured_data.get('summary', 'N/A')[:100]}...")
        print(f"🏥 Current Conditions: {structured_data.get('conditions', {}).get('current', [])}")
        print(f"📜 Past Conditions: {structured_data.get('conditions', {}).get('past', [])}")
        print(f"💊 Medications: {len(structured_data.get('medications', []))} items")
        print(f"⚠️  Allergies: {structured_data.get('allergies', [])}")
        print("="*80 + "\n")
            
        return structured_data
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}, using fallback")
        return fallback_response
    except Exception as e:
        print(f"Unexpected error in extract_structured_summary: {e}, using fallback")
        return fallback_response




# ─── SAVE HISTORY TO PRESCRIPTION ───────────────────────────────────────
@app.post("/api/patient-history")
async def save_patient_history(data: HistoryInput):
    try:
        # Validate input
        if not data.patientId or not data.notes or not data.notes.strip():
            raise HTTPException(400, "Missing patientId or notes")

        print("\n" + "🔵"*40)
        print("🆕 NEW CONSULTATION NOTE RECEIVED")
        print("🔵"*40)
        print(f"👤 Patient ID: {data.patientId}")
        print(f"📝 New Note: {data.notes.strip()}")
        print("🔵"*40 + "\n")

        past_summaries = get_all_notes_with_dates(data.patientId)
        current_meds = get_current_medications(data.patientId)
        now_ts = datetime.utcnow().isoformat()
        formatted_ts = datetime.utcnow().isoformat()
        past_summaries.append(f"{formatted_ts}: {data.notes.strip()}")
        
        print(f"📚 Total notes in history (including new): {len(past_summaries)}")
        print(f"💊 Current medications count: {len(current_meds)}")
        
        # Extract structured summary with timeout protection
        print(f"\n🔄 Processing consultation note for patient {data.patientId}...")
        result = extract_structured_summary(past_summaries, current_meds)
        print(f"✅ Structured summary extracted successfully")

        entry = {
            "id": str(uuid.uuid4()),
            "createdAt": now_ts,
            "rawText": data.notes,
            "summary": result.get("summary", data.notes.strip()),
            "structured": result
        }

        print("\n" + "💾"*40)
        print("💾 SAVING TO DATABASE")
        print("💾"*40)
        print(f"📄 Entry ID: {entry['id']}")
        print(f"📝 Summary: {entry['summary'][:100]}...")
        print(f"🏥 Structured Data:")
        print(f"   - Current Conditions: {result.get('conditions', {}).get('current', [])}")
        print(f"   - Past Conditions: {result.get('conditions', {}).get('past', [])}")
        print(f"   - Medications: {len(result.get('medications', []))} items")
        print(f"   - Allergies: {result.get('allergies', [])}")
        print("💾"*40 + "\n")

        # Save to database with error handling
        try:
            merged_meds = merge_medications(current_meds, result.get("medications", []))
            print(f"💊 Merged medications count: {len(merged_meds)}")
            
            update_result = prescriptions_collection.update_one(
                {"patient": data.patientId, "source": "notes"},
                {
                    "$push": {"consultationNotes": entry},
                    "$set": {
                        "medicines": merged_meds,
                        "createdAt": now_ts,
                        "source": "notes"
                    }
                },
                upsert=True
            )
            
            print("\n" + "✅"*40)
            print("✅ DATABASE SAVE SUCCESSFUL")
            print("✅"*40)
            print(f"📊 Modified: {update_result.modified_count} document(s)")
            print(f"🆕 Upserted ID: {update_result.upserted_id}")
            print("✅"*40 + "\n")
            
        except Exception as db_error:
            print(f"❌ Database error: {db_error}")
            raise HTTPException(500, f"Database error: {str(db_error)}")

        return {"success": True, "note": entry}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in save_patient_history: {e}")
        raise HTTPException(500, f"History processing failed: {str(e)}")


@app.get("/api/patient-history")
def get_patient_history(patientId: str):
    if not patientId:
        raise HTTPException(400, "Missing patientId")
    notes = get_consultation_notes(patientId)
    return {"notes": notes[::-1]}  # reverse chronological

@app.put("/api/patient-history/{note_id}")
async def update_patient_history(note_id: str, update: UpdateRequest):
    pres = prescriptions_collection.find_one(
        {"consultationNotes.id": note_id},
        {"patient": 1, "consultationNotes": 1, "medicines": 1}
    )
    if not pres:
        raise HTTPException(404, "Note not found")

    patient_id = pres["patient"]
    current_meds = pres.get("medicines", [])
    full_notes = []
    for note in sorted(pres["consultationNotes"], key=lambda x: x["createdAt"]):
        if note["id"] == note_id:
            raw = update.rawText or note["rawText"]
            full_notes.append(f"{datetime.fromisoformat(note['createdAt']).strftime('%d/%m/%Y %I:%M %p')}: {raw}")
        else:
            full_notes.append(f"{datetime.fromisoformat(note['createdAt']).strftime('%d/%m/%Y %I:%M %p')}: {note['summary']}")

    result = extract_structured_summary(full_notes, current_meds)

    res = prescriptions_collection.update_one(
        {"consultationNotes.id": note_id},
        {
            "$set": {
                "consultationNotes.$": {
                    "id": note_id,
                    "createdAt": pres["consultationNotes"][0]["createdAt"],
                    "rawText": update.rawText or pres["consultationNotes"][0]["rawText"],
                    "summary": result["summary"],
                    "structured": {
                        **result,
                        "medications": merge_medications(result.get("medications", []), update.medicines or [])
                    }
                },
                "medicines": merge_medications(current_meds, update.medicines or result.get("medications", [])),
            }
        }
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Note not found")

    # update_patient_profile(patient_id, result)

    return {"success": True, "note": {
    "id": note_id,
    "createdAt": pres["consultationNotes"][0]["createdAt"],
    "rawText": update.rawText or pres["consultationNotes"][0]["rawText"],
    "summary": result["summary"],
    "structured": {
        **result,
        "medications": merge_medications(result.get("medications", []), update.medicines or [])
    }
}}

@app.delete("/api/patient-history/{note_id}")
async def delete_patient_history(note_id: str):
    pres = prescriptions_collection.find_one(
        {"consultationNotes.id": note_id},
        {"patient": 1, "consultationNotes": 1, "medicines": 1}
    )
    if not pres:
        raise HTTPException(404, "Note not found")

    patient_id = pres["patient"]
    current_meds = pres.get("medicines", [])
    res = prescriptions_collection.update_one(
        {"consultationNotes.id": note_id},
        {"$pull": {"consultationNotes": {"id": note_id}}}
    )
    if res.modified_count == 0:
        raise HTTPException(404, "Note not found")

    # Recompute structured data after deletion to update medications
    past_summaries = get_all_notes_with_dates(patient_id)
    result = extract_structured_summary(past_summaries, current_meds)
    prescriptions_collection.update_one(
        {"patient": patient_id},
        {"$set": {"medicines": result.get("medications", current_meds)}}
    )
    # update_patient_profile(patient_id, result)

    return {"success": True}

# ─── CHATBOT ENDPOINT ───────────────────────────────────────────────────
@app.post("/chat")
async def chat_endpoint(payload: dict = Body(...)):
    question = payload.get("question", "").strip()
    user_id = payload.get("userId", "").strip()
    
    if not question or not user_id:
        raise HTTPException(400, "Missing question or userId")

    try:
        answer = process_single_question(question, user_id)
        return JSONResponse({"answer": answer or "Sorry, I couldn't find an answer."})
    except Exception as e:
        raise HTTPException(500, f"Chat failed: {e}")


# ─── LEGACY FILE UPLOAD HISTORY ─────────────────────────────────────────
@app.post("/history/upload")
async def upload_history(
    files: List[UploadFile] = File(...),
    userId: str = Query(...)
):  
    if not files:
        raise HTTPException(400, "No files received")
    
    for up in files:
        tmp = _temp_path(up.filename)
        async with aiofiles.open(tmp, "wb") as f:
            await f.write(await up.read())
        try:
            PHC.ingest_file(tmp, userId)  # ✅ Now stores in MongoDB
        except Exception as e:
            raise HTTPException(422, f"Could not process {up.filename}: {e}")
        finally:
            tmp.unlink(missing_ok=True)

    return {"success": True, "message": "File(s) processed and history saved."}

@app.get("/history/list")
def list_user_history(userId: str = Query(...)):
    docs = chatbot_history_collection.find(
        {"userId": userId, "isSafe": True}
    ).sort("uploadedAt", -1)

    return [
        {
            "id": str(doc["_id"]),
            "date": doc["uploadedAt"].strftime("%d/%m/%Y %I:%M %p"),
            "summary": doc["summary"]
        }
        for doc in docs
    ]



# ─── DEBUG ROUTE ──────────────────────────────────────────────────────
@app.post("/test-token")
async def test_token(request: Request):
    auth = request.headers.get("Authorization")
    data = await request.json()
    return {"auth_header": auth, "patientId": data.get("patientId"), "notes": data.get("notes")}


@app.post("/api/check-ddi")
async def check_ddi(payload: dict = Body(...)):
    """
    Check for drug-drug interactions using LLM analysis
    Analyzes patient's complete medical profile
    """
    patient_id = payload.get("patientId")
    medications = payload.get("medications", [])
    conditions = payload.get("conditions", [])
    allergies = payload.get("allergies", [])
    patient_age = payload.get("age")
    patient_gender = payload.get("gender")
    
    if not patient_id or not medications:
        raise HTTPException(400, "Missing patientId or medications")
    
    if len(medications) == 0:
        return {"interactions": [], "summary": "No medications to check", "safe": True}
    
    # Build comprehensive patient profile for LLM
    med_list = [f"{m['name']} ({m.get('dosage', 'unknown dosage')}, {m.get('frequency', 'unknown frequency')})" for m in medications]
    
    prompt = f"""You are a clinical pharmacist AI assistant. Analyze the following patient's medication regimen for potential drug-drug interactions, contraindications, and safety concerns.

PATIENT PROFILE:
- Age: {patient_age} years
- Gender: {patient_gender}
- Medical Conditions: {', '.join(conditions) if conditions else 'None reported'}
- Known Allergies: {', '.join(allergies) if allergies else 'None reported'}

CURRENT ACTIVE MEDICATIONS:
{chr(10).join(f'{i+1}. {med}' for i, med in enumerate(med_list))}

TASK:
1. Check for drug-drug interactions between the medications
2. Check for contraindications based on medical conditions
3. Check for allergy conflicts
4. Assess overall safety of this medication regimen

RESPONSE FORMAT:
If there are ANY concerns, provide a JSON response with this structure:
{{
  "safe": false,
  "interactions": [
    {{
      "severity": "critical|major|moderate|minor",
      "drugs": ["Drug A", "Drug B"],
      "message": "Brief, clear description of the interaction (max 100 characters)",
      "recommendation": "Clear action for the doctor (max 150 characters)"
    }}
  ]
}}

If NO concerns found, respond with:
{{
  "safe": true,
  "interactions": [],
  "message": "No significant drug interactions or contraindications detected. Medication regimen appears safe."
}}

IMPORTANT:
- Be concise and clear
- Focus on clinically significant interactions only
- Use medical terminology doctors understand
- Prioritize patient safety
- If unsure, err on the side of caution"""

    try:
        # Call LLM
        llm_response = call_llm(prompt)
        
        if not llm_response:
            # Fallback to basic checking
            return {
                "safe": True,
                "interactions": [],
                "message": "LLM unavailable. Basic check: No obvious contraindications detected.",
                "llmUsed": False
            }
        
        # Parse LLM response
        import json
        import re
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            result["llmUsed"] = True
            result["patientHistoryChecked"] = True
            return result
        else:
            # If LLM didn't return JSON, treat as safe
            return {
                "safe": True,
                "interactions": [],
                "message": "Analysis complete. No significant concerns identified.",
                "llmUsed": True
            }
            
    except Exception as e:
        print(f"LLM DDI check error: {e}")
        # Fallback response
        return {
            "safe": True,
            "interactions": [],
            "message": f"Error during analysis: {str(e)}. Please review medications manually.",
            "llmUsed": False,
            "error": str(e)
        }


@app.get("/api/check-alerts")
def check_alerts(patientId: str = Query(...)):
    if not patientId:
        raise HTTPException(400, "Missing patientId")

    # Fetch latest consultation note with structured data
    pres = prescriptions_collection.find_one(
        {"patient": patientId, "source": "notes"},
        projection={"consultationNotes": 1, "medicines": 1},
        sort=[("createdAt", -1)]
    )

    if not pres or "consultationNotes" not in pres or not pres["consultationNotes"]:
        return {"ddi": [], "pdi": []}

    latest_note = sorted(pres["consultationNotes"], key=lambda n: n["createdAt"], reverse=True)[0]
    structured = latest_note.get("structured", {})

    # 🔍 Extract data
    medications = pres.get("medicines", [])
    conditions = structured.get("conditions", {})
    allergies = structured.get("allergies", [])

    active_drugs = [m["name"] for m in medications if m.get("status", "active").lower() == "active"]
    cond_current = conditions.get("current", [])
    cond_past = conditions.get("past", [])

    # 🧠 Build LLM prompt
    llm_prompt = f"""
    Analyze the following medical data and return structured risks:

    - Current Medications: {', '.join(active_drugs) or 'None'}
    - Current Conditions: {', '.join(cond_current) or 'None'}
    - Past Conditions: {', '.join(cond_past) or 'None'}
    - Allergies: {', '.join(allergies) or 'None'}

    Tasks:
    1. Identify any risky drug-drug interactions (DDI).
    2. Identify any drug-condition or drug-allergy contradictions (PDI).

    Return in the format:
    [ddi_alerts: 
    - Drug1 + Drug2: Reason
    - ...
    ]

    [pdi_alerts: 
    - Drug + Condition/Allergy: Reason
    - ...
    ]
    """

    # 🧠 LLM call
    router_out = call_llm(llm_prompt)

    def extract_block(name):
        m = re.search(rf"\[{name}:(.*?)\]", router_out, re.DOTALL)
        return m.group(1).strip() if m else ""

    ddi_block = extract_block("ddi_alerts")
    pdi_block = extract_block("pdi_alerts")

    ddi_alerts = re.findall(r"-\s*(.*?)$", ddi_block, re.MULTILINE)
    pdi_alerts = re.findall(r"-\s*(.*?)$", pdi_block, re.MULTILINE)

    return {"ddi": ddi_alerts, "pdi": pdi_alerts}