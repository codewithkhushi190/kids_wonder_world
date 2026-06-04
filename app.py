from flask import Flask, render_template, request, jsonify, session
import sqlite3

app = Flask(__name__)
app.secret_key = "super_secret_key_for_kids_game"

def init_db():
    conn = sqlite3.connect('kids_game.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users 
                      (id INTEGER PRIMARY KEY, username TEXT, password TEXT, 
                       score INTEGER DEFAULT 0, simple INTEGER DEFAULT 0, 
                       moderate INTEGER DEFAULT 0, difficult INTEGER DEFAULT 0)''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    return render_template('index.html')

# NAYA ROUTE: Registration ke liye
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = sqlite3.connect('kids_game.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"status": "error", "message": "This name is already registered! choose another name."}), 400
        
    cursor.execute("INSERT INTO users (username, password) VALUES (?,?)", (username, password))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": "Account is created! please log in."})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = sqlite3.connect('kids_game.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({"status": "error", "message": "User not found! please register first."}), 404
    else:
        if user[2] != password:
            conn.close()
            return jsonify({"status": "error", "message": "wrong password!"}), 401
    
    session['user'] = username
    
    # User ke saare levels frontend par bhejein
    progress = {
        "score": user[3],
        "simple": user[4],
        "moderate": user[5],
        "difficult": user[6]
    }
    conn.close()
    return jsonify({"status": "success", "username": username, "progress": progress})

# NAYA ROUTE: Jab koi level clear ho toh database update karein
@app.route('/api/update_progress', methods=['POST'])
def update_progress():
    if 'user' in session:
        data = request.json
        mode = data.get('mode')
        new_level = data.get('level')
        
        if mode in ['simple', 'moderate', 'difficult']:
            conn = sqlite3.connect('kids_game.db')
            cursor = conn.cursor()
            
            # Us mode ka level update karein
            cursor.execute(f"UPDATE users SET {mode} = ? WHERE username = ?", (new_level, session['user']))
            
            # Total score ko recalculate karein
            cursor.execute("SELECT simple, moderate, difficult FROM users WHERE username=?", (session['user'],))
            row = cursor.fetchone()
            total_score = row[0] + row[1] + row[2]
            
            cursor.execute("UPDATE users SET score = ? WHERE username = ?", (total_score, session['user']))
            conn.commit()
            conn.close()
            return jsonify({"status": "success"})
    return jsonify({"status": "error"}), 401

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
