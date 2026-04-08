-- STEP 1: Create the Users table
CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STEP 2: Create the Vendors table
CREATE TABLE vendors (
    id TEXT PRIMARY KEY,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    name TEXT NOT NULL,
    maps_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STEP 3: Create the Activity Logs table
CREATE TABLE activity_logs (
    id TEXT PRIMARY KEY,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    name TEXT NOT NULL,
    vendor TEXT NOT NULL,
    status TEXT CHECK (status IN ('opened', 'failed')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STEP 4: Enable Row Level Security (Optional but recommended)
-- For now, we use the Service Role Key for backend access, so RLS isn't strictly necessary 
-- unless you want to access data directly from the browser.
