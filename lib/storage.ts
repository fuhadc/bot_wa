import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

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

// --- User Management ---

export async function addUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
  const { data: existingUser } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();
  
  if (existingUser) {
    return { success: false, message: "Username already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const { error } = await supabase
    .from('users')
    .insert([{ username, password_hash: passwordHash }]);

  if (error) {
    return { success: false, message: "Failed to register user in database" };
  }

  return { success: true, message: "User registered successfully" };
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const { data: user, error } = await supabase
    .from('users')
    .select('username, password_hash')
    .eq('username', username)
    .single();

  if (error || !user) return null;

  const hash = user.password_hash;
  if (!hash) return null;

  // Check if it's a bcrypt hash
  if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
    if (await bcrypt.compare(password, hash)) {
      return {
        username: user.username,
        passwordHash: user.password_hash
      } as User;
    }
  }
  
  return null;
}

// --- Vendor Management ---

export async function getVendors(username: string): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('username', username);

  if (error) return [];
  return data as Vendor[];
}

export async function addVendor(username: string, name: string, maps_link: string): Promise<Vendor | null> {
  const newVendor = {
    id: Math.random().toString(36).substring(2, 9),
    username,
    name,
    maps_link
  };

  const { error } = await supabase
    .from('vendors')
    .insert([newVendor]);

  if (error) return null;
  return newVendor;
}

export async function deleteVendor(username: string, vendorId: string): Promise<void> {
  await supabase
    .from('vendors')
    .delete()
    .eq('id', vendorId)
    .eq('username', username);
}

// --- Logging ---

export async function getLogs(username: string): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('username', username)
    .order('timestamp', { ascending: false });

  if (error) return [];
  return data as ActivityLog[];
}

export async function saveLog(username: string, phone: string, name: string, vendor: string, status: 'opened' | 'failed'): Promise<ActivityLog | null> {
  const newLog = {
    id: Math.random().toString(36).substring(2, 9),
    username,
    phone,
    name,
    vendor,
    status,
    timestamp: new Date().toISOString()
  };

  const { error } = await supabase
    .from('activity_logs')
    .insert([newLog]);

  if (error) return null;
  return newLog as ActivityLog;
}
