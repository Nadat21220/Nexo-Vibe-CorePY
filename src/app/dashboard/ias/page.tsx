"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
// Removed mock import
import {
  Bot,
  X,
  Save,
  Cpu,
  Code,
  Video,
  Megaphone,
  Edit3,
  Eye,
  Info,
  AlertTriangle
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Desarrollo Web', name: 'Desarrollo Web', icon: Code, color: '#00C48C' },
  { id: 'Diseño y Branding', name: 'Diseño y Branding', icon: Video, color: '#FF3B30' },
  { id: 'Marketing de Contenidos potenciado con IA', name: 'Marketing con IA', icon: Megaphone, color: '#FFB800' }
];

export default function IASPage() {
  const { user, role } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form state for details
  const [details, setDetails] = useState({
    categoria: '',
    ias_usadas: '',
    detalles_proyecto: ''
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchTasks = async (currentRole?: string | null, currentEmail?: string) => {
    const r = currentRole !== undefined ? currentRole : role;
    const e = currentEmail !== undefined ? currentEmail : user?.email;
    try {
      const res = await fetch('/api/tasks', { cache: 'no-store' });
      const data = await res.json();
      let fetchedTasks = data.tareas || [];

      if (r === 'empleado' && e) {
        fetchedTasks = fetchedTasks.filter((t: any) => t.empleados_asignados && t.empleados_asignados.includes(e));
      } else if (r === 'cliente' && e) {
        fetchedTasks = fetchedTasks.filter((t: any) => t.clientes_asignados && t.clientes_asignados.includes(e));
      }

      setTasks(fetchedTasks);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks for IAS management", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== null) fetchTasks(role, user?.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user?.email]);

  const handleOpenDetails = (task: any) => {
    setSelectedTask(task);
    setDetails({
      categoria: task.categoria || '',
      ias_usadas: task.ias_usadas || '',
      detalles_proyecto: task.detalles_proyecto || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveDetails = async () => {
    if (!selectedTask) return;

    // Validación de campos requeridos
    if (!details.categoria || !details.ias_usadas.trim() || !details.detalles_proyecto.trim()) {
      showToast("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTask.id,
          ...details
        })
      });
      setIsModalOpen(false);
      fetchTasks();
      showToast("¡Detalles técnicos actualizados!", "success");
    } catch (error) {
      console.error("Error saving task details", error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    // Hide completed tasks
    if (task.estado === 'Finalizado') return false;

    // We already filter employee tasks in fetchTasks via mergeWithApi
    return true;
  });

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
      <Header title="Gestión de Tecnologías" />

      <main className="p-8 max-w-7xl mx-auto w-full flex-1 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-white mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>GESTIÓN DE Tecnologías</h1>
          <p className="text-surface-600 uppercase tracking-widest text-xs">DETALLES TÉCNICOS Y HERRAMIENTAS DE INTELIGENCIA ARTIFICIAL</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-600 uppercase tracking-widest text-sm">
            Cargando proyectos...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-surface-200 border border-dashed border-surface-400 rounded-2xl p-20 text-center">
            <Bot className="w-12 h-12 text-surface-400 mx-auto mb-4 opacity-20" />
            <p className="text-surface-600 uppercase tracking-widest text-sm italic">No hay proyectos activos para gestionar detalles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => {
              const category = CATEGORIES.find(c => c.id === task.categoria);
              return (
                <div
                  key={task.id}
                  className="bg-surface-200 border border-surface-400 rounded-2xl p-6 shadow-lg hover:border-primary transition-all group flex flex-col h-full relative overflow-hidden"
                >
                  {/* Category Badge */}
                  {category && (
                    <div className="absolute top-0 right-0 p-4">
                      <category.icon className="w-5 h-5 opacity-20" style={{ color: category.color }} />
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">PROYECTO ACTIVO</p>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{task.titulo}</h3>
                  </div>

                  <div className="flex-1 space-y-4 mb-6">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-surface-600 mb-1 font-bold">CATEGORÍA</p>
                      <div className="flex items-center">
                        {category ? (
                          <div className="flex items-center px-2 py-1 bg-surface-300 rounded border border-surface-400">
                            <category.icon className="w-3 h-3 mr-2" style={{ color: category.color }} />
                            <span className="text-[10px] font-bold text-white uppercase">{category.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-surface-500 italic">No especificada</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-surface-600 mb-1 font-bold">IAS EN USO</p>
                      <p className="text-xs text-surface-500 line-clamp-2 italic">
                        {task.ias_usadas || "Sin herramientas registradas..."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-surface-400 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {task.empleados_asignados?.map((email: string, i: number) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-background bg-surface-500 flex items-center justify-center text-[8px] text-white overflow-hidden" title={email}>
                          <img src={`https://i.pravatar.cc/100?u=${email}`} alt="Avatar" />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleOpenDetails(task)}
                      className="flex items-center text-[10px] font-bold uppercase tracking-widest text-primary hover:text-red-400 transition-colors"
                    >
                      {role === 'admin' || role === 'empleado' ? <Edit3 className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {role === 'admin' || role === 'empleado' ? "Editar Detalles" : "Ver Detalles"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL DETALLES DE IA / PROYECTO */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <div className="flex items-center text-primary mb-2">
                <Cpu className="w-5 h-5 mr-2" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Configuración Técnica</p>
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-unbounded)' }}>{selectedTask.titulo}</h2>
              <p className="text-surface-600 text-xs mt-1 italic">{selectedTask.descripcion}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Especialidad del Proyecto <span className="text-primary">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      disabled={role !== 'admin' && role !== 'empleado'} // Only admin/employee can edit if allowed
                      onClick={() => setDetails({ ...details, categoria: cat.id })}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${details.categoria === cat.id
                        ? 'bg-surface-300 border-primary shadow-[0_0_15px_rgba(255,59,48,0.1)]'
                        : 'bg-surface-100 border-surface-400 hover:border-surface-600 opacity-60 grayscale'
                        }`}
                    >
                      <cat.icon className={`w-6 h-6 mb-2 ${details.categoria === cat.id ? 'text-primary' : 'text-surface-600'}`} style={{ color: details.categoria === cat.id ? cat.color : undefined }} />
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${details.categoria === cat.id ? 'text-white' : 'text-surface-600'}`}>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Herramientas de IA Utilizadas <span className="text-primary">*</span></label>
                <textarea
                  value={details.ias_usadas}
                  readOnly={role !== 'admin' && role !== 'empleado'}
                  onChange={(e) => setDetails({ ...details, ias_usadas: e.target.value })}
                  className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]"
                  placeholder="Ej: ChatGPT para copy, Midjourney para activos visuales, ElevenLabs para voz..."
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Detalles Adicionales del Proyecto <span className="text-primary">*</span></label>
                <textarea
                  value={details.detalles_proyecto}
                  readOnly={role !== 'admin' && role !== 'empleado'}
                  onChange={(e) => setDetails({ ...details, detalles_proyecto: e.target.value })}
                  className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[120px]"
                  placeholder="Especificaciones técnicas, requerimientos del cliente, enlaces a recursos..."
                />
              </div>

              {(role === 'admin' || role === 'empleado') && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveDetails}
                    className="bg-primary hover:bg-red-600 text-white font-bold py-3 px-10 rounded-lg uppercase tracking-wider text-xs transition-colors flex items-center shadow-lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </button>
                </div>
              )}

              {role !== 'admin' && role !== 'empleado' && (
                <div className="flex items-center justify-center p-4 bg-surface-300/50 rounded-lg border border-surface-400">
                  <Info className="w-4 h-4 text-surface-600 mr-2" />
                  <p className="text-[10px] text-surface-600 uppercase tracking-widest">Modo lectura - Solo personal asignado puede editar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
