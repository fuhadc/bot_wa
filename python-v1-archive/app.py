from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from config import MESSAGE_TEMPLATE, DEFAULT_VENDOR, DEFAULT_MAPS_LINK
from generator import generate_message, generate_wa_link
from storage import save_log, get_logs, get_vendors, add_vendor, delete_vendor, verify_user, add_user
import logging
from functools import wraps
import os

app = Flask(__name__)
app.secret_key = os.urandom(24) # Random secret key for session management

# Disable default flask logging for cleaner output
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# --- Authentication Decorator ---

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            # Check if the request is an AJAX request or expects JSON
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or \
               request.is_json or \
               'application/json' in request.headers.get('Accept', ''):
                return jsonify({"success": False, "error": "Session expired", "redirect": "/login"}), 401
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# --- Authentication Routes ---

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if verify_user(username, password):
            session['username'] = username
            return redirect(url_for('index'))
        return render_template('login.html', error="Invalid username or password")
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if not username or not password:
            return render_template('register.html', error="Both fields are required")
        
        success, message = add_user(username, password)
        if success:
            return render_template('register.html', message="Account created! You can now login.")
        return render_template('register.html', error=message)
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

# --- Dashboard Routes ---

@app.route('/')
@login_required
def index():
    username = session['username']
    logs = get_logs(username)
    vendors = get_vendors(username)
    # Sort logs by timestamp (newest first)
    logs = sorted(logs, key=lambda x: x.get('timestamp', ''), reverse=True)
    return render_template(
        'index.html', 
        username=username,
        logs=logs[:10],
        vendors=vendors,
        default_vendor=DEFAULT_VENDOR,
        default_maps_link=DEFAULT_MAPS_LINK
    )

@app.route('/vendors', methods=['POST'])
@login_required
def handle_add_vendor():
    username = session['username']
    data = request.json
    name = data.get('name')
    maps_link = data.get('maps_link')
    if name and maps_link:
        vendor = add_vendor(username, name, maps_link)
        return jsonify({"success": True, "vendor": vendor})
    return jsonify({"success": False, "error": "Name and link required"}), 400

@app.route('/vendors/<vendor_id>', methods=['DELETE'])
@login_required
def handle_delete_vendor(vendor_id):
    username = session['username']
    delete_vendor(username, vendor_id)
    return jsonify({"success": True})

@app.route('/generate', methods=['POST'])
@login_required
def generate():
    username = session['username']
    data = request.json
    name = data.get('name')
    phone = data.get('phone')
    vendor = data.get('vendor', DEFAULT_VENDOR)
    maps_link = data.get('maps_link', DEFAULT_MAPS_LINK)

    if not name or not phone:
        return jsonify({"success": False, "error": "Name and Phone are required"}), 400

    try:
        message = generate_message(name, vendor, maps_link)
        wa_link = generate_wa_link(phone, message)
        
        # Log scoped to current user
        save_log(username, phone, name, vendor, "opened")
        
        return jsonify({
            "success": True, 
            "wa_link": wa_link
        })
    except Exception as e:
        save_log(username, phone, name, vendor, "failed")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # Listen on 0.0.0.0 and use the PORT environment variable provided by Render
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 WhatsApp Review Tool starting at http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
