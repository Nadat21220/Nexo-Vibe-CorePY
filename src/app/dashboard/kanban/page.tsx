"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Filter, Trash2, Plus, MessageSquare, Calendar, X, Save, Paperclip, AlertTriangle } from 'lucide-react';


const PRIORITY_COLORS: Record<string, string> = {
  inmediata: '#FF0055',
  high: '#333333',
  medium: '#FFB800',
  low: '#6B7280'
};

const COLUMNS = [
  { id: 'Cancelado', title: 'TO DO' },
  { id: 'En desarrollo', title: 'IN PROGRESS' },
  { id: 'Suspendido', title: 'REVIEW' },
  { id: 'Finalizado', title: 'DONE' },
];

export default function KanbanPage() {
  const { role, user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tasks, setTasks] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Delete Mode States
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form states
  const [newTaskData, setNewTaskData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'low',
    campana: '',
    adjuntos: [] as any[],
    empleados_asignados: [] as string[],
    clientes_asignados: [] as string[],
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_limite: new Date().toISOString().split('T')[0],
    progreso: 0,
    presupuesto_total: 0
  });

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case 'inmediata': return '🔥 INMEDIATA';
      case 'high': return '⚫ ALTA';
      case 'medium': return '🟡 MEDIA';
      case 'low': return '⚪ BAJA';
      default: return p;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchTasksData = async (currentRole?: string | null, currentEmail?: string) => {
    const r = currentRole !== undefined ? currentRole : role;
    const e = currentEmail !== undefined ? currentEmail : user?.email;
    try {
      const res = await fetch('/api/tasks', { cache: 'no-store' });
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let finalTasks = data.tareas || [];
      if (r === 'empleado' && e) {
        finalTasks = finalTasks.filter((t: any) => t.empleados_asignados && t.empleados_asignados.includes(e));
      } else if (r === 'cliente' && e) {
        finalTasks = finalTasks.filter((t: any) => t.clientes_asignados && t.clientes_asignados.includes(e));
      }
      setTasks(finalTasks);
      setEmpleados(data.empleados || []);
      setClientes(data.clientes || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== null) fetchTasksData(role, user?.email);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user?.email]);

  const handleCreateTask = async () => {
    if (
      !newTaskData.titulo.trim() ||
      !newTaskData.descripcion.trim() ||
      newTaskData.empleados_asignados.length === 0 ||
      !newTaskData.fecha_inicio ||
      !newTaskData.fecha_limite ||
      !newTaskData.prioridad
    ) {
      showToast('Por favor, completa todos los campos obligatorios.');
      return;
    }

    let initialStatus = 'Cancelado';
    const p = newTaskData.progreso;
    if (p >= 0 && p <= 20) initialStatus = 'Cancelado';
    else if (p > 20 && p <= 70) initialStatus = 'En desarrollo';
    else if (p > 70 && p < 100) initialStatus = 'Suspendido';
    else if (p === 100) initialStatus = 'Finalizado';

    const newTask = {
      id: `task_${Date.now()}`,
      titulo: newTaskData.titulo,
      descripcion: newTaskData.descripcion,
      prioridad: newTaskData.prioridad,
      campana: newTaskData.campana,
      adjuntos: newTaskData.adjuntos,
      empleados_asignados: newTaskData.empleados_asignados,
      clientes_asignados: newTaskData.clientes_asignados,
      fecha_inicio: newTaskData.fecha_inicio,
      fecha_limite: newTaskData.fecha_limite,
      progreso: newTaskData.progreso,
      presupuesto_total: newTaskData.presupuesto_total,
      presupuesto_utilizado: 0,
      estado: initialStatus,
      comentarios: [],
      categoria: '',
      ias_usadas: '',
      detalles_proyecto: ''
    };

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(`Error al crear proyecto: ${errorData.message || 'Fallo en servidor'}`, 'error');
        return;
      }
      setIsNewTaskModalOpen(false);
      setNewTaskData({ titulo: '', descripcion: '', prioridad: 'low', campana: '', adjuntos: [], empleados_asignados: [], clientes_asignados: [], fecha_inicio: new Date().toISOString().split('T')[0], fecha_limite: new Date().toISOString().split('T')[0], progreso: 0, presupuesto_total: 0 });
      fetchTasksData();
      showToast('¡Proyecto creado con éxito!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Error de conexión', 'error');
    }
  };

  const toggleEmpleado = (email: string) => {
    setNewTaskData(prev => {
      const isSelected = prev.empleados_asignados.includes(email);
      if (isSelected) {
        return { ...prev, empleados_asignados: prev.empleados_asignados.filter(e => e !== email) };
      } else {
        return { ...prev, empleados_asignados: [...prev.empleados_asignados, email] };
      }
    });
  };

  const toggleCliente = (id: string) => {
    setNewTaskData(prev => {
      const isSelected = prev.clientes_asignados.includes(id);
      if (isSelected) {
        return { ...prev, clientes_asignados: prev.clientes_asignados.filter(c => c !== id) };
      } else {
        return { ...prev, clientes_asignados: [...prev.clientes_asignados, id] };
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAdjunto = {
        nombre: file.name,
        tamaño: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        tipo: file.type.split('/')[1] || 'archivo'
      };
      setNewTaskData(prev => ({ ...prev, adjuntos: [...prev.adjuntos, newAdjunto] }));
    }
  };
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      const res = await fetch(`/api/tasks?id=${taskToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        showToast('Error al eliminar proyecto', 'error');
        return;
      }
      setTaskToDelete(null);
      setIsDeleteMode(false);
      fetchTasksData();
      showToast('Proyecto eliminado correctamente', 'success');
    } catch (e) { 
      console.error(e); 
      showToast('Error de conexión', 'error');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const newTasks = Array.from(tasks);
    const taskIndex = newTasks.findIndex(t => t.id === draggableId);
    if (destination.droppableId === 'Finalizado' && (newTasks[taskIndex].progreso || 0) < 100) {
      showToast("No se puede mover a 'DONE' porque el progreso no es 100%.", 'error');
      return;
    }
    const updatedTask = { ...newTasks[taskIndex], estado: destination.droppableId };
    newTasks.splice(taskIndex, 1);
    const merged = [...newTasks, updatedTask];
    setTasks(merged);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggableId, estado: destination.droppableId })
      });
      if (!res.ok) {
        showToast('Error al mover la tarea', 'error');
      }
    } catch (error) { 
      console.error('Error updating task status', error); 
      showToast('Error de red', 'error');
    }
  };

  const pendingCount = tasks.filter(t => t.estado !== 'Finalizado').length;
  const doneCount = tasks.filter(t => t.estado === 'Finalizado').length;
  const efficiency = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

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
      <Header title="Tablero de Proyectos" />

      <div className="p-6 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>Tablero de Proyectos</h1>
            <p className="text-surface-600 text-xs md:text-sm">Gestión operativa y flujo de trabajo.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:space-x-4 md:gap-0">
            <div className="relative group">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="appearance-none bg-surface-200 border border-surface-400 text-surface-600 hover:text-white transition-colors text-sm px-3 py-1.5 pl-8 rounded cursor-pointer focus:outline-none focus:border-primary"
              >
                <option value="all">Prioridad: Todas</option>
                <option value="inmediata">🔥 Inmediata</option>
                <option value="high">⚫ Alta</option>
                <option value="medium">🟡 Media</option>
                <option value="low">⚪ Baja</option>
              </select>
              <Filter className="w-4 h-4 text-surface-600 group-hover:text-white transition-colors absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {role === 'admin' && (
              <button
                onClick={() => setIsDeleteMode(!isDeleteMode)}
                className={`flex items-center text-sm font-bold transition-colors border px-3 py-1.5 rounded ${isDeleteMode ? 'bg-primary text-white border-primary hover:bg-red-600' : 'text-primary hover:text-red-400 border-primary/30 bg-primary/10'}`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleteMode ? 'Cancelar Eliminación' : 'Eliminar Tarea'}
              </button>
            )}
            {role !== 'cliente' && (
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="flex items-center text-sm font-bold text-white bg-primary hover:bg-red-600 transition-all px-4 py-2 rounded-xl uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(255,59,48,0.2)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proyecto
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-4 md:p-6 shadow-md">
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-surface-600 mb-1">PENDIENTES</p>
            <p className="text-xl md:text-2xl font-bold text-white">{pendingCount}</p>
          </div>
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-4 md:p-6 shadow-md">
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-surface-600 mb-1">EFICIENCIA</p>
            <p className="text-xl md:text-2xl font-bold text-primary">{efficiency}%</p>
          </div>
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-4 md:p-6 shadow-md">
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-surface-600 mb-1">CAMPAÑAS</p>
            <p className="text-xl md:text-2xl font-bold text-white">3</p>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto">
          {!loading && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex space-x-6 min-w-max h-full pb-4">
                {COLUMNS.map((column) => {
                  const columnTasks = tasks.filter(t => t.estado === column.id && (filterPriority === 'all' || t.prioridad === filterPriority));
                  return (
                    <div key={column.id} className="w-[320px] flex flex-col">
                      <div className="flex items-center mb-4 text-xs font-bold text-surface-600 uppercase tracking-widest">
                        {column.title} <span className="ml-2 bg-surface-200 px-2 py-0.5 rounded-full text-white">{columnTasks.length}</span>
                      </div>

                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 overflow-y-auto transition-colors rounded-lg ${snapshot.isDraggingOver ? 'bg-surface-300/30' : ''}`}
                          >
                            <div className="space-y-4">
                              {columnTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={role === 'cliente'}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`bg-surface-200 border border-surface-400 rounded-2xl p-5 shadow-lg flex flex-col relative overflow-hidden ${snapshot.isDragging ? 'opacity-80 ring-2 ring-primary scale-[1.02]' : ''}`}
                                      style={{
                                        ...provided.draggableProps.style,
                                        borderLeft: `3px solid ${PRIORITY_COLORS[task.prioridad] || '#6B7280'}`
                                      }}
                                    >
                                      {isDeleteMode && (
                                        <div
                                          className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] z-20 flex items-center justify-center cursor-pointer transition-all hover:bg-red-500/30"
                                          onClick={() => setTaskToDelete(task)}
                                        >
                                          <Trash2 className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(255,59,48,0.8)]" />
                                        </div>
                                      )}
                                      <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => {
                                          setSelectedTask(task);
                                          setIsTaskDetailsOpen(true);
                                        }}
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: PRIORITY_COLORS[task.prioridad] || '#fff' }}>
                                            NEXOCORE REDESIGN
                                          </div>
                                          <div className="w-6 h-6 rounded-full bg-surface-400 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/150?u=${task.asignado_a}`} alt="Avatar" className="w-full h-full object-cover" />
                                          </div>
                                        </div>

                                        <h3 className="font-bold text-white mb-1">{task.titulo}</h3>
                                        <p className="text-xs text-surface-600 mb-4 line-clamp-2">{task.descripcion}</p>

                                        <div className="flex items-center justify-between mt-auto">
                                          <div className="flex items-center space-x-3 text-xs text-surface-600">
                                            <div className="flex items-center">
                                              <Calendar className="w-3 h-3 mr-1" />
                                              {task.fecha_limite}
                                            </div>
                                          </div>
                                          <div className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${task.prioridad === 'inmediata' ? 'bg-[#FF0055] text-white' : 'bg-surface-400 text-white'}`}>
                                            {getPriorityLabel(task.prioridad)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* MODAL NUEVA TAREA */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button onClick={() => setIsNewTaskModalOpen(false)} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>CREAR NUEVO PROYECTO</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Nombre del Proyecto <span className="text-primary">*</span></label>
                <input type="text" value={newTaskData.titulo} onChange={(e) => setNewTaskData({ ...newTaskData, titulo: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Ej: Rediseño Web NexoVibe" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Descripción <span className="text-primary">*</span></label>
                <textarea value={newTaskData.descripcion} onChange={(e) => setNewTaskData({ ...newTaskData, descripcion: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[100px]" placeholder="Detalles de lo que se debe hacer..." />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Importancia <span className="text-primary">*</span></label>
                  <select value={newTaskData.prioridad} onChange={(e) => setNewTaskData({ ...newTaskData, prioridad: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors uppercase font-bold">
                    <option value="inmediata">🔥 INMEDIATA</option>
                    <option value="high">⚫ ALTA</option>
                    <option value="medium">🟡 MEDIA</option>
                    <option value="low">⚪ BAJA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Fecha de Inicio <span className="text-primary">*</span></label>
                  <input type="date" value={newTaskData.fecha_inicio} onChange={(e) => setNewTaskData({ ...newTaskData, fecha_inicio: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Fecha de Cierre <span className="text-primary">*</span></label>
                  <input type="date" value={newTaskData.fecha_limite} onChange={(e) => setNewTaskData({ ...newTaskData, fecha_limite: e.target.value })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Presupuesto Total (USD)</label>
                  <input type="number" value={newTaskData.presupuesto_total} onChange={(e) => setNewTaskData({ ...newTaskData, presupuesto_total: Number(e.target.value) })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Progreso Inicial (%)</label>
                  <input type="number" min="0" max="100" value={newTaskData.progreso} onChange={(e) => setNewTaskData({ ...newTaskData, progreso: Number(e.target.value) })} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Empleados Asignados <span className="text-primary">*</span></label>
                  <div className="bg-surface-100 border border-surface-400 rounded-lg p-2 max-h-[160px] overflow-y-auto space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {empleados.map((emp: any) => {
                      const isSelected = newTaskData.empleados_asignados.includes(emp.email);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => toggleEmpleado(emp.email)}
                          className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/20 border border-primary/50' : 'hover:bg-surface-200 border border-transparent'}`}
                        >
                          <div className={`w-4 h-4 rounded mr-3 flex items-center justify-center border transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-surface-400'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                          </div>
                          <img src={`https://i.pravatar.cc/150?u=${emp.email}`} alt="Avatar" className="w-6 h-6 rounded-full mr-3" />
                          <div className="flex flex-col">
                            <span className="text-sm text-white leading-none font-bold mb-1">{emp.nombre} {emp.apellido}</span>
                            <span className="text-[10px] text-surface-500 leading-none">{emp.email}</span>
                          </div>
                        </div>
                      );
                    })}
                    {empleados.length === 0 && (
                      <p className="text-surface-600 text-xs text-center py-4 italic">No hay empleados disponibles.</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Clientes Asignados</label>
                  <div className="bg-surface-100 border border-surface-400 rounded-lg p-2 max-h-[160px] overflow-y-auto space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {clientes.map((cli: any) => {
                      const isSelected = newTaskData.clientes_asignados.includes(cli.id);
                      return (
                        <div
                          key={cli.id}
                          onClick={() => toggleCliente(cli.id)}
                          className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-[#00C48C]/20 border border-[#00C48C]/50' : 'hover:bg-surface-200 border border-transparent'}`}
                        >
                          <div className={`w-4 h-4 rounded mr-3 flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#00C48C] border-[#00C48C]' : 'border-surface-400'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                          </div>
                          <img src={`https://i.pravatar.cc/150?u=${cli.email}`} alt="Avatar" className="w-6 h-6 rounded-full mr-3" />
                          <div className="flex flex-col">
                            <span className="text-sm text-white leading-none font-bold mb-1">{cli.nombre} {cli.apellido}</span>
                            <span className="text-[10px] text-surface-500 leading-none">{cli.email}</span>
                          </div>
                        </div>
                      );
                    })}
                    {clientes.length === 0 && (
                      <p className="text-surface-600 text-xs text-center py-4 italic">No hay clientes disponibles.</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Archivos Adjuntos</label>
                <div className="border-2 border-dashed border-surface-400 rounded-xl p-4 flex flex-col justify-center items-center relative overflow-hidden group">
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <Paperclip className="w-8 h-8 text-surface-500 mb-2 group-hover:text-primary transition-colors" />
                  <p className="text-sm text-surface-500 group-hover:text-white transition-colors text-center">Haz clic o arrastra un archivo aquí</p>
                </div>
                {newTaskData.adjuntos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {newTaskData.adjuntos.map((adj, i) => (
                      <div key={i} className="flex justify-between items-center bg-surface-100 border border-surface-400 px-3 py-2 rounded-lg">
                        <div className="flex items-center">
                          <Paperclip className="w-4 h-4 text-primary mr-2" />
                          <span className="text-sm text-white">{adj.nombre}</span>
                        </div>
                        <span className="text-[10px] text-surface-500">{adj.tamaño}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <button onClick={handleCreateTask} className="bg-primary hover:bg-red-600 text-white font-bold py-3.5 px-10 rounded-xl uppercase tracking-widest text-[10px] transition-all flex items-center shadow-[0_10px_20px_rgba(255,59,48,0.2)]">
                  <Save className="w-4 h-4 mr-2" />
                  GUARDAR PROYECTO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES DE LA TAREA */}
      {isTaskDetailsOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-0 w-full max-w-4xl shadow-2xl relative h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-surface-400 bg-surface-300 flex justify-between items-center">
              <div>
                <div className={`inline-block px-3 py-1 rounded text-xs uppercase font-bold tracking-wider mb-2 ${selectedTask.prioridad === 'inmediata' ? 'bg-[#FF0055] text-white' : 'bg-surface-400 text-white'}`}>
                  {getPriorityLabel(selectedTask.prioridad)}
                </div>
                <h2 className="text-3xl font-bold text-white leading-none">{selectedTask.titulo}</h2>
              </div>
              <button onClick={() => setIsTaskDetailsOpen(false)} className="text-surface-500 hover:text-white transition-colors bg-surface-100 p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Info */}
              <div className="flex-1 p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="mb-8">
                  <h3 className="text-xs uppercase tracking-widest text-surface-600 mb-2 font-bold flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" /> Descripción
                  </h3>
                  <p className="text-surface-500 text-sm leading-relaxed">{selectedTask.descripcion}</p>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-surface-600 mb-3 font-bold">Asignados</h3>
                    <div className="space-y-2">
                      {selectedTask.empleados_asignados?.length > 0 ? selectedTask.empleados_asignados.map((emp: string, i: number) => {
                        const empleadoInfo = empleados.find((e: any) => e.email === emp);
                        return (
                          <div key={i} className="flex items-center bg-surface-100 px-3 py-2 rounded-lg border border-surface-400">
                            <img src={`https://i.pravatar.cc/150?u=${emp}`} alt="Avatar" className="w-6 h-6 rounded-full mr-3" />
                            <div className="flex flex-col">
                              <span className="text-sm text-white leading-none mb-1 font-bold">{empleadoInfo ? `${empleadoInfo.nombre} ${empleadoInfo.apellido}` : emp}</span>
                              <span className="text-[10px] text-surface-500 leading-none">{emp}</span>
                            </div>
                          </div>
                        );
                      }) : <p className="text-surface-600 text-xs italic">Nadie asignado.</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-surface-600 mb-3 font-bold text-primary">Plazos</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <span className="text-surface-600 w-16">Inicio:</span>
                        <span className="text-white font-bold bg-surface-100 px-2 py-1 rounded border border-surface-400">{selectedTask.fecha_inicio || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-surface-600 w-16">Cierre:</span>
                        <span className="text-white font-bold bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded">{selectedTask.fecha_limite || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-6 bg-surface-100 p-6 rounded-2xl border border-surface-400">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs uppercase tracking-widest text-white font-bold flex items-center">
                        <Save className="w-4 h-4 mr-2 text-primary" /> Progreso del Proyecto
                      </h3>
                      <span className="text-primary font-black text-sm">{selectedTask.progreso || 0}%</span>
                    </div>
                    <div className="relative h-4 bg-surface-300 rounded-full overflow-hidden border border-surface-400">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_15px_rgba(255,59,48,0.5)] transition-all duration-500"
                        style={{ width: `${selectedTask.progreso || 0}%` }}
                      ></div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedTask.progreso || 0}
                        disabled={role === 'cliente'}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSelectedTask({ ...selectedTask, progreso: val });
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                    </div>
                    <p className="text-[9px] text-surface-600 mt-2 uppercase tracking-widest text-center italic">Desliza para actualizar el avance</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-300 p-3 rounded-xl border border-surface-400">
                      <p className="text-[9px] text-surface-600 uppercase tracking-widest font-bold mb-1 text-center">Presupuesto Total</p>
                      <p className="text-lg font-black text-white text-center">${selectedTask.presupuesto_total || 0}</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/30">
                      <p className="text-[9px] text-primary uppercase tracking-widest font-bold mb-1 text-center">Utilizado</p>
                      <div className="flex items-center justify-center">
                        <span className="text-white text-xs mr-1">$</span>
                        <input
                          type="number"
                          value={selectedTask.presupuesto_utilizado || 0}
                          disabled={role === 'cliente'}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSelectedTask({ ...selectedTask, presupuesto_utilizado: val });
                          }}
                          className="w-full bg-transparent border-none text-lg font-black text-white text-center focus:outline-none p-0"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      let newEstado = selectedTask.estado;
                      if (selectedTask.progreso === 100) {
                        newEstado = 'Finalizado';
                      } else if (selectedTask.progreso < 100 && selectedTask.estado === 'Finalizado') {
                        newEstado = 'En desarrollo';
                      }
                      try {
                        await fetch('/api/tasks', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            id: selectedTask.id, 
                            progreso: selectedTask.progreso,
                            presupuesto_utilizado: selectedTask.presupuesto_utilizado,
                            estado: newEstado
                          })
                        });
                        setIsTaskDetailsOpen(false);
                        fetchTasksData();
                        showToast('Cambios guardados con éxito', 'success');
                      } catch (e) { console.error(e); }
                    }}
                    className="w-full flex items-center justify-center p-3 bg-primary hover:bg-red-600 border border-primary text-white font-bold rounded-xl uppercase tracking-widest transition-colors text-[10px]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-red-500/30 rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(255,59,48,0.15)] relative text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
              <Trash2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>¿ELIMINAR TAREA?</h2>
            <p className="text-surface-500 text-sm mb-6">
              Estás a punto de eliminar permanentemente la tarea:<br />
              <strong className="text-white">&quot;{taskToDelete.titulo}&quot;</strong>.<br />
              ¿Estás seguro de esto? Esta acción no se puede deshacer.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => setTaskToDelete(null)}
                className="flex-1 bg-surface-100 hover:bg-surface-300 border border-surface-400 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTask}
                className="flex-1 bg-primary hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-xs transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
