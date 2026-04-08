import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const VENDORS_FILE = path.join(DATA_DIR, 'vendors.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// Types
export interface User {
  username: string;
  passwordHash: string;
}

export interface Vendor {
  id: string;
  username: string; // scoped to user
  name: string;
  maps_link: string;
}

export interface ActivityLog {
  id: string;
  username: string;
  phone: string;
  name: string;
  vendor: string;
  status: 'opened' | 'failed';
  timestamp: string;
}

// Ensure data directory and files exist
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  if (!fs.existsSync(VENDORS_FILE)) fs.writeFileSync(VENDORS_FILE, JSON.stringify([]));
  if (!fs.existsSync(LOGS_FILE)) fs.writeFileSync(LOGS_FILE, JSON.stringify([]));
}

initStorage();

// --- User Management ---

export async function addUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
  const usersJson = fs.readFileSync(USERS_FILE, 'utf-8');
  let users: any[] = [];
  try {
    users = JSON.parse(usersJson);
    if (!Array.isArray(users)) users = [];
  } catch (e) {
    users = [];
  }
  
  if (users.find(u => u.username === username)) {
    return { success: false, message: "Username already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  return { success: true, message: "User registered successfully" };
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const usersJson = fs.readFileSync(USERS_FILE, 'utf-8');
  let users: any[] = [];
  try {
    users = JSON.parse(usersJson);
    if (!Array.isArray(users)) users = [];
  } catch (e) {
    users = [];
  }

  const user = users.find(u => u.username === username);
  
  if (user) {
    // Handle both legacy and new field names
    const hash = user.passwordHash || user.password_hash;
    if (!hash) return null;

    // Check if it's a bcrypt hash
    if (hash.startsWith('$2b$')) {
      if (await bcrypt.compare(password, hash)) {
        return user as User;
      }
    } else {
      // It's a legacy Python hash (scrypt), we can't easily verify it here
      // To be safe, we'll return null and expect the user to re-register
      // or we can implement a legacy check later.
      return null;
    }
  }
  return null;
}

// --- Vendor Management ---

export function getVendors(username: string): Vendor[] {
  try {
    const vendors: Vendor[] = JSON.parse(fs.readFileSync(VENDORS_FILE, 'utf-8'));
    return Array.isArray(vendors) ? vendors.filter(v => v.username === username) : [];
  } catch (e) {
    return [];
  }
}

export function addVendor(username: string, name: string, maps_link: string): Vendor {
  let vendors: Vendor[] = [];
  try {
    vendors = JSON.parse(fs.readFileSync(VENDORS_FILE, 'utf-8'));
    if (!Array.isArray(vendors)) vendors = [];
  } catch (e) {
    vendors = [];
  }

  const newVendor: Vendor = {
    id: Math.random().toString(36).substring(2, 9),
    username,
    name,
    maps_link
  };
  vendors.push(newVendor);
  fs.writeFileSync(VENDORS_FILE, JSON.stringify(vendors, null, 2));
  return newVendor;
}

export function deleteVendor(username: string, vendorId: string): void {
  try {
    const vendors: Vendor[] = JSON.parse(fs.readFileSync(VENDORS_FILE, 'utf-8'));
    if (!Array.isArray(vendors)) return;
    const filtered = vendors.filter(v => !(v.id === vendorId && v.username === username));
    fs.writeFileSync(VENDORS_FILE, JSON.stringify(filtered, null, 2));
  } catch (e) {
    // Ignore errors
  }
}

// --- Logging ---

export function getLogs(username: string): ActivityLog[] {
  try {
    const logs: ActivityLog[] = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
    return Array.isArray(logs) ? logs.filter(l => l.username === username) : [];
  } catch (e) {
    return [];
  }
}

export function saveLog(username: string, phone: string, name: string, vendor: string, status: 'opened' | 'failed'): ActivityLog {
  let logs: ActivityLog[] = [];
  try {
    logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
    if (!Array.isArray(logs)) logs = [];
  } catch (e) {
    logs = [];
  }

  const newLog: ActivityLog = {
    id: Math.random().toString(36).substring(2, 9),
    username,
    phone,
    name,
    vendor,
    status,
    timestamp: new Date().toISOString()
  };
  logs.push(newLog);
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
  return newLog;
}
