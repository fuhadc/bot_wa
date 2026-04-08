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
  const users: User[] = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  
  if (users.find(u => u.username === username)) {
    return { success: false, message: "Username already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  return { success: true, message: "User registered successfully" };
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const users: User[] = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const user = users.find(u => u.username === username);
  
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    return user;
  }
  return null;
}

// --- Vendor Management ---

export function getVendors(username: string): Vendor[] {
  const vendors: Vendor[] = JSON.parse(fs.readFileSync(VENDORS_FILE, 'utf-8'));
  return vendors.filter(v => v.username === username);
}

export function addVendor(username: string, name: string, maps_link: string): Vendor {
  const vendors: Vendor[] = JSON.parse(fs.readFileSync(VENDORS_FILE, 'utf-8'));
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
  const vendors: Vendor[] = JSON.parse(fs.readFileSync(VENDORS_FILE, 'utf-8'));
  const filtered = vendors.filter(v => !(v.id === vendorId && v.username === username));
  fs.writeFileSync(VENDORS_FILE, JSON.stringify(filtered, null, 2));
}

// --- Logging ---

export function getLogs(username: string): ActivityLog[] {
  const logs: ActivityLog[] = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
  return logs.filter(l => l.username === username);
}

export function saveLog(username: string, phone: string, name: string, vendor: string, status: 'opened' | 'failed'): ActivityLog {
  const logs: ActivityLog[] = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
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
