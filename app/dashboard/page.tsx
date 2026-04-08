"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Plus, LogOut, Building2, User, 
  History, Settings, ExternalLink, 
  RefreshCw, Clipboard, Phone
} from 'lucide-react';
import { Toast, ToastType } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
      if (vData.vendors?.length > 0 && !selectedVendorId) {
        setSelectedVendorId(vData.vendors[0].id);
      }

      const lRes = await fetch('/api/logs');
      const lData = await lRes.json();
      setLogs(lData.logs || []);
    } catch (err) {
      showToast('Data Retrieval Error', 'error');
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
    if (!vendor) return showToast('Null Node Exception: Select Profile', 'error');

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
        showToast('Node Dispatched successfully');
        fetchData();
      } else {
        showToast(data.error || 'Generation failed', 'error');
      }
    } catch (err) {
      showToast('Neural link failure', 'error');
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
        showToast('Node initialized');
        fetchData();
      }
    } catch (err) {
      showToast('Node initialization failed', 'error');
    } finally {
      setAddingVendor(false);
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
    <div className="min-h-screen flex flex-col items-center bg-bg relative">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />

      {/* Persistent System Header */}
      <header className="w-full h-header flex items-center justify-center border-b border-white/5 bg-black/20 backdrop-blur-xl z-50 sticky top-0">
        <div className="w-full max-w-[1400px] px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gradient tracking-tighter leading-none mb-1">SEO Kampany</h1>
              <Badge variant="ghost" className="opacity-50">Cluster v2.2.8</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-black text-text-dim uppercase tracking-widest leading-none mb-1">Security Node Active</span>
              <span className="text-xs font-bold text-text-main leading-none">Global Admin</span>
            </div>
            <Link href="/api/auth/logout">
              <Button variant="danger" className="w-12 h-12 p-0 rounded-xl">
                <LogOut className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Orchestration Grid */}
      <main className="w-full max-w-[1400px] px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Panel: Primary Actions - 7 Columns */}
        <section className="col-span-1 md:col-span-7 space-y-8">
          <Card 
            header={
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-text-main tracking-tighter leading-none mb-2">Review Generator</h2>
                  <p className="text-text-dim text-sm opacity-50">Execute Feedback Synthesizer</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                  <Send className="w-5 h-5 text-primary" />
                </div>
              </div>
            }
          >
            <form onSubmit={handleGenerate} className="space-y-6">
              <Input 
                as="select"
                label="Active Profile Endpoint"
                value={selectedVendorId}
                onChange={(e: any) => setSelectedVendorId(e.target.value)}
                icon={<Settings className="w-4 h-4" />}
                required
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id} className="bg-bg">{v.name}</option>
                ))}
              </Input>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input 
                  label="Target Identity"
                  placeholder="Elias J. Sterling"
                  icon={<User className="w-4 h-4" />}
                  value={customerName}
                  onChange={(e: any) => setCustomerName(e.target.value)}
                  required
                />
                <Input 
                  label="Signal Number"
                  placeholder="919876543210"
                  icon={<Phone className="w-4 h-4" />}
                  value={phone}
                  onChange={(e: any) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  isLoading={generating}
                  className="flex-[2] text-sm"
                  rightIcon={<Send />}
                >
                  Dispatch signal
                </Button>
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={() => setShowVendorModal(true)}
                  className="flex-1 text-[9px]"
                  leftIcon={<Building2 className="text-primary w-4 h-4" />}
                >
                  Manage Nodes
                </Button>
              </div>
            </form>
          </Card>
        </section>

        {/* Right Panel: Secondary Streams - 5 Columns */}
        <aside className="col-span-1 md:col-span-5 space-y-8">
          
          {/* Active Node View */}
          <Card 
            className="group"
            header={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  <Settings className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-black text-text-main leading-none">Active Node</h3>
              </div>
            }
          >
            {selectedVendor ? (
              <div className="space-y-4">
                <div className="p-5 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5 hover:border-accent/20 transition-all">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-text-dim tracking-widest opacity-40">System Alias</p>
                    <p className="text-xl font-bold text-accent leading-none">{selectedVendor.name}</p>
                  </div>
                  <Building2 className="w-5 h-5 text-accent opacity-20" />
                </div>
                
                <div 
                  className="p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-primary/20 transition-all cursor-pointer group/link overflow-hidden"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedVendor.maps_link);
                    showToast("Reference Copied to Clipboard");
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] font-black uppercase text-text-dim tracking-widest opacity-40">Target Reference</p>
                    <Clipboard className="w-3 h-3 text-primary opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] font-mono font-bold text-primary truncate leading-none">{selectedVendor.maps_link}</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-dim opacity-30 italic">No Node Reference Set</p>
              </div>
            )}
          </Card>

          {/* Logic Logs Stream */}
          <Card 
            className="min-h-[380px]"
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                    <History className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-text-main leading-none">Logic Stream</h3>
                </div>
                <Badge variant="ghost">Live Trace</Badge>
              </div>
            }
          >
            <div className="space-y-3 overflow-y-auto max-h-[280px] custom-scrollbar pr-2">
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <div className="py-20 text-center text-text-dim opacity-20 italic font-black text-[10px] uppercase tracking-widest">Null Logic Logs</div>
                ) : logs.map((log, i) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-text-main leading-none tracking-tight">{log.name}</p>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-dim">
                        <span className="text-primary/70">{log.vendor}</span>
                        <span className="opacity-20">•</span>
                        <span>{log.phone}</span>
                      </div>
                    </div>
                    <Badge variant={log.status === 'opened' ? 'success' : 'danger'}>
                      {log.status === 'opened' ? 'SYN' : 'ERR'}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </aside>
      </main>

      {/* Corporate Branding Footer */}
      <footer className="w-full py-12 border-t border-white/5 text-center mt-auto">
        <p className="text-[11px] font-black uppercase tracking-[.6em] text-text-dim opacity-20">SEO Kampany Enterprise Deployment • Node v2.2.8.2 Alpha • Precision Optimized</p>
      </footer>

      {/* Cluster Config Modal - Redesigned Modal Flow */}
      <AnimatePresence>
        {showVendorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-spacing-scale-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowVendorModal(false)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-2xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 32 }}
              className="w-full max-w-2xl relative z-10"
            >
              <Card 
                className="max-h-[90vh] overflow-y-auto"
                header={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-text-main tracking-tighter leading-none mb-2">Cluster Clusters</h2>
                        <Badge variant="ghost">Endpoint Management</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => setShowVendorModal(false)} className="w-12 h-12 p-0 rounded-2xl">
                      <Plus className="w-5 h-5 rotate-45" />
                    </Button>
                  </div>
                }
              >
                <div className="space-y-12">
                  <div className="p-8 bg-primary/5 rounded-[32px] border border-primary/10 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <h4 className="text-[11px] font-black uppercase text-primary tracking-widest leading-none">Initialize New Node</h4>
                    </div>
                    <form onSubmit={handleAddVendor} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input 
                        label="Alias"
                        placeholder="HQ Alpha"
                        value={newVendorName}
                        onChange={(e: any) => setNewVendorName(e.target.value)}
                        required
                      />
                      <Input 
                        label="Reference URL"
                        placeholder="https://g.page/..."
                        value={newVendorLink}
                        onChange={(e: any) => setNewVendorLink(e.target.value)}
                        required
                      />
                      <Button 
                        type="submit" 
                        isLoading={addingVendor}
                        className="sm:col-span-2 w-full mt-4"
                        leftIcon={<Plus />}
                      >
                        Provision Node
                      </Button>
                    </form>
                  </div>

                  <div className="space-y-4 pb-12">
                    <h4 className="text-[10px] font-black uppercase text-text-dim tracking-widest mb-6 px-2">Active Cluster Registry</h4>
                    {vendors.map((v, i) => (
                      <motion.div 
                        key={v.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-transparent hover:border-white/10 transition-all group shadow-inner"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-dim group-hover:text-primary transition-all">
                             <Building2 className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-base font-bold text-text-main leading-none">{v.name}</p>
                            <p className="text-[10px] font-mono text-primary/60 truncate max-w-[200px] leading-none">{v.maps_link}</p>
                          </div>
                        </div>
                        <Badge variant="ghost">Production</Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
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
