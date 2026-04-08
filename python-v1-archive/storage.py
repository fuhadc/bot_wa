import json
import os
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

LOG_FILE = "logs.json"
VENDORS_FILE = "vendors.json"
USERS_FILE = "users.json"

# --- User Management ---

def get_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        try:
            return json.load(f).get("users", [])
        except json.JSONDecodeError:
            return []

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump({"users": users}, f, indent=2)

def add_user(username, password):
    users = get_users()
    if any(u['username'] == username for u in users):
        return False, "Username already exists"
    
    password_hash = generate_password_hash(password)
    users.append({
        "username": username,
        "password_hash": password_hash
    })
    save_users(users)
    return True, "User created successfully"

def verify_user(username, password):
    users = get_users()
    user = next((u for u in users if u['username'] == username), None)
    if user and check_password_hash(user['password_hash'], password):
        return True
    return False

# --- Log Management (Scoped) ---

def save_log(username, phone, name, vendor, status):
    """Saves a log entry scoped to a user."""
    log_entry = {
        "username": username,
        "phone": phone,
        "name": name,
        "vendor": vendor,
        "status": status,
        "timestamp": datetime.now().isoformat()
    }

    if not os.path.exists(LOG_FILE):
        data = {"logs": []}
    else:
        with open(LOG_FILE, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = {"logs": []}

    data["logs"].append(log_entry)
    with open(LOG_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_logs(username):
    """Retrieves logs for a specific user."""
    if not os.path.exists(LOG_FILE):
        return []
    with open(LOG_FILE, "r") as f:
        try:
            data = json.load(f)
            logs = data.get("logs", [])
            return [l for l in logs if l.get("username") == username]
        except json.JSONDecodeError:
            return []

# --- Vendor Management (Scoped) ---

def get_vendors(username):
    """Retrieves vendors for a specific user."""
    if not os.path.exists(VENDORS_FILE):
        return []
    with open(VENDORS_FILE, "r") as f:
        try:
            data = json.load(f)
            vendors = data.get("vendors", [])
            return [v for v in vendors if v.get("username") == username]
        except json.JSONDecodeError:
            return []

def save_vendors(vendors):
    """Saves the entire list of vendors."""
    with open(VENDORS_FILE, "w") as f:
        json.dump({"vendors": vendors}, f, indent=2)

def add_vendor(username, name, maps_link):
    """Adds a new vendor scoped to a user."""
    # Load ALL vendors to maintain the full list
    if not os.path.exists(VENDORS_FILE):
        all_vendors = []
    else:
        with open(VENDORS_FILE, "r") as f:
            try:
                all_vendors = json.load(f).get("vendors", [])
            except json.JSONDecodeError:
                all_vendors = []

    vendor_id = f"v{len(all_vendors) + 1}_{int(datetime.now().timestamp())}"
    new_vendor = {
        "id": vendor_id,
        "username": username,
        "name": name,
        "maps_link": maps_link
    }
    all_vendors.append(new_vendor)
    save_vendors(all_vendors)
    return new_vendor

def delete_vendor(username, vendor_id):
    """Removes a vendor if it belongs to the user."""
    if not os.path.exists(VENDORS_FILE):
        return
    
    with open(VENDORS_FILE, "r") as f:
        try:
            all_vendors = json.load(f).get("vendors", [])
        except json.JSONDecodeError:
            return

    # Filter out the vendor only if it matches ID AND username
    all_vendors = [v for v in all_vendors if not (v["id"] == vendor_id and v["username"] == username)]
    save_vendors(all_vendors)
