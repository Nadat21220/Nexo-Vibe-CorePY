"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Video, Plus, X, Save, Upload, Trash2, AlertTriangle } from 'lucide-react';

export default function UGCPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [creadores, setCreadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newCreador, setNewCreador] = useState({ 
    nombre: '', 
    apellido: '', 
    email: '', 
    plataforma: 'TikTok', 
    tarifa: '', 
    foto: '',
    handle: ''
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ugc');
      const data = await res.json();
      setCreadores(data.creadores || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching UGC data", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      await fetch('/api/ugc', { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ data: editingItem ? { ...newCreador, id: editingItem.id } : newCreador }) 
      });
      setIsModalOpen(false);
      setEditingItem(null);
      setNewCreador({ nombre: '', apellido: '', email: '', plataforma: 'TikTok', tarifa: '', foto: '', handle: '' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    try {
      await fetch(`/api/ugc?id=${editingItem.id}`, { method: 'DELETE' });
      setIsModalOpen(false);
      setEditingItem(null);
      setShowDeleteConfirm(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewCreador({ ...newCreador, foto: URL.createObjectURL(e.target.files[0]) });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <Header title="Producción UGC" />
      
      <main className="p-8 max-w-7xl mx-auto w-full flex-1 overflow-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wide text-primary mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>CREADORES UGC</h1>
            <p className="text-surface-600 uppercase tracking-widest text-xs">GESTIÓN DE TALENTOS Y CONTENIDO EXTERNO</p>
          </div>
          <button 
            onClick={() => { setIsModalOpen(true); setEditingItem(null); }}
            className="flex items-center text-sm font-bold text-white bg-primary hover:bg-red-600 transition-colors px-6 py-3 rounded uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 mr-2" />
            NUEVO CREADOR
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-surface-600 text-sm">Cargando creadores...</p>
          ) : creadores.map(c => (
            <div 
              key={c.id} 
              onClick={() => {
                setEditingItem(c);
                setNewCreador({
                  nombre: c.nombre,
                  apellido: c.apellido,
                  email: c.email,
                  plataforma: c.plataforma,
                  tarifa: c.tarifa || '',
                  foto: c.foto || '',
                  handle: c.handle || ''
                });
                setIsModalOpen(true);
              }}
              className="bg-surface-200 border border-surface-400 rounded-2xl p-6 group hover:border-primary transition-all shadow-lg cursor-pointer relative overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Video className="w-4 h-4 text-primary mr-2" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-600">{c.plataforma}</h3>
                </div>
                {c.tarifa && <span className="text-sm font-bold text-primary font-mono">${c.tarifa}</span>}
              </div>
              
              {/* LARGE PREVIEW AREA */}
              <div className="relative w-full aspect-video rounded-xl bg-surface-100 mb-6 overflow-hidden border border-surface-400 group-hover:border-primary/50 transition-colors shadow-inner">
                <img 
                  src={c.foto || `https://i.pravatar.cc/600?u=${c.email}`} 
                  alt={c.nombre} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full border border-primary mr-2 overflow-hidden">
                      <img src={c.foto || `https://i.pravatar.cc/100?u=${c.email}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{c.nombre} {c.apellido}</p>
                      <p className="text-primary text-[10px] font-bold">{c.handle || `@${c.nombre.toLowerCase()}`}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{c.nombre} {c.apellido}</h2>
                <p className="text-primary text-sm font-bold tracking-wider font-mono">{c.handle || `@${c.nombre.toLowerCase()}`}</p>
              </div>

              <div className="border-t border-surface-400 pt-4 mt-auto">
                <p className="text-[10px] uppercase tracking-widest text-surface-600 mb-3 font-bold">ESTADÍSTICAS / CAMPAÑAS</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded text-[9px] uppercase font-bold tracking-widest text-white border border-surface-400 bg-surface-300/50">
                    NEXOCORE REDESIGN
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL CREADOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button onClick={() => { setIsModalOpen(false); setEditingItem(null); setShowDeleteConfirm(false); }} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>
              {editingItem ? 'EDITAR CREADOR' : 'NUEVO CREADOR'}
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24 rounded-full bg-surface-100 border-2 border-dashed border-surface-400 flex flex-col items-center justify-center overflow-hidden group">
                  {newCreador.foto ? (
                    <img src={newCreador.foto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-surface-500 group-hover:text-primary transition-colors mb-1" />
                      <span className="text-[8px] uppercase tracking-widest text-surface-500 group-hover:text-primary transition-colors text-center px-2">Subir Foto</span>
                    </>
                  )}
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Nombre</label>
                  <input type="text" value={newCreador.nombre} onChange={(e) => setNewCreador({...newCreador, nombre: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Apellido</label>
                  <input type="text" value={newCreador.apellido} onChange={(e) => setNewCreador({...newCreador, apellido: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Email</label>
                <input type="email" value={newCreador.email} onChange={(e) => setNewCreador({...newCreador, email: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Plataforma</label>
                  <select value={newCreador.plataforma} onChange={(e) => setNewCreador({...newCreador, plataforma: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none font-bold">
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitch">Twitch</option>
                    <option value="Twitter">X / Twitter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Tarifa (USD)</label>
                  <input type="number" value={newCreador.tarifa} onChange={(e) => setNewCreador({...newCreador, tarifa: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Ej: 150" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Handle / @Usuario</label>
                <input type="text" value={newCreador.handle} onChange={(e) => setNewCreador({...newCreador, handle: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Ej: @anatech" />
              </div>
              
              <div className="flex justify-between items-center pt-6 border-t border-surface-400">
                {editingItem ? (
                  showDeleteConfirm ? (
                    <div className="flex items-center space-x-3 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">¿SEGURO?</p>
                      <div className="flex space-x-2">
                        <button onClick={handleDelete} className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors">SÍ, BORRAR</button>
                        <button onClick={() => setShowDeleteConfirm(false)} className="text-surface-600 hover:text-white transition-colors text-[10px] font-bold uppercase">NO</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-500 hover:text-white hover:bg-red-500/10 p-2 rounded-lg transition-all flex items-center text-[10px] font-bold uppercase tracking-wider"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> BORRAR CREADOR
                    </button>
                  )
                ) : <div></div>}
                
                <button onClick={handleSave} className="bg-primary hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider text-sm transition-colors flex items-center shadow-lg">
                  <Save className="w-4 h-4 mr-2" /> {editingItem ? 'ACTUALIZAR' : 'GUARDAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
