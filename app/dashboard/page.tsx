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
  
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [generating, setGenerating] = useState(false);

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

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 md:p-16 flex flex-col items-center max-w-[1920px] mx-auto">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />

      {/* Header - Perfect 80px height */}
      <motion.div 
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl h-20 flex justify-between items-center mb-12 glass px-8 rounded-3xl shadow-2xl shrink-0"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-black text-gradient leading-none tracking-tight mb-1">SEO Kampany</h1>
            <p className="text-[9px] text-text-dim uppercase tracking-[.3em] font-black opacity-60 leading-none">Enterprise Cluster v2.2</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex flex-col items-end justify-center">
            <span className="text-[9px] text-text-dim font-black uppercase tracking-[.2em] mb-1.5 leading-none">Auth Station</span>
            <div className="flex items-center gap-2 leading-none">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-text-main">Global Admin</span>
            </div>
          </div>
          <Link_ href="/api/auth/logout" className="w-12 h-12 bg-danger/10 text-danger rounded-xl flex items-center justify-center hover:bg-danger hover:text-white transition-all shadow-xl hover:shadow-danger/30 group">
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Link_>
        </div>
      </motion.div>

      {/* Main Grid - Standardized gap-8 (32px) */}
      <div className="w-full max-w-6xl grid grid-cols-12 gap-8 mb-16 items-start">
        
        {/* Left Panel: Review Generator - 7 columns wide */}
        <motion.div 
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-7 glass p-10 rounded-[40px] relative overflow-hidden group shadow-2xl min-h-[640px] flex flex-col"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
          
          <div className="mb-10">
            <h2 className="text-3xl font-black mb-2 tracking-tighter text-text-main leading-none">Review Generator</h2>
            <p className="text-text-dim text-sm font-medium opacity-70 leading-relaxed">Synthesize instant feedback nodes via secure business endpoints.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8 flex-grow">
            {/* Vendor Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-[.2em] flex items-center gap-2.5 ml-1">
                <div className="w-1 h-1 rounded-full bg-primary" /> Select Active Profile
              </label>
              <div className="relative group/select">
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl h-16 px-5 focus:outline-none focus:border-primary/50 appearance-none transition-all cursor-pointer font-bold text-base text-text-main shadow-inner"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id} className="bg-[#030712]">{v.name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim group-hover/select:text-primary transition-colors">
                  <Plus className="w-4 h-4 rotate-45" />
                </div>
              </div>
            </div>

            {/* Customer Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-[.2em] flex items-center gap-2.5 ml-1">
                <div className="w-1 h-1 rounded-full bg-primary" /> Target Identity
              </label>
              <input
                type="text"
                placeholder="Ex. Elias J. Sterling"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl h-16 px-5 focus:outline-none focus:border-primary/50 transition-all font-bold text-base tracking-tight shadow-inner"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-[.2em] flex items-center gap-2.5 ml-1">
                <div className="w-1 h-1 rounded-full bg-primary" /> Destination Number
              </label>
              <input
                type="text"
                placeholder="Ex. 919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl h-16 px-5 focus:outline-none focus:border-primary/50 transition-all font-bold text-base shadow-inner"
                required
              />
            </div>
          </form>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-4 pt-10">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-[2] h-16 rounded-2xl btn-primary font-black text-white flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 text-sm uppercase tracking-widest shadow-2xl"
            >
              {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Dispatch Node
            </button>
            
            <button
              type="button"
              onClick={() => setShowVendorModal(true)}
              className="flex-1 h-16 bg-white/5 border border-white/10 text-text-main rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2.5 uppercase tracking-widest text-[10px]"
            >
              <Building2 className="w-4 h-4 text-primary" />
              Profiles
            </button>
          </div>
        </motion.div>

        {/* Right Panel: Data Nodes - 5 columns wide */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-8 h-full">
          
          {/* Station Logs */}
          <motion.div 
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-10 rounded-[40px] flex flex-col h-[400px] shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  <History className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-text-main leading-none">Process Logs</h2>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[.25em] text-text-dim px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 leading-none">Real-Time</span>
            </div>
            
            <div className="overflow-y-auto space-y-4 pr-3 custom-scrollbar flex-grow">
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-20 text-text-dim text-[10px] font-black uppercase tracking-[.3em] opacity-30 italic"
                  >
                    No logic streams detected
                  </motion.div>
                ) : logs.map((log, index) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-center justify-between p-5 glass-morphism rounded-2xl group hover:border-accent/30 transition-all border border-transparent shadow-sm"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="font-black text-sm tracking-tight text-text-main leading-none">{log.name}</span>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-text-dim uppercase tracking-widest opacity-60 leading-none">
                        <span className="text-primary">{log.vendor}</span>
                        <span className="opacity-30">•</span>
                        <span>{log.phone}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border shadow-inner leading-none",
                      log.status === 'opened' ? "bg-primary/10 text-primary border-primary/20" : "bg-danger/10 text-danger border-danger/20"
                    )}>
                      {log.status}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Configuration Card */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-10 rounded-[40px] group relative overflow-hidden shadow-2xl flex flex-col gap-6 flex-grow min-h-[200px]"
          >
             <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                <Settings className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-text-main leading-none">Active Station</h2>
            </div>

            {selectedVendor ? (
              <div className="flex flex-col gap-4 relative z-10 flex-grow justify-center">
                <div className="p-5 glass-morphism rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] text-text-dim uppercase font-black tracking-widest opacity-50 leading-none">System ID</p>
                    <p className="font-black text-accent text-lg leading-none mt-1">{selectedVendor.name}</p>
                  </div>
                  <Building2 className="w-4 h-4 text-accent opacity-20" />
                </div>
                <div className="p-5 glass-morphism rounded-2xl flex flex-col gap-3 group/copy border border-transparent hover:border-primary/20 transition-all cursor-pointer shadow-inner overflow-hidden"
                     onClick={() => {
                       navigator.clipboard.writeText(selectedVendor.maps_link);
                       showToast("Endpoint identifier copied");
                     }}>
                  <div className="flex justify-between items-center leading-none">
                    <p className="text-[9px] text-text-dim uppercase font-black tracking-widest opacity-50">Reference URL</p>
                    <Clipboard className="w-3 h-3 text-primary opacity-0 group-hover/copy:opacity-100 transition-all" />
                  </div>
                  <p className="text-[10px] break-all text-primary font-mono font-bold leading-tight line-clamp-2">{selectedVendor.maps_link}</p>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center p-8 text-center glass-morphism rounded-2xl border-2 border-dashed border-white/5">
                <p className="text-text-dim text-[10px] font-black uppercase tracking-[.3em] opacity-30">Null Reference</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.5 }}
        className="mt-auto pt-8 text-center"
      >
        <p className="text-[10px] font-black uppercase tracking-[.6em] text-text-dim opacity-30 leading-none">Enterprise Deployment Cluster • SEO Kampany v2.2.8 • Precision Optimized</p>
      </motion.div>

      {/* Vendor Management Modal - Rigorous Alignment */}
      <AnimatePresence>
        {showVendorModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowVendorModal(false)}
              className="absolute inset-0 bg-[#030712]/95 backdrop-blur-2xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="glass w-full max-w-2xl p-12 rounded-[48px] relative shadow-[0_0_120px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
              
              <button 
                onClick={() => setShowVendorModal(false)}
                className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center text-text-dim hover:text-white hover:bg-white/5 rounded-xl transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-5 mb-12 text-text-main">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight leading-none mb-2">Cluster Config</h2>
                  <p className="text-text-dim text-[11px] font-black uppercase tracking-widest leading-none">Manage operational business nodes</p>
                </div>
              </div>
              
              <form onSubmit={handleAddVendor} className="mb-12 p-8 glass-morphism rounded-[32px] space-y-8 relative z-10 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="text-[11px] font-black uppercase tracking-[.25em] text-primary leading-none">Deploy New Node</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1 leading-none">Node Alias</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Binateeq HQ"
                      value={newVendorName}
                      onChange={(e) => setNewVendorName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl h-14 px-5 text-sm focus:border-primary/50 outline-none transition-all font-bold text-text-main"
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1 leading-none">Reference URL</label>
                    <input 
                      type="text" 
                      placeholder="https://g.page/r/..."
                      value={newVendorLink}
                      onChange={(e) => setNewVendorLink(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl h-14 px-5 text-sm focus:border-primary/50 outline-none transition-all font-bold text-text-main"
                      required 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={addingVendor}
                  className="w-full h-16 btn-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 text-[11px] tracking-widest uppercase shadow-2xl"
                >
                  <Plus className="w-4 h-4" />
                  {addingVendor ? 'Processing Stream...' : 'Initialize Configuration'}
                </button>
              </form>

              <div className="max-h-[320px] overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                {vendors.length === 0 ? (
                  <div className="text-center py-20 text-text-dim text-[11px] font-black uppercase tracking-[.4em] border-2 border-dashed border-white/5 rounded-[40px] opacity-20">
                    Database Null
                  </div>
                ) : vendors.map((v, i) => (
                  <motion.div 
                    key={v.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-6 glass-morphism rounded-3xl group hover:border-primary/20 transition-all border border-transparent shadow-md"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all border border-white/5">
                        <Building2 className="w-5 h-5 text-text-dim group-hover:text-primary transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5 justify-center">
                        <span className="font-black text-base tracking-tight text-text-main leading-none">{v.name}</span>
                        <div className="flex items-center gap-2 leading-none">
                           <ExternalLink className="w-3 h-3 text-primary opacity-40" />
                           <span className="text-[10px] text-primary/80 font-mono truncate max-w-[280px] font-bold tracking-tight">{v.maps_link}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteVendor(v.id)}
                      className="w-10 h-10 flex items-center justify-center text-danger/30 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  );
}
