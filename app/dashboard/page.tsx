"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Trash2, Plus, LogOut, 
  Building2, User, Calendar, History, 
  X, ExternalLink, RefreshCw, Clipboard
} from 'lucide-react';
import { Toast, ToastType } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import Link_ from 'next/link';

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
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' as ToastType, visible: false });
  
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
      const vRes = await fetch('/api/vendors');
      if (vRes.status === 401) return router.push('/login');
      const vData = await vRes.json();
      setVendors(vData.vendors);
      if (vData.vendors.length > 0 && !selectedVendorId) setSelectedVendorId(vData.vendors[0].id);

      const lRes = await fetch('/api/logs');
      const lData = await lRes.json();
      setLogs(lData.logs);
    } catch (err) {
      showToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: ToastType = 'success') {
    setToast({ message, type, visible: true });
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === selectedVendorId);
    if (!vendor) return showToast('Please select a vendor', 'error');

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
        showToast('WhatsApp link generated!');
        fetchData();
      } else {
        showToast(data.error || 'Generation failed', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
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
        showToast('Vendor added successfully');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to add vendor', 'error');
    } finally {
      setAddingVendor(false);
    }
  }

  async function handleDeleteVendor(id: string) {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await fetch('/api/vendors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      showToast('Vendor deleted');
      fetchData();
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl flex justify-between items-center mb-10 glass px-8 py-5 rounded-[24px] shadow-2xl"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gradient leading-tight">SEO Kampany</h1>
            <p className="text-[10px] text-text-dim uppercase tracking-[.2em] font-bold">Review Request Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-text-dim font-bold uppercase tracking-wider">Session Active</span>
            <span className="text-sm font-bold text-text-main">Welcome Back</span>
          </div>
          <Link_ href="/api/auth/logout" className="p-3 bg-danger/10 text-danger rounded-xl hover:bg-danger hover:text-white transition-all shadow-lg hover:shadow-danger/20">
            <LogOut className="w-5 h-5" />
          </Link_>
        </div>
      </motion.div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* Main Generator Card */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-10 rounded-[40px] relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
          
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Request Review</h2>
          <p className="text-text-dim text-sm mb-10 font-medium">Generate professional WhatsApp review links instantly.</p>

          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Select Vendor
              </label>
              <div className="relative">
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full bg-slate-900/40 border border-glass-border rounded-2xl p-4 focus:outline-none focus:border-primary appearance-none transition-all cursor-pointer font-medium"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id} className="bg-[#030712]">{v.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim">
                  <X className="w-4 h-4 rotate-45" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Customer Name
              </label>
              <input
                type="text"
                placeholder="Ex. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-900/40 border border-glass-border rounded-2xl p-4 focus:outline-none focus:border-primary transition-all font-medium"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                <Send className="w-3 h-3" /> Phone Number
              </label>
              <input
                type="text"
                placeholder="Ex. 919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900/40 border border-glass-border rounded-2xl p-4 focus:outline-none focus:border-primary transition-all font-medium"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={generating}
                className="flex-[2] py-4 rounded-2xl btn-primary font-black text-white flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Generate & Open Link
              </button>
              
              <button
                type="button"
                onClick={() => setShowVendorModal(true)}
                className="flex-1 py-4 bg-white/5 border border-glass-border text-text-main rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Vendors
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right Status Panel */}
        <div className="flex flex-col gap-8">
          {/* Activity Logs */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-8 rounded-[40px] flex flex-col h-[450px] shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  <History className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Activity</h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-dim px-3 py-1 bg-white/5 rounded-full border border-glass-border">Live Feed</span>
            </div>
            
            <div className="overflow-y-auto space-y-4 pr-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-20 text-text-dim text-sm font-medium italic opacity-50"
                  >
                    No recent activity to show
                  </motion.div>
                ) : logs.map((log, index) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-5 glass-morphism rounded-[24px] group"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-sm tracking-tight">{log.name}</span>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-tighter">
                        <span className="text-accent">{log.vendor}</span>
                        <span className="opacity-30">•</span>
                        <span>{log.phone}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border",
                      log.status === 'opened' ? "bg-primary/10 text-primary border-primary/20" : "bg-danger/10 text-danger border-danger/20"
                    )}>
                      {log.status}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Quick Config */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-8 rounded-[32px] group relative overflow-hidden shadow-2xl"
          >
             <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                <Settings className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Active Config</h2>
            </div>

            {selectedVendor ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="p-5 glass-morphism rounded-2xl flex flex-col gap-1">
                  <p className="text-[10px] text-text-dim uppercase font-black tracking-widest">Business</p>
                  <p className="font-black text-accent text-lg">{selectedVendor.name}</p>
                </div>
                <div className="p-5 glass-morphism rounded-2xl flex flex-col gap-2 relative group-hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                     onClick={() => {
                       navigator.clipboard.writeText(selectedVendor.maps_link);
                       showToast("Link copied to clipboard");
                     }}>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-text-dim uppercase font-black tracking-widest">G-Maps Link</p>
                    <Clipboard className="w-3 h-3 text-primary opacity-50 group-hover:opacity-100" />
                  </div>
                  <p className="text-[10px] break-all text-primary font-mono truncate">{selectedVendor.maps_link}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center glass-morphism rounded-2xl border-dashed border-glass-border">
                <p className="text-text-dim text-sm font-medium italic">Configure a vendor to begin</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-[10px] font-black uppercase tracking-[.4em] text-text-dim/50">Designed for Premium Enterprises • SEO Kampany v2.0</p>
      </motion.div>

      {/* Vendor Management Modal */}
      <AnimatePresence>
        {showVendorModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowVendorModal(false)}
              className="absolute inset-0 bg-[#030712]/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass w-full max-w-2xl p-10 rounded-[48px] relative shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
              
              <button 
                onClick={() => setShowVendorModal(false)}
                className="absolute top-8 right-8 p-3 text-text-dim hover:text-white hover:bg-white/5 rounded-2xl transition-all z-20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Business Logic</h2>
                  <p className="text-text-dim text-sm font-bold uppercase tracking-widest">Manage your vendor ecosystem</p>
                </div>
              </div>
              
              <form onSubmit={handleAddVendor} className="mb-12 p-8 glass-morphism rounded-[32px] space-y-6 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[.2em] text-primary">Provision New Vendor</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Company Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Binateeq"
                      value={newVendorName}
                      onChange={(e) => setNewVendorName(e.target.value)}
                      className="w-full bg-slate-900 border border-glass-border rounded-2xl p-4 text-sm focus:border-primary outline-none transition-all font-bold"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Google Maps ID/URL</label>
                    <input 
                      type="text" 
                      placeholder="https://g.page/r/..."
                      value={newVendorLink}
                      onChange={(e) => setNewVendorLink(e.target.value)}
                      className="w-full bg-slate-900 border border-glass-border rounded-2xl p-4 text-sm focus:border-primary outline-none transition-all font-bold"
                      required 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={addingVendor}
                  className="w-full py-5 btn-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 text-sm tracking-widest uppercase shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  {addingVendor ? 'Processing...' : 'Deploy Vendor Config'}
                </button>
              </form>

              <div className="max-h-[350px] overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                {vendors.length === 0 ? (
                  <div className="text-center py-16 text-text-dim text-sm font-bold uppercase tracking-widest border-2 border-dashed border-glass-border rounded-[32px] opacity-40">
                    Database Empty
                  </div>
                ) : vendors.map((v, i) => (
                  <motion.div 
                    key={v.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-6 glass-morphism rounded-[24px] group hover:border-primary/20 transition-all border border-transparent"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all border border-glass-border">
                        <Building2 className="w-6 h-6 text-text-dim group-hover:text-primary transition-all" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-base tracking-tight">{v.name}</span>
                        <div className="flex items-center gap-2">
                           <ExternalLink className="w-3 h-3 text-primary opacity-50" />
                           <span className="text-[11px] text-primary/80 font-mono truncate max-w-[250px] font-bold">{v.maps_link}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteVendor(v.id)}
                      className="p-3 text-danger/40 hover:text-danger hover:bg-danger/10 rounded-2xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}

// Fixed Lucide icons for the dashboard
function Settings({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
