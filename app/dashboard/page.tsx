"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Trash2, Plus, LogOut, 
  Building2, User, History, 
  X, ExternalLink, RefreshCw, Clipboard,
  Settings
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
      setVendors(vData.vendors || []);
      if (vData.vendors?.length > 0 && !selectedVendorId) setSelectedVendorId(vData.vendors[0].id);

      const lRes = await fetch('/api/logs');
      const lData = await lRes.json();
      setLogs(lData.logs || []);
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
    <div className="min-h-screen p-6 md:p-12 lg:p-16 flex flex-col items-center max-w-[1920px] mx-auto">
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
        className="w-full max-w-6xl flex justify-between items-center mb-12 glass px-10 py-6 rounded-[32px] shadow-2xl"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gradient leading-tight tracking-tight">SEO Kampany</h1>
            <p className="text-[10px] text-text-dim uppercase tracking-[.3em] font-bold opacity-80">Enterprise Review Ecosystem</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-text-dim font-black uppercase tracking-[.2em] mb-1">Authenticated Session</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-text-main">System Administrator</span>
            </div>
          </div>
          <Link_ href="/api/auth/logout" className="p-4 bg-danger/10 text-danger rounded-2xl hover:bg-danger hover:text-white transition-all shadow-xl hover:shadow-danger/30 group">
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Link_>
        </div>
      </motion.div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        
        {/* Main Generator Card */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-12 rounded-[48px] relative overflow-hidden group shadow-2xl flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
          
          <div>
            <h2 className="text-4xl font-black mb-3 tracking-tighter text-text-main">Request Review</h2>
            <p className="text-text-dim text-base mb-10 font-medium leading-relaxed opacity-80">Empower your business growth with instant WhatsApp feedback links.</p>

            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-text-dim uppercase tracking-[.25em] flex items-center gap-3 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Select Vendor Profile
                </label>
                <div className="relative group/select">
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl h-[72px] px-6 focus:outline-none focus:border-primary/50 appearance-none transition-all cursor-pointer font-bold text-lg text-text-main shadow-inner"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id} className="bg-[#030712]">{v.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim group-hover/select:text-primary transition-colors">
                    <Plus className="w-5 h-5 rotate-45" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-text-dim uppercase tracking-[.25em] flex items-center gap-3 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Customer Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter customer full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl h-[72px] px-6 focus:outline-none focus:border-primary/50 transition-all font-bold text-lg tracking-tight shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-text-dim uppercase tracking-[.25em] flex items-center gap-3 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> WhatsApp Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex. 919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl h-[72px] px-6 focus:outline-none focus:border-primary/50 transition-all font-bold text-lg shadow-inner"
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 pt-12">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-[2] h-[72px] rounded-2xl btn-primary font-black text-white flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 text-lg uppercase tracking-widest shadow-2xl"
            >
              {generating ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              Dispatch Request
            </button>
            
            <button
              type="button"
              onClick={() => setShowVendorModal(true)}
              className="flex-1 h-[72px] bg-white/5 border border-white/10 text-text-main rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter text-sm"
            >
              <Building2 className="w-5 h-5 text-primary" />
              Profiles
            </button>
          </div>
        </motion.div>

        {/* Right Status Panel */}
        <div className="flex flex-col gap-10">
          {/* Activity Logs */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-12 rounded-[48px] flex flex-col h-[520px] shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  <History className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-text-main">Recent Activity</h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[.25em] text-text-dim px-4 py-2 bg-white/5 rounded-full border border-white/5">System Logs</span>
            </div>
            
            <div className="overflow-y-auto space-y-5 pr-4 custom-scrollbar flex-grow">
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-28 text-text-dim text-sm font-bold uppercase tracking-widest opacity-30 italic"
                  >
                    No operational data detected
                  </motion.div>
                ) : logs.map((log, index) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-7 glass-morphism rounded-[32px] group hover:border-accent/30 transition-all border border-transparent shadow-lg"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="font-black text-lg tracking-tight group-hover:text-accent transition-colors text-text-main">{log.name}</span>
                      <div className="flex items-center gap-3 text-xs font-bold text-text-dim uppercase tracking-widest opacity-70">
                        <span className="text-primary">{log.vendor}</span>
                        <span className="opacity-20">•</span>
                        <span>{log.phone}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-[.2em] border shadow-inner",
                      log.status === 'opened' ? "bg-primary/10 text-primary border-primary/20" : "bg-danger/10 text-danger border-danger/20"
                    )}>
                      {log.status}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Quick Config Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-12 rounded-[40px] group relative overflow-hidden shadow-2xl flex flex-col gap-8"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                <Settings className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-text-main">Active Node</h2>
            </div>

            {selectedVendor ? (
              <div className="grid grid-cols-1 gap-5 relative z-10">
                <div className="p-7 glass-morphism rounded-[28px] flex items-center justify-between group/item">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-text-dim uppercase font-black tracking-widest opacity-60">System Registry</p>
                    <p className="font-black text-accent text-xl">{selectedVendor.name}</p>
                  </div>
                  <X className="w-5 h-5 text-accent opacity-20" />
                </div>
                <div className="p-7 glass-morphism rounded-[28px] flex flex-col gap-4 relative group/copy border border-transparent hover:border-primary/20 transition-all cursor-pointer shadow-inner overflow-hidden"
                     onClick={() => {
                       navigator.clipboard.writeText(selectedVendor.maps_link);
                       showToast("Endpoint reference copied");
                     }}>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-text-dim uppercase font-black tracking-widest opacity-60">Endpoint URL</p>
                    <Clipboard className="w-4 h-4 text-primary opacity-0 group-hover/copy:opacity-100 transition-all" />
                  </div>
                  <p className="text-[11px] break-all text-primary font-mono font-bold leading-relaxed">{selectedVendor.maps_link}</p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center glass-morphism rounded-[32px] border-2 border-dashed border-white/5">
                <p className="text-text-dim text-sm font-black uppercase tracking-widest opacity-40">Unauthorized Reference</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="mt-16 text-center"
      >
        <p className="text-[11px] font-black uppercase tracking-[.5em] text-text-dim opacity-30">Security Posture: Optimized • Enterprise Cluster • SEO Kampany v2.1</p>
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
              className="glass w-full max-w-2xl p-12 rounded-[48px] relative shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
              
              <button 
                onClick={() => setShowVendorModal(false)}
                className="absolute top-8 right-8 p-3 text-text-dim hover:text-white hover:bg-white/5 rounded-2xl transition-all z-20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-10 text-text-main">
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
                      className="w-full bg-slate-900 border border-glass-border rounded-2xl p-4 text-sm focus:border-primary outline-none transition-all font-bold text-text-main"
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
                      className="w-full bg-slate-900 border border-glass-border rounded-2xl p-4 text-sm focus:border-primary outline-none transition-all font-bold text-text-main"
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
                    className="flex items-center justify-between p-6 glass-morphism rounded-[24px] group hover:border-primary/20 transition-all border border-transparent shadow-md"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all border border-glass-border">
                        <Building2 className="w-6 h-6 text-text-dim group-hover:text-primary transition-all" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-base tracking-tight text-text-main">{v.name}</span>
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
