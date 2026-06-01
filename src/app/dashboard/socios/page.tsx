"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { Users, UserPlus, X, Save, Upload, Edit3, Trash2, AlertTriangle, Eye, Search, Filter } from 'lucide-react';

export default function SociosPage() {
  const { role } = useAuth();
  const isEmpleado = role === 'empleado';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clientes, setClientes] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [personType, setPersonType] = useState<'empleado' | 'cliente'>('empleado');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol: 'Desarrollador Frontend',
    salario: '',
    direccion: '',
    foto: '',
    rango: 'normal',
    suscripcion: 'starter'
  });

  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Todos');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/socios');
      const data = await res.json();
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'cliente' | 'empleado', nombre: string } | null>(null);

  const handleSave = async () => {
    // Validación de campos requeridos
    const requiredFields = personType === 'empleado'
      ? ['nombre', 'apellido', 'email', 'rol', 'salario']
      : ['nombre', 'apellido', 'email', 'telefono', 'direccion'];

    const missingFields = requiredFields.filter(field => String(formData[field as keyof typeof formData]).trim() === '');

    if (missingFields.length > 0) {
      showToast(`Faltan campos: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const method = editingItem ? 'PUT' : 'POST';

      // Construir el objeto de datos asegurando que el rango se incluya para clientes
      const payloadData = {
        ...formData,
        ...(editingItem ? { id: editingItem.id } : {})
      };

      const res = await fetch('/api/socios', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: personType, data: payloadData })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(`Error: ${errorData.error || 'No se pudo guardar'}`, 'error');
        return;
      }

      setIsModalOpen(false);
      setEditingItem(null);
      resetForm();
      fetchData();
      showToast(`Socio ${editingItem ? 'actualizado' : 'creado'} con éxito`, 'success');
    } catch (e) { 
      console.error("Error al guardar socio:", e); 
      showToast("Error de conexión al servidor", 'error');
    }
  };

  const handleDeleteTrigger = (id: string, type: 'cliente' | 'empleado', nombre: string) => {
    setItemToDelete({ id, type, nombre });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await fetch(`/api/socios?id=${itemToDelete.id}&type=${itemToDelete.type}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
      showToast("Socio eliminado correctamente");
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      rol: 'Desarrollador Frontend',
      salario: '',
      direccion: '',
      foto: '',
      rango: 'normal',
      suscripcion: 'starter'
    });
    setPersonType('empleado');
    setEditingItem(null);
    setIsReadOnly(false);
  };

  const handleEdit = (item: any, type: 'empleado' | 'cliente', readOnly = false) => {
    setEditingItem(item);
    setPersonType(type);
    setIsReadOnly(readOnly);
    setFormData({
      nombre: item.nombre || '',
      apellido: item.apellido || '',
      email: item.email || '',
      telefono: item.telefono || '',
      rol: item.rol || 'Empleado',
      salario: item.salario || '',
      direccion: item.direccion || '',
      foto: item.foto || '',
      rango: item.rango || 'normal',
      suscripcion: item.suscripcion || 'starter'
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, foto: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const filteredEmployees = empleados.filter(e => {
    const matchesSearch = `${e.nombre} ${e.apellido} ${e.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'Todos' || e.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredClients = clientes.filter(c => {
    return `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const clientesNormales = filteredClients; // Show all clients since VIP section is removed

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-4 rounded-2xl border shadow-2xl flex items-center space-x-3 backdrop-blur-xl ${toast.type === 'error' ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-green-500/20 border-green-500/30 text-green-400'}`}>
            {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}
      <Header title="Gestión de Socios" />

      <main className="p-8 max-w-7xl mx-auto w-full flex-1 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>GESTIÓN DE SOCIOS</h1>
            <p className="text-surface-600 uppercase tracking-widest text-xs">ADMINISTRACIÓN DE PERSONAL Y CARTERA DE CLIENTES</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            {/* Barra de Búsqueda */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-surface-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-200 border border-surface-400 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder:text-surface-600"
              />
            </div>

            {/* Filtro de Rol */}
            <div className="relative w-full sm:w-48">
              <Filter className="w-3 h-3 text-surface-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full bg-surface-200 border border-surface-400 rounded-xl py-3 pl-9 pr-4 text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none focus:border-primary transition-all appearance-none"
              >
                <option value="Todos">Todos los Roles</option>
                <option value="Administrador">Administrador</option>
                <option value="Desarrollador Frontend">Desarrollador Frontend</option>
                <option value="Desarrollador Backend">Desarrollador Backend</option>
                <option value="Analista de Marketing">Analista de Marketing</option>
                <option value="Diseñador Digital">Diseñador Digital</option>
                <option value="Desarrollador de Creadores UGC">Desarrollador de Creadores UGC</option>
                <option value="Creador UGC">Creador UGC</option>
              </select>
            </div>

            {!isEmpleado && (
              <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-primary hover:bg-red-600 text-white font-bold py-3.5 px-6 rounded-xl uppercase tracking-widest text-[10px] transition-all flex items-center shadow-[0_10px_20px_rgba(255,59,48,0.2)] group w-full sm:w-auto justify-center"
              >
                <UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Agregar Persona
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* COLUMNA 1: EMPLEADOS */}
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 min-h-[500px] shadow-lg flex flex-col">
            <div className="flex items-center mb-6">
              <UserPlus className="w-4 h-4 text-[#00C48C] mr-2" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">EMPLEADOS</h3>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {loading ? <p className="text-surface-600 text-sm">Cargando...</p> : filteredEmployees.map(e => (
                <div key={e.email} className="flex items-center justify-between group p-2 rounded-xl hover:bg-surface-300/30 transition-all border border-transparent hover:border-surface-400">
                  <div className="flex items-center flex-1 cursor-pointer" onClick={() => handleEdit(e, 'empleado')}>
                    <div className="w-10 h-10 rounded-full bg-surface-500 mr-4 overflow-hidden border border-surface-400">
                      <img src={`https://i.pravatar.cc/150?u=${e.email}`} alt={e.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <h4 className="font-bold text-white group-hover:text-[#00C48C] transition-colors mr-2 truncate">{e.nombre} {e.apellido}</h4>
                        <span className="text-[8px] uppercase font-bold tracking-wider text-[#00C48C] bg-[#00C48C]/10 px-1.5 py-0.5 rounded whitespace-nowrap">{e.estado}</span>
                      </div>
                      <p className="text-[10px] text-surface-600 truncate">{e.rol || 'Sin Rol'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button onClick={(ev) => { ev.stopPropagation(); handleEdit(e, 'empleado', true); }} className="p-1.5 text-surface-600 hover:text-[#00C48C] hover:bg-[#00C48C]/10 rounded-lg transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(ev) => { ev.stopPropagation(); handleEdit(e, 'empleado'); }} className="p-1.5 text-surface-600 hover:text-white hover:bg-surface-400 rounded-lg transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(ev) => { ev.stopPropagation(); handleDeleteTrigger(e.id, 'empleado', `${e.nombre} ${e.apellido}`); }} className="p-1.5 text-surface-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* COLUMNA 3: CLIENTES NORMALES */}
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 min-h-[500px] shadow-lg flex flex-col">
            <div className="flex items-center mb-6">
              <Users className="w-4 h-4 text-[#4da6ff] mr-2" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">CLIENTES</h3>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {loading ? <p className="text-surface-600 text-sm">Cargando...</p> : clientesNormales.map(c => (
                <div key={c.email} className="flex items-center justify-between group p-2 rounded-xl hover:bg-surface-300/30 transition-all border border-transparent hover:border-surface-400">
                  <div className="flex items-center flex-1 cursor-pointer" onClick={() => handleEdit(c, 'cliente')}>
                    <div className="w-10 h-10 rounded-full bg-surface-500 mr-4 overflow-hidden border border-surface-400">
                      <img src={`https://i.pravatar.cc/150?u=${c.email}`} alt={c.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white group-hover:text-[#4da6ff] transition-colors truncate">{c.nombre} {c.apellido}</h4>
                      <p className="text-[10px] text-surface-600 truncate">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(c, 'cliente', true); }} className="p-1.5 text-surface-600 hover:text-[#4da6ff] hover:bg-[#4da6ff]/10 rounded-lg transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(c, 'cliente'); }} className="p-1.5 text-surface-600 hover:text-white hover:bg-surface-400 rounded-lg transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTrigger(c.id, 'cliente', `${c.nombre} ${c.apellido}`); }} className="p-1.5 text-surface-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* MODAL UNIFICADO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
            <button onClick={() => { setIsModalOpen(false); setEditingItem(null); resetForm(); }} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors z-10">
              <X className="w-6 h-6" />
            </button>

            {isReadOnly ? (
              <div className="p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-8 text-center" style={{ fontFamily: 'var(--font-unbounded)' }}>
                  DETALLES DE {personType.toUpperCase()}
                </h2>

                <div className="flex flex-col items-center mb-8">
                  <div className="w-28 h-28 rounded-full border-4 border-surface-400 overflow-hidden mb-4 bg-surface-300">
                    <img src={formData.foto || `https://i.pravatar.cc/150?u=${formData.email}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{formData.nombre} {formData.apellido}</h3>
                  <p className="text-primary text-xs uppercase tracking-widest font-bold">
                    {personType === 'empleado' ? formData.rol : formData.rango === 'vip' ? 'Cliente VIP (Enterprise)' : `Cliente Normal (${formData.suscripcion})`}
                  </p>
                </div>

                <div className="space-y-4 bg-surface-100 p-6 rounded-2xl border border-surface-400">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-1">Email</p>
                    <p className="text-white text-sm">{formData.email}</p>
                  </div>

                  {personType === 'empleado' ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-1">Salario Mensual</p>
                      <p className="text-white text-sm">${formData.salario}</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-1">Teléfono de Contacto</p>
                        <p className="text-white text-sm">{formData.telefono || 'No registrado'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-1">Dirección Registrada</p>
                        <p className="text-white text-sm">{formData.direccion || 'No registrada'}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end pt-8">
                  <button onClick={() => setIsModalOpen(false)} className="bg-surface-300 hover:bg-surface-400 text-white font-bold py-3 px-8 rounded-xl uppercase tracking-wider text-xs transition-all w-full md:w-auto">
                    Cerrar Vista
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>
                  {editingItem ? 'EDITAR' : 'REGISTRAR'} {personType.toUpperCase()}
                </h2>

                <div className="space-y-6">
                  {/* Selector de Tipo */}
                  {!editingItem && (
                    <div className="flex bg-surface-100 p-1 rounded-xl border border-surface-400">
                      <button
                        onClick={() => setPersonType('empleado')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${personType === 'empleado' ? 'bg-primary text-white shadow-lg' : 'text-surface-600 hover:text-white'}`}
                      >
                        Empleado
                      </button>
                      <button
                        onClick={() => setPersonType('cliente')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${personType === 'cliente' ? 'bg-[#4da6ff] text-white shadow-lg' : 'text-surface-600 hover:text-white'}`}
                      >
                        Cliente
                      </button>
                    </div>
                  )}

                  {/* Selector de Rango y Suscripción para Clientes */}
                  {personType === 'cliente' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-surface-600 font-bold mb-2">Nivel de Cliente</label>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setFormData({ ...formData, rango: 'normal', suscripcion: 'starter' })}
                            className={`flex-1 py-3 px-4 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${formData.rango === 'normal' ? 'border-[#4da6ff] bg-[#4da6ff]/10 text-[#4da6ff]' : 'border-surface-400 text-surface-600'}`}
                          >
                            Normal
                          </button>
                          <button
                            onClick={() => setFormData({ ...formData, rango: 'vip', suscripcion: 'enterprise' })}
                            className={`flex-1 py-3 px-4 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${formData.rango === 'vip' ? 'border-primary bg-primary/10 text-primary' : 'border-surface-400 text-surface-600'}`}
                          >
                            Frecuente / VIP
                          </button>
                        </div>
                      </div>

                      {formData.rango === 'normal' && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-surface-600 font-bold mb-2">Tipo de Suscripción</label>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => setFormData({ ...formData, suscripcion: 'starter' })}
                              className={`flex-1 py-2 px-4 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${formData.suscripcion === 'starter' ? 'border-[#00C48C] bg-[#00C48C]/10 text-[#00C48C]' : 'border-surface-400 text-surface-600'}`}
                            >
                              Starter (2 Proy.)
                            </button>
                            <button
                              onClick={() => setFormData({ ...formData, suscripcion: 'pro' })}
                              className={`flex-1 py-2 px-4 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${formData.suscripcion === 'pro' ? 'border-[#00C48C] bg-[#00C48C]/10 text-[#00C48C]' : 'border-surface-400 text-surface-600'}`}
                            >
                              Pro (Ilimitado)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 rounded-full bg-surface-100 border-2 border-dashed border-surface-400 flex flex-col items-center justify-center overflow-hidden group">
                      {formData.foto ? (
                        <img src={formData.foto} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload className={`w-6 h-6 text-surface-500 group-hover:text-primary transition-colors mb-1`} />
                          <span className="text-[8px] uppercase tracking-widest text-surface-500 text-center px-2">Subir Foto</span>
                        </>
                      )}
                      <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Nombre <span className="text-primary">*</span></label>
                      <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Apellido <span className="text-primary">*</span></label>
                      <input type="text" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Email <span className="text-primary">*</span></label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>

                  {personType === 'empleado' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Rol <span className="text-primary">*</span></label>
                        <select
                          value={formData.rol}
                          onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                          className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none font-bold"
                        >
                          <option value="Administrador">Administrador</option>
                          <option value="Desarrollador Frontend">Desarrollador Frontend</option>
                          <option value="Desarrollador Backend">Desarrollador Backend</option>
                          <option value="Analista de Marketing">Analista de Marketing</option>
                          <option value="Diseñador Digital">Diseñador Digital</option>
                          <option value="Desarrollador de Creadores UGC">Desarrollador de Creadores UGC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Salario <span className="text-primary">*</span></label>
                        <input type="number" value={formData.salario} onChange={(e) => setFormData({ ...formData, salario: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Teléfono <span className="text-primary">*</span></label>
                        <input type="tel" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Dirección <span className="text-primary">*</span></label>
                        <input type="text" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      className={`font-bold py-3 px-10 rounded-lg uppercase tracking-wider text-xs transition-all flex items-center shadow-lg ${personType === 'empleado' ? 'bg-primary hover:bg-red-600' : 'bg-[#4da6ff] hover:bg-blue-600'} text-white w-full md:w-auto justify-center`}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingItem ? 'Actualizar Datos' : 'Registrar Socio'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-200 border border-surface-400 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                <AlertTriangle className="w-10 h-10 text-primary" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide" style={{ fontFamily: 'var(--font-unbounded)' }}>
                ¿CONFIRMAR ELIMINACIÓN?
              </h3>

              <p className="text-surface-600 text-sm mb-8 leading-relaxed">
                Estás a punto de eliminar a <span className="text-white font-bold">{itemToDelete?.nombre}</span> de la base de datos. Esta acción no se puede deshacer.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="bg-surface-300 hover:bg-surface-400 text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-[10px] transition-all border border-surface-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-primary hover:bg-red-600 text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-[10px] transition-all shadow-[0_10px_20px_rgba(255,59,48,0.2)]"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
