from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
try:
    from models.deidentifier import deidentify_text
    print("✅ Loaded advanced deidentifier with ML model")
except Exception as e:
    print(f"⚠️  Could not load ML deidentifier: {e}")
    print("🔄 Falling back to regex-based deidentifier")
    from models.deidentifier_fallback import deidentify_text 
from models.DLTypeClassificationInference import predict_ddi, label_map
from models.hybrid_binary_ddi_inference import predict_hybrid_binary_ddi
from fastapi import FastAPI, Query
from pymongo import MongoClient
from config2 import MONGO_URI, COLLECTION_NAME, DB_NAME
import os

app = FastAPI()

# ─── Enable CORS ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mongo_client = MongoClient(MONGO_URI)
drugdb = mongo_client[DB_NAME][COLLECTION_NAME]

# ─── HEALTH CHECK ─────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    try:
        # Test MongoDB connection
        mongo_client.admin.command('ping')
        mongo_status = "connected"
    except Exception:
        mongo_status = "disconnected"
    
    return {
        "status": "healthy",
        "service": "ddi-service",
        "timestamp": "2025-01-09T00:00:00Z",  # Static timestamp since datetime not imported
        "mongodb": mongo_status
    }

# ─── Request Schema ──────────────────────────────────────────────
class DeIDRequest(BaseModel):
    text: str

# ─── DL-DDI (ChemBERTa) Request ────────────────
class ChembertaDDIRequest(BaseModel):
    smiles1: str
    smiles2: str

# ─── Binary DDI Classifier Request (optional) ──
class BinaryDDIRequest(BaseModel):
    smiles1: str
    smiles2: str

# ─── Warm-up Endpoint ────────────────────────────────────────────
@app.get("/ping")
async def ping():
    _ = deidentify_text("Warmup input")
    # Dummy SMILES for warm-up
    smiles1 = "CC(=O)OC1=CC=CC=C1C(=O)O"  # Aspirin
    smiles2 = "CCN(CC)CCCC(C)NC1=NC=NC2=CN=CN=C12"  # Caffeine
    _ = predict_ddi(smiles1, smiles2)

    return {"message": "All models warmed up and ready"}

# ─── Deidentifier Endpoint ───────────────────────────────────────
@app.post("/deidentify")
async def deidentify(request: DeIDRequest):
    result = deidentify_text(request.text)
    return result

# ─── Autocomplete Drug Names ──────────────────────────────────────
@app.get("/search-drugs")
def search_drugs(q: str = Query(..., min_length=1)):
    cursor = drugdb.find({"name": {"$regex": f"^{q}", "$options": "i"}}, {"_id": 0, "name": 1})
    return [doc["name"] for doc in cursor]

# ─── Get SMILES by Drug Name ──────────────────────────────────────
@app.get("/get-smiles")
def get_smiles(name: str):
    drug = drugdb.find_one({"name": name}, {"_id": 0, "smiles": 1})
    if not drug:
        return {"error": "Drug not found"}
    return {"smiles": drug["smiles"]}

# ─── ChemBERTa DL-DDI Prediction ─────────────────────────────────
@app.post("/predict-chemberta-ddi")
def predict_chemberta_ddi(request: ChembertaDDIRequest):
    if not request.smiles1 or not request.smiles2:
        return {"error": "Both SMILES strings are required."}

    try:
        results = predict_ddi(request.smiles1, request.smiles2)
        return {
            "results": [
                {
                    "class": cls,
                    "confidence": f"{conf:.4f}",
                    "description": label_map.get(cls, f"Class {cls}")
                }
                for cls, conf in results
            ]
        }
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

@app.post("/predict-hybrid-binary-ddi")
def predict_hybrid_binary(request: ChembertaDDIRequest):  # reusing same pydantic model
    try:
        label, prob = predict_hybrid_binary_ddi(request.smiles1, request.smiles2)
        return {
            "label": int(label),
            "probability": round(prob, 4)
        }
    except ValueError as e:
        return {"error": str(e)}


@app.get("/")
def index():
    return {"message": "MedMatch API is running."}
