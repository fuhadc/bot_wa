"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, Trash2, Plus, LogOut, 
  Building2, User, Calendar, History, 
  X, ExternalLink, RefreshCw 
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  maps_link: string;
}

interface ActivityLog {
  id: string;
  name: string;
  phone: string;
  vendor: string;
  status: 'opened' | 'failed';
  timestamp: string;
}

export default function DashboardPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [generating, setGenerating] = useState(false);

  // Modal states
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorLink, setNewVendorLink] = useState('');
  const [addingVendor, setAddingVendor] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Get vendors
      const vRes = await fetch('/api/vendors');
      if (vRes.status === 401) return router.push('/login');
      const vData = await vRes.json();
      setVendors(vData.vendors);
      if (vData.vendors.length > 0) setSelectedVendorId(vData.vendors[0].id);

      // Get logs
      const lRes = await fetch('/api/logs');
      const lData = await lRes.json();
      setLogs(lData.logs);

      // Get username from cookie (would need an API for this or just pass as header)
      // For now we'll just show "User" or fetch it
      setUsername('User'); 
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === selectedVendorId);
    if (!vendor) return alert('Select a vendor first');

    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName,
          phone,
          vendor: vendor.name,
          maps_link: vendor.maps_link
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.open(data.wa_link, '_blank');
        setCustomerName('');
        setPhone('');
        fetchData(); // Refresh logs
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to generate link');
    } finally {
      setGenerating(false);
    }
  }

  async function handleAddVendor(e: React.FormEvent) {
    e.preventDefault();
    setAddingVendor(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVendorName, maps_link: newVendorLink }),
      });
      const data = await res.json();
      if (data.success) {
        setNewVendorName('');
        setNewVendorLink('');
        setShowVendorModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Failed to add vendor');
    } finally {
      setAddingVendor(false);
    }
  }

  async function handleDeleteVendor(id: string) {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch('/api/vendors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 glass px-6 py-4 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-gradient">SEO Kampany</h1>
          <p className="text-xs text-text-dim">Dashboard Overview</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-sm text-text-dim">Logged in as <strong className="text-text-main">User</strong></span>
          <Link href="/api/auth/logout" className="p-2 bg-danger/10 text-danger rounded-lg hover:bg-danger hover:text-white transition-all">
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* Form Card */}
        <div className="glass p-8 rounded-[32px] flex flex-col">
          <h2 className="text-2xl font-bold mb-2">Request Review</h2>
          <p className="text-text-dim text-sm mb-8">Generate a WhatsApp link with customer details.</p>

          <form onSubmit={handleGenerate} className="space-y-6 flex-grow">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Select Vendor</label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full bg-slate-900/50 border border-glass-border rounded-xl p-3 focus:outline-none focus:border-primary appearance-none transition-all"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id} className="bg-slate-900">{v.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Customer Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-900/50 border border-glass-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Phone (with country code)</label>
              <input
                type="text"
                placeholder="919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900/50 border border-glass-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-4 bg-gradient-to-br from-primary to-primary-dark rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {generating ? 'Generating...' : 'Generate WhatsApp Link'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowVendorModal(true)}
              className="w-full py-3 border border-primary text-primary rounded-xl font-bold hover:bg-primary/10 transition-all text-sm"
            >
              Manage Vendors
            </button>
          </form>
        </div>

        {/* Right Status Panel */}
        <div className="flex flex-col gap-8">
          {/* Logs Card */}
          <div className="glass p-8 rounded-[32px] flex flex-col h-[400px]">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold text-text-main">Recent Activity</h2>
            </div>
            
            <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-text-dim text-sm italic">No recent logs found</div>
              ) : logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-white/5 border border-glass-border rounded-2xl hover:bg-white/10 transition-all">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{log.name}</span>
                    <span className="text-[10px] text-text-dim uppercase tracking-tighter">{log.vendor} • {log.phone}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                    log.status === 'opened' ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="glass p-8 rounded-[32px]">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold">Quick Config</h2>
            </div>
            {selectedVendor ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-glass-border">
                  <p className="text-xs text-text-dim uppercase mb-1">Current Vendor</p>
                  <p className="font-bold text-accent">{selectedVendor.name}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-glass-border">
                  <p className="text-xs text-text-dim uppercase mb-1">Review Link</p>
                  <p className="text-xs break-all text-primary font-mono">{selectedVendor.maps_link}</p>
                </div>
              </div>
            ) : (
              <p className="text-text-dim text-sm italic py-4">Add a vendor to see configuration.</p>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Management Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass w-full max-w-xl p-8 rounded-[32px] relative animate-in zoom-in duration-300">
            <button 
              onClick={() => setShowVendorModal(false)}
              className="absolute top-6 right-6 p-2 text-text-dim hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-6">Manage Vendors</h2>
            
            <form onSubmit={handleAddVendor} className="mb-8 p-6 bg-white/5 border border-glass-border rounded-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-2">Add New Vendor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Business Name"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="bg-slate-900/50 border border-glass-border rounded-xl p-3 text-sm focus:border-primary outline-none"
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Review Link (URL)"
                  value={newVendorLink}
                  onChange={(e) => setNewVendorLink(e.target.value)}
                  className="bg-slate-900/50 border border-glass-border rounded-xl p-3 text-sm focus:border-primary outline-none"
                  required 
                />
              </div>
              <button 
                type="submit" 
                disabled={addingVendor}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
              >
                <Plus className="w-4 h-4" />
                {addingVendor ? 'Adding...' : 'Add Vendor'}
              </button>
            </form>

            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {vendors.length === 0 ? (
                <div className="text-center py-8 text-text-dim text-sm italic border border-dashed border-glass-border rounded-2xl">
                  No vendors added yet
                </div>
              ) : vendors.map(v => (
                <div key={v.id} className="flex items-center justify-between p-4 bg-slate-900/40 border border-glass-border rounded-2xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{v.name}</span>
                    <span className="text-[10px] text-primary truncate max-w-[200px]">{v.maps_link}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteVendor(v.id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Styles for custom scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

// Helper Link component since we need standard <a> for logout or router
function Link({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
  if (href.startsWith('/api')) {
    return <a href={href} className={className}>{children}</a>;
  }
  return <Link_ href={href} className={className}>{children}</Link_>;
}
import { default as Link_ } from 'next/link';
