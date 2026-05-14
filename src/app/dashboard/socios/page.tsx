"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BarChart, Users, UserPlus, Plus, X, Save, Upload } from 'lucide-react';

export default function SociosPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [campanas, setCampanas] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clientes, setClientes] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCampanaModalOpen, setIsCampanaModalOpen] = useState(false);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [isEmpleadoModalOpen, setIsEmpleadoModalOpen] = useState(false);

  const [newCampana, setNewCampana] = useState({ nombre_campana: '', presupuesto: '', fecha_inicio: '', fecha_fin: '', descripcion: '', color: '#FF3B30' });
  const [newCliente, setNewCliente] = useState({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', foto: '' });
  const [newEmpleado, setNewEmpleado] = useState({ nombre: '', apellido: '', email: '', rol: 'Empleado', estado: 'ACTIVE', salario: '', foto: '' });
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/socios');
      const data = await res.json();
      setCampanas(data.campanas || []);
      setClientes(data.clientes || []);
      setEmpleados(data.empleados || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching socios data", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCampana = async () => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const data = editingItem ? { ...newCampana, id: editingItem.id } : newCampana;
      await fetch('/api/socios', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'campana', data }) });
      setIsCampanaModalOpen(false);
      setEditingItem(null);
      setNewCampana({ nombre_campana: '', presupuesto: '', fecha_inicio: '', fecha_fin: '', descripcion: '', color: '#FF3B30' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSaveCliente = async () => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const data = editingItem ? { ...newCliente, id: editingItem.id } : newCliente;
      await fetch('/api/socios', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'cliente', data }) });
      setIsClienteModalOpen(false);
      setEditingItem(null);
      setNewCliente({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', foto: '' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSaveEmpleado = async () => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const data = editingItem ? { ...newEmpleado, id: editingItem.id } : newEmpleado;
      await fetch('/api/socios', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'empleado', data }) });
      setIsEmpleadoModalOpen(false);
      setEditingItem(null);
      setNewEmpleado({ nombre: '', apellido: '', email: '', rol: 'Empleado', estado: 'ACTIVE', salario: '', foto: '' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: any, state: any) => {
    if (e.target.files && e.target.files[0]) {
      setter({ ...state, foto: URL.createObjectURL(e.target.files[0]) });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <Header title="Gestión de Socios" />
      
      <main className="p-8 max-w-7xl mx-auto w-full flex-1 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>GESTIÓN DE SOCIOS</h1>
          <p className="text-surface-600 uppercase tracking-widest text-xs">ADMINISTRACIÓN DE CAMPAÑAS, CLIENTES Y USUARIOS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CAMPAÑAS */}
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 min-h-[500px] shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <BarChart className="w-4 h-4 text-primary mr-2" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">CAMPAÑAS</h3>
              </div>
              <button onClick={() => setIsCampanaModalOpen(true)} className="text-primary hover:text-white transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {loading ? <p className="text-surface-600 text-sm">Cargando...</p> : campanas.map(c => (
                <div 
                  key={c.id} 
                  className="group cursor-pointer"
                  onClick={() => {
                    setEditingItem(c);
                    setNewCampana({ 
                      nombre_campana: c.nombre_campana, 
                      presupuesto: c.presupuesto, 
                      fecha_inicio: c.fecha_inicio, 
                      fecha_fin: c.fecha_fin, 
                      descripcion: c.descripcion || '', 
                      color: c.color || '#FF3B30' 
                    });
                    setIsCampanaModalOpen(true);
                  }}
                >
                  <div className="flex items-center mb-1">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: c.color || '#FF3B30' }}></div>
                    <h4 className="font-bold text-white group-hover:text-primary transition-colors">{c.nombre_campana}</h4>
                  </div>
                  <div className="ml-5 text-[10px] uppercase tracking-wider text-surface-600 font-bold">
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CLIENTES */}
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 min-h-[500px] shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="w-4 h-4 text-[#4da6ff] mr-2" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">CLIENTES</h3>
              </div>
              <button onClick={() => setIsClienteModalOpen(true)} className="text-[#4da6ff] hover:text-white transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 max-h-[450px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {loading ? <p className="text-surface-600 text-sm">Cargando...</p> : clientes.map(c => (
                <div 
                  key={c.id} 
                  className="flex items-center group cursor-pointer"
                  onClick={() => {
                    setEditingItem(c);
                    setNewCliente({
                      nombre: c.nombre,
                      apellido: c.apellido,
                      email: c.email,
                      telefono: c.telefono || '',
                      direccion: c.direccion || '',
                      foto: c.foto || ''
                    });
                    setIsClienteModalOpen(true);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-surface-500 mr-4 overflow-hidden border border-surface-400">
                    <img src={`https://i.pravatar.cc/150?u=${c.email}`} alt={c.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-[#4da6ff] transition-colors">{c.nombre} {c.apellido}</h4>
                    <p className="text-xs text-surface-600">{c.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EMPLEADOS */}
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 min-h-[500px] shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <UserPlus className="w-4 h-4 text-[#00C48C] mr-2" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">EMPLEADOS</h3>
              </div>
              <button onClick={() => setIsEmpleadoModalOpen(true)} className="text-[#00C48C] hover:text-white transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 max-h-[450px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {loading ? <p className="text-surface-600 text-sm">Cargando...</p> : empleados.map(e => (
                <div 
                  key={e.id} 
                  className="flex items-center group cursor-pointer"
                  onClick={() => {
                    setEditingItem(e);
                    setNewEmpleado({
                      nombre: e.nombre,
                      apellido: e.apellido,
                      email: e.email,
                      rol: e.rol || 'Empleado',
                      estado: e.estado || 'ACTIVE',
                      salario: e.salario || '',
                      foto: e.foto || ''
                    });
                    setIsEmpleadoModalOpen(true);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-surface-500 mr-4 overflow-hidden border border-surface-400">
                    <img src={`https://i.pravatar.cc/150?u=${e.email}`} alt={e.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-bold text-white group-hover:text-[#00C48C] transition-colors mr-2">{e.nombre} {e.apellido}</h4>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#00C48C]">{e.estado}</span>
                    </div>
                    <p className="text-xs text-surface-600">{e.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* MODAL NUEVA CAMPAÑA */}
      {isCampanaModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button onClick={() => { setIsCampanaModalOpen(false); setEditingItem(null); setNewCampana({ nombre_campana: '', presupuesto: '', fecha_inicio: '', fecha_fin: '', descripcion: '', color: '#FF3B30' }); }} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>
              {editingItem ? 'EDITAR CAMPAÑA' : 'NUEVA CAMPAÑA'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Nombre de la campaña</label>
                <input type="text" value={newCampana.nombre_campana} onChange={(e) => setNewCampana({...newCampana, nombre_campana: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Ej: Rediseño Web" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Presupuesto</label>
                <input type="number" value={newCampana.presupuesto} onChange={(e) => setNewCampana({...newCampana, presupuesto: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Ej: 5000" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Descripción</label>
                <textarea 
                  value={newCampana.descripcion} 
                  onChange={(e) => setNewCampana({...newCampana, descripcion: e.target.value})} 
                  className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[100px]" 
                  placeholder="Describe los objetivos de la campaña..."
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Color Representativo</label>
                <div className="flex items-center space-x-3 bg-surface-100 border border-surface-400 rounded-lg px-4 py-2">
                  <input 
                    type="color" 
                    value={newCampana.color} 
                    onChange={(e) => setNewCampana({...newCampana, color: e.target.value})} 
                    className="w-10 h-10 bg-transparent border-none cursor-pointer rounded overflow-hidden" 
                  />
                  <span className="text-sm text-surface-500 font-mono uppercase">{newCampana.color}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Fecha de Inicio</label>
                  <input type="date" value={newCampana.fecha_inicio} onChange={(e) => setNewCampana({...newCampana, fecha_inicio: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Fecha de Fin</label>
                  <input type="date" value={newCampana.fecha_fin} onChange={(e) => setNewCampana({...newCampana, fecha_fin: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={handleSaveCampana} className="bg-primary hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider text-sm transition-colors flex items-center">
                  <Save className="w-4 h-4 mr-2" /> {editingItem ? 'ACTUALIZAR' : 'GUARDAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO CLIENTE */}
      {isClienteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button onClick={() => { setIsClienteModalOpen(false); setEditingItem(null); setNewCliente({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', foto: '' }); }} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>
              {editingItem ? 'EDITAR CLIENTE' : 'NUEVO CLIENTE'}
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24 rounded-full bg-surface-100 border-2 border-dashed border-surface-400 flex flex-col items-center justify-center overflow-hidden group">
                  {newCliente.foto ? (
                    <img src={newCliente.foto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-surface-500 group-hover:text-[#4da6ff] transition-colors mb-1" />
                      <span className="text-[8px] uppercase tracking-widest text-surface-500 group-hover:text-[#4da6ff] transition-colors text-center px-2">Subir Foto</span>
                    </>
                  )}
                  <input type="file" onChange={(e) => handleFileUpload(e, setNewCliente, newCliente)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Nombre</label>
                  <input type="text" value={newCliente.nombre} onChange={(e) => setNewCliente({...newCliente, nombre: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#4da6ff] transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Apellido</label>
                  <input type="text" value={newCliente.apellido} onChange={(e) => setNewCliente({...newCliente, apellido: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#4da6ff] transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Email</label>
                <input type="email" value={newCliente.email} onChange={(e) => setNewCliente({...newCliente, email: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#4da6ff] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Teléfono</label>
                <input type="tel" value={newCliente.telefono} onChange={(e) => setNewCliente({...newCliente, telefono: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#4da6ff] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Dirección</label>
                <input type="text" value={newCliente.direccion} onChange={(e) => setNewCliente({...newCliente, direccion: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#4da6ff] transition-colors" />
              </div>
              
              <div className="flex justify-end pt-4">
                <button onClick={handleSaveCliente} className="bg-[#4da6ff] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider text-sm transition-colors flex items-center">
                  <Save className="w-4 h-4 mr-2" /> {editingItem ? 'ACTUALIZAR' : 'GUARDAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO EMPLEADO */}
      {isEmpleadoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button onClick={() => { setIsEmpleadoModalOpen(false); setEditingItem(null); setNewEmpleado({ nombre: '', apellido: '', email: '', rol: 'Empleado', estado: 'ACTIVE', salario: '', foto: '' }); }} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>
              {editingItem ? 'EDITAR EMPLEADO' : 'NUEVO EMPLEADO'}
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24 rounded-full bg-surface-100 border-2 border-dashed border-surface-400 flex flex-col items-center justify-center overflow-hidden group">
                  {newEmpleado.foto ? (
                    <img src={newEmpleado.foto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-surface-500 group-hover:text-[#00C48C] transition-colors mb-1" />
                      <span className="text-[8px] uppercase tracking-widest text-surface-500 group-hover:text-[#00C48C] transition-colors text-center px-2">Subir Foto</span>
                    </>
                  )}
                  <input type="file" onChange={(e) => handleFileUpload(e, setNewEmpleado, newEmpleado)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Nombre</label>
                  <input type="text" value={newEmpleado.nombre} onChange={(e) => setNewEmpleado({...newEmpleado, nombre: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00C48C] transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Apellido</label>
                  <input type="text" value={newEmpleado.apellido} onChange={(e) => setNewEmpleado({...newEmpleado, apellido: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00C48C] transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Email</label>
                <input type="email" value={newEmpleado.email} onChange={(e) => setNewEmpleado({...newEmpleado, email: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00C48C] transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Rol</label>
                  <select value={newEmpleado.rol} onChange={(e) => setNewEmpleado({...newEmpleado, rol: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00C48C] transition-colors appearance-none font-bold">
                    <option value="Empleado">Empleado</option>
                    <option value="Moderador">Moderador</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Soporte">Soporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Estado</label>
                  <select value={newEmpleado.estado} onChange={(e) => setNewEmpleado({...newEmpleado, estado: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00C48C] transition-colors appearance-none font-bold">
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="SUSPENDED">Suspendido</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Salario</label>
                <input type="number" value={newEmpleado.salario} onChange={(e) => setNewEmpleado({...newEmpleado, salario: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00C48C] transition-colors" placeholder="Ej: 3000" />
              </div>
              
              <div className="flex justify-end pt-4">
                <button onClick={handleSaveEmpleado} className="bg-[#00C48C] hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider text-sm transition-colors flex items-center">
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
