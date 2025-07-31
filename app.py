from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize database
def init_db():
    conn = sqlite3.connect('chat.db')
    cursor = conn.cursor()
    
    # Create sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            message_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    
    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/chat-handler', methods=['POST'])
def chat_handler():
    try:
        data = request.json
        action = data.get('action')
        
        if action == 'get_all_sessions':
            return get_all_sessions()
        elif action == 'new_chat':
            return create_new_chat(data.get('title', 'New Chat'))
        elif action == 'get_session':
            return get_session(data.get('sessionId'))
        elif action == 'send_message':
            return send_message(data.get('sessionId'), data.get('message'))
        else:
            return jsonify({"success": False, "error": "Unknown action"}), 400
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def get_all_sessions():
    conn = sqlite3.connect('chat.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, title, message_count, created_at, updated_at 
        FROM sessions 
        ORDER BY updated_at DESC
    ''')
    
    sessions = []
    for row in cursor.fetchall():
        sessions.append({
            'id': row[0],
            'title': row[1],
            'message_count': row[2],
            'created_at': row[3],
            'updated_at': row[4]
        })
    
    conn.close()
    return jsonify({"success": True, "sessions": sessions})

def create_new_chat(title):
    session_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    conn = sqlite3.connect('chat.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO sessions (id, title, message_count, created_at, updated_at)
        VALUES (?, ?, 0, ?, ?)
    ''', (session_id, title, now, now))
    
    conn.commit()
    
    session = {
        'id': session_id,
        'title': title,
        'message_count': 0,
        'created_at': now,
        'updated_at': now
    }
    
    conn.close()
    return jsonify({"success": True, "session": session})

def get_session(session_id):
    conn = sqlite3.connect('chat.db')
    cursor = conn.cursor()
    
    # Get session
    cursor.execute('SELECT id, title, message_count, created_at, updated_at FROM sessions WHERE id = ?', (session_id,))
    session_row = cursor.fetchone()
    
    if not session_row:
        conn.close()
        return jsonify({"success": False, "error": "Session not found"}), 404
    
    session = {
        'id': session_row[0],
        'title': session_row[1],
        'message_count': session_row[2],
        'created_at': session_row[3],
        'updated_at': session_row[4]
    }
    
    # Get messages
    cursor.execute('''
        SELECT id, role, content, created_at 
        FROM messages 
        WHERE session_id = ? 
        ORDER BY created_at ASC
    ''', (session_id,))
    
    messages = []
    for row in cursor.fetchall():
        messages.append({
            'id': row[0],
            'role': row[1],
            'content': row[2],
            'created_at': row[3]
        })
    
    conn.close()
    return jsonify({"success": True, "session": session, "messages": messages})

def send_message(session_id, message_content):
    conn = sqlite3.connect('chat.db')
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    
    # Add user message
    user_message_id = str(uuid.uuid4())
    cursor.execute('''
        INSERT INTO messages (id, session_id, role, content, created_at)
        VALUES (?, ?, 'user', ?, ?)
    ''', (user_message_id, session_id, message_content, now))
    
    # Generate bot response (simple echo for now)
    bot_response = f"Echo: {message_content}"
    bot_message_id = str(uuid.uuid4())
    cursor.execute('''
        INSERT INTO messages (id, session_id, role, content, created_at)
        VALUES (?, ?, 'assistant', ?, ?)
    ''', (bot_message_id, session_id, bot_response, now))
    
    # Update session message count and timestamp
    cursor.execute('''
        UPDATE sessions 
        SET message_count = message_count + 2, updated_at = ?
        WHERE id = ?
    ''', (now, session_id))
    
    conn.commit()
    
    # Get updated session and messages
    cursor.execute('SELECT id, title, message_count, created_at, updated_at FROM sessions WHERE id = ?', (session_id,))
    session_row = cursor.fetchone()
    
    session = {
        'id': session_row[0],
        'title': session_row[1],
        'message_count': session_row[2],
        'created_at': session_row[3],
        'updated_at': session_row[4]
    }
    
    cursor.execute('''
        SELECT id, role, content, created_at 
        FROM messages 
        WHERE session_id = ? 
        ORDER BY created_at ASC
    ''', (session_id,))
    
    messages = []
    for row in cursor.fetchall():
        messages.append({
            'id': row[0],
            'role': row[1],
            'content': row[2],
            'created_at': row[3]
        })
    
    conn.close()
    return jsonify({"success": True, "session": session, "messages": messages})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)