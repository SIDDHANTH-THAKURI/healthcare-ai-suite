import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingOverlay } from './LoadingOverlay';

import './Chatbot.css';
import { BASE_URL_1 } from '../base';
import APIKeySettings from './APIKeySettings';
import ExhaustedModal from './ExhaustedModal';
import DoctorUsageIndicator from './DoctorUsageIndicator';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp?: string;
}
const IconAttach = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
);
const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const IconInfo = () => ( // Info icon for the hint
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', marginTop: '-1px' }}>
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default function Chatbot() {
  const navigate = useNavigate();
  const [showUploadHintElement, setShowUploadHintElement] = useState(false);
  const [uploadHintVisibleClass, setUploadHintVisibleClass] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id || "guest";
  const [messages, setMessages] = useState<Message[]>([
    { text: `Hello! I'm MedChat, your AI medical assistant. How can I help you today?`, sender: 'bot', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Chat history state
  const [chatSessions, setChatSessions] = useState<Array<{ id: string, title: string, lastMessage: string, timestamp: Date }>>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  // BYOK states
  const [showSettings, setShowSettings] = useState(false);
  const [showExhaustedModal, setShowExhaustedModal] = useState(false);
  const [isFreeTierExhausted, setIsFreeTierExhausted] = useState(false);
  const [apiUsage, setApiUsage] = useState({
    hasOwnKey: false,
    remaining: 50,
    limit: 50,
    usage: 0
  });
  const endRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages container whenever messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Note: History feature removed - documents are now uploaded directly to the chat system

  // Fetch API usage status
  const fetchApiUsageStatus = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;

      const userData = JSON.parse(user);
      const userId = userData._id || userData.id;

      const response = await fetch(`${BASE_URL_1}/api/api-key/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setApiUsage({
          hasOwnKey: data.hasApiKey,
          remaining: data.remaining,
          limit: data.dailyLimit,
          usage: data.usage || 0
        });
      }
    } catch (error) {
      console.error('Error fetching API usage:', error);
    }
  };

  useEffect(() => {
    fetchApiUsageStatus();
    loadChatSessions();
    startNewChat();
    fetchUploadedDocuments();
  }, []);

  const fetchUploadedDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL_1}/api/documents/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const docs = await response.json();
        setUploadedDocuments(docs);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const deleteDocument = async (documentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL_1}/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setUploadedDocuments(prev => prev.filter(doc => doc._id !== documentId));
        showToast('Document deleted successfully', 'success');
      } else {
        showToast('Failed to delete document', 'error');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast('Error deleting document', 'error');
    }
  };

  const loadChatSessions = () => {
    const saved = localStorage.getItem(`chat_sessions_${userId}`);
    if (saved) {
      const sessions = JSON.parse(saved);
      setChatSessions(sessions.map((s: any) => ({ ...s, timestamp: new Date(s.timestamp) })));
    }
  };

  const saveChatSession = (sessionId: string, messages: Message[]) => {
    if (messages.length <= 1) return; // Don't save if only welcome message

    const sessions = [...chatSessions];
    const existingIndex = sessions.findIndex(s => s.id === sessionId);

    const title = messages.find(m => m.sender === 'user')?.text.substring(0, 50) || 'New Chat';
    const lastMessage = messages[messages.length - 1]?.text.substring(0, 100) || '';

    const session = {
      id: sessionId,
      title,
      lastMessage,
      timestamp: new Date()
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }

    // Keep only last 20 sessions
    const trimmed = sessions.slice(0, 20);
    setChatSessions(trimmed);
    localStorage.setItem(`chat_sessions_${userId}`, JSON.stringify(trimmed));
    localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages));
  };

  const loadChatSession = (sessionId: string) => {
    const saved = localStorage.getItem(`chat_${sessionId}`);
    if (saved) {
      setMessages(JSON.parse(saved));
      setCurrentSessionId(sessionId);
    }
  };

  const startNewChat = () => {
    const newSessionId = `session_${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setMessages([
      { text: `Hello! I'm MedChat, your AI medical assistant. How can I help you today?`, sender: 'bot', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  };

  const deleteChatSession = (sessionId: string) => {
    const updated = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updated);
    localStorage.setItem(`chat_sessions_${userId}`, JSON.stringify(updated));
    localStorage.removeItem(`chat_${sessionId}`);

    if (currentSessionId === sessionId) {
      startNewChat();
    }
  };

  const clearAllChats = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAllChats = () => {
    chatSessions.forEach(s => localStorage.removeItem(`chat_${s.id}`));
    setChatSessions([]);
    localStorage.removeItem(`chat_sessions_${userId}`);
    startNewChat();
    setShowClearConfirm(false);
    showToast('All chat history cleared', 'success');
  };

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFilesToUpload(Array.from(e.target.files));
    e.target.value = '';
  };
  const removeFileToUpload = (idx: number) => setFilesToUpload(f => f.filter((_, i) => i !== idx));

  async function uploadFiles() {
    if (!filesToUpload.length) return;
    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      
      for (const f of filesToUpload) {
        const fd = new FormData();
        fd.append('document', f);
        fd.append('patientId', userId);
        fd.append('documentType', 'medical_history');

        const response = await fetch(`${BASE_URL_1}/api/documents/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: fd
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
          throw new Error(errorData.message || `Upload failed: ${response.status}`);
        }

      }

      setFilesToUpload([]);
      setShowUploadModal(false);
      await fetchUploadedDocuments(); // Refresh the documents list
      showToast(`Successfully uploaded ${filesToUpload.length} document(s)! AI has processed your medical history.`, 'success');
    } catch (err: any) {
      console.error('Upload failed', err);
      showToast(`Upload failed: ${err.message || 'Please try again.'}`, 'error');
    } finally {
      setIsUploading(false);
    }
  }

  async function sendToBackend(question: string): Promise<string> {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL_1}/api/chat/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: userId,
          content: question,
          userId: userId
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error ${res.status}` }));

        // Handle rate limit
        if (res.status === 429) {
          setIsFreeTierExhausted(true);
          setShowExhaustedModal(true);
          throw new Error(errorData.upgradeMessage || 'Daily message limit reached');
        }

        throw new Error(errorData.message || `HTTP error ${res.status}`);
      }
      const data = await res.json();

      // Update usage info
      if (data.remaining !== undefined) {
        setApiUsage(prev => ({
          ...prev,
          remaining: data.remaining,
          hasOwnKey: data.hasOwnKey || false
        }));
      }

      return data.assistantMessage?.content || data.answer || 'No response received';
    } catch (err: any) {
      console.error('Chat error', err);
      return `Sorry, something went wrong: ${err.message || 'Please try again.'}`;
    }
  }

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(msgs => [...msgs, { text: trimmedInput, sender: 'user', timestamp: currentTime }]);
    setInput('');

    const typingIndicatorTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(msgs => [...msgs, { text: '...', sender: 'bot', timestamp: typingIndicatorTimestamp }]);

    const replyText = await sendToBackend(trimmedInput);

    setMessages(msgs => {
      const updatedMsgs = msgs.filter(msg => !(msg.sender === 'bot' && msg.text === '...'));
      const newMessages: Message[] = [...updatedMsgs, {
        text: replyText,
        sender: 'bot' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];

      // Save chat session
      saveChatSession(currentSessionId, newMessages);

      return newMessages;
    });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };




  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);


  useEffect(() => {
    let initialHoldTimerId: NodeJS.Timeout;
    let fadeInTimerId: NodeJS.Timeout;
    let visibilityDurationTimerId: NodeJS.Timeout;
    let finalHideTimerId: NodeJS.Timeout;

    initialHoldTimerId = setTimeout(() => {
      setShowUploadHintElement(true);

      fadeInTimerId = setTimeout(() => {
        setUploadHintVisibleClass(true);
      }, 50);

      visibilityDurationTimerId = setTimeout(() => {
        setUploadHintVisibleClass(false);


        finalHideTimerId = setTimeout(() => {
          setShowUploadHintElement(false);
        }, 400);
      }, 15000);

    }, 5000);


    return () => {
      clearTimeout(initialHoldTimerId);
      clearTimeout(fadeInTimerId);
      clearTimeout(visibilityDurationTimerId);
      clearTimeout(finalHideTimerId);
    };
  }, []);



  const botAvatarUrl = `https://img.icons8.com/fluency/96/chatbot.png`;
  const userAvatarUrl = `https://img.icons8.com/fluency/96/test-account.png`;


  return (
    <div className="chat-app-shell">
      {/* Floating Back Button - Top Left */}
      <button
        className="chatbot-floating-back"
        onClick={() => navigate(-1)}
        title="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      <div className="chat-app-container">
        <LoadingOverlay visible={isUploading} />

        <aside className="history-sidebar">
          <div className="history-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Chat History
            </h2>
            <button
              type="button"
              className="new-chat-btn"
              onClick={startNewChat}
              title="Start new chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>
          </div>

          <div className="history-list">
            {chatSessions.length === 0 && (
              <p className="empty-history">No chat history yet. Start a conversation!</p>
            )}
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`history-item ${currentSessionId === session.id ? 'active-history' : ''}`}
              >
                <button
                  type="button"
                  className="history-item-btn"
                  onClick={() => loadChatSession(session.id)}
                  title={session.title}
                >
                  <p className="history-title">{session.title}</p>
                  <p className="history-date">
                    {new Date(session.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </button>
                <button
                  type="button"
                  className="history-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChatSession(session.id);
                  }}
                  title="Delete chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="history-footer">
            <button
              type="button"
              className="btn-delete-all"
              disabled={chatSessions.length === 0}
              onClick={clearAllChats}
            >
              Clear All History
            </button>
          </div>
        </aside>

        <main className="chat-main-area">
          <header className="chat-area-header">
            <div className="header-info">
              <div className="chat-title">
                <h1>MedChat Assistant</h1>
                <p className="chat-status">Online</p> {/* Or dynamically set status */}
              </div>
            </div>
            <button
              className="view-documents-btn"
              onClick={() => setShowDocumentsModal(true)}
              title="View uploaded medical history"
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <i className="fas fa-file-medical"></i>
              Documents ({uploadedDocuments.length})
            </button>
          </header>

          <div className="messages-display-area" ref={messagesContainerRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}>
                {msg.sender === 'bot' && <img src={botAvatarUrl} alt="Bot Avatar" className="avatar" />}
                <div className="message-content-wrapper">
                  <div className="message-bubble">
                    {msg.text === '...' ? (
                      <div className="typing-dots"><span></span><span></span><span></span></div>
                    ) : (
                      <p className="message-text">{msg.text}</p>
                    )}
                  </div>
                  {msg.timestamp && msg.text !== '...' && <span className="message-timestamp">{msg.timestamp}</span>}
                </div>
                {msg.sender === 'user' && <img src={userAvatarUrl} alt="User Avatar" className="avatar" />}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <footer className="chat-input-area">
            <div className="attach-btn-container"> {/* New wrapper */}
              <button
                type="button"
                className="icon-btn attach-btn"
                onClick={() => setShowUploadModal(true)}
                aria-label="Upload Patient History Documents" // Keep for accessibility
                title="Upload Patient History Documents" // Tooltip is still a good secondary cue
              >
                <IconAttach />
              </button>
              {showUploadHintElement && ( // Conditionally render the hint DIV
                <div className={`upload-indicator-hint ${uploadHintVisibleClass ? 'visible' : ''}`}>
                  <IconInfo />
                  Upload History
                </div>
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Describe your symptoms or ask a question…"
              rows={1}
            />
            <button
              type="button"
              className="icon-btn send-btn"
              disabled={!input.trim() || isUploading}
              onClick={handleSendMessage}
              aria-label="Send message"
            >
              <IconSend />
            </button>
          </footer>
        </main>
      </div>


      {showUploadModal && (
        <div className="modal-overlay" onClick={() => { if (!isUploading) { setFilesToUpload([]); setShowUploadModal(false); } }}>
          <div className="modal-content upload-modal" onClick={e => e.stopPropagation()}>
            <h3>Upload Patient History Documents</h3>
            <div className="upload-info">
              <p>Attach relevant medical history documents.</p>
              <p>Accepted file types: <code>.txt</code>, <code>.pdf</code>, <code>.xls</code>, <code>.xlsx</code>, <code>.ppt</code>, <code>.pptx</code>, <code>.docx</code>.</p>
              <p><small>(Image support: .jpg, .png, .gif - coming soon! Currently under development.)</small></p>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileSelection}
              accept=".txt,.pdf,.xls,.xlsx,.ppt,.pptx,.docx" // Standard office documents
              disabled={isUploading}
            />
            {filesToUpload.length > 0 && (
              <ul className="file-list-preview">
                {filesToUpload.map((f, i) => (
                  <li key={i}>
                    {f.name} ({Math.round(f.size / 1024)} KB)
                    <button type="button" className="remove-file-btn" onClick={() => removeFileToUpload(i)} aria-label={`Remove ${f.name}`} disabled={isUploading}>✕</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-action btn-modal-cancel"
                onClick={() => { setFilesToUpload([]); setShowUploadModal(false); }}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-action btn-modal-upload"
                disabled={!filesToUpload.length || isUploading}
                onClick={uploadFiles}
              >
                {isUploading ? 'Uploading...' : `Upload ${filesToUpload.length} File(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Chats Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b' }}></i>
              Clear All Chat History?
            </h3>
            <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.6' }}>
              Are you sure you want to delete all chat history? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAllChats}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Document Confirmation Modal */}
      {documentToDelete && (
        <div className="modal-overlay" onClick={() => setDocumentToDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b' }}></i>
              Delete Document?
            </h3>
            <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.6' }}>
              The AI will no longer reference this document in conversations. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDocumentToDelete(null)}
                style={{
                  padding: '10px 20px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteDocument(documentToDelete);
                  setDocumentToDelete(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div 
          className="toast-notification"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 10000,
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideInUp 0.3s ease-out'
          }}
        >
          <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : toast.type === 'error' ? 'exclamation-circle' : 'info-circle'}`} style={{ fontSize: '20px' }}></i>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '0',
              opacity: 0.8
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Usage Indicator */}
      <DoctorUsageIndicator
        hasOwnKey={apiUsage.hasOwnKey}
        remaining={apiUsage.remaining}
        limit={apiUsage.limit}
        usage={apiUsage.usage}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Documents Modal */}
      {showDocumentsModal && (
        <div className="modal-overlay" onClick={() => setShowDocumentsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-file-medical"></i>
                Uploaded Medical History
              </h3>
              <button 
                onClick={() => setShowDocumentsModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}
              >
                ×
              </button>
            </div>

            {uploadedDocuments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                <i className="fas fa-folder-open" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                <p>No documents uploaded yet</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Upload medical history documents to help the AI provide personalized responses
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {uploadedDocuments.map((doc) => (
                  <div 
                    key={doc._id} 
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      background: '#f9fafb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <i className="fas fa-file-alt" style={{ color: '#10b981' }}></i>
                          <strong>{doc.fileName}</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                          Uploaded: {new Date(doc.uploadDate).toLocaleDateString()} at {new Date(doc.uploadDate).toLocaleTimeString()}
                        </div>
                        {doc.aiSummary && (
                          <div style={{ 
                            background: 'white', 
                            padding: '12px', 
                            borderRadius: '6px', 
                            fontSize: '14px',
                            border: '1px solid #e5e7eb',
                            marginTop: '8px'
                          }}>
                            <div style={{ fontWeight: '500', marginBottom: '4px', color: '#10b981' }}>
                              <i className="fas fa-robot"></i> AI Summary:
                            </div>
                            {doc.aiSummary}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setDocumentToDelete(doc._id)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title="Delete document"
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => {
                  setShowDocumentsModal(false);
                  setShowUploadModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-plus"></i>
                Upload New Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-container settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowSettings(false)}>
              <i className="fas fa-times"></i>
            </button>
            <APIKeySettings userId={(() => {
              const user = localStorage.getItem('user');
              const userData = user ? JSON.parse(user) : null;
              return userData?._id || userData?.id || '';
            })()} />
          </div>
        </div>
      )}

      {/* Exhausted Modal */}
      {showExhaustedModal && (
        <ExhaustedModal
          onClose={() => setShowExhaustedModal(false)}
          onAddKey={() => {
            setShowExhaustedModal(false);
            setShowSettings(true);
          }}
          isFreeTier={isFreeTierExhausted}
        />
      )}
    </div>
  );
}