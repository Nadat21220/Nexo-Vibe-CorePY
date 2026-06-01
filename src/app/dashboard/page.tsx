"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, ArrowUpRight, Target, ChevronRight, Settings, X, Save, Edit2, Trash2, GripVertical, PieChart as PieChartIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getClientSubscription, upgradeClientSubscription } from '@/lib/clienteStore';

const COLORS = {
  completadas: '#00C48C',
  en_proceso: '#FF3B30',
  revision: '#FFB800',
  pendientes: '#6B7280'
};

export default function Dashboard() {
  const { role, user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [taskData, setTaskData] = useState<any[]>([
    { name: 'Completadas', value: 0, color: COLORS.completadas },
    { name: 'En Proceso', value: 0, color: COLORS.en_proceso },
    { name: 'Revisión', value: 0, color: COLORS.revision },
    { name: 'Pendientes', value: 0, color: COLORS.pendientes },
  ]);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState({
    progresoPromedio: 0,
    presupuestoUsado: 0,
    presupuestoTotal: 0,
    clientesActivos: 0,
    suscripciones: {
      starter: { count: 0, name: 'Starter', desc: '' },
      pro: { count: 0, name: 'Pro', desc: '' },
      enterprise: { count: 0, name: 'Enterprise', desc: '' }
    }
  });
  const [dbName, setDbName] = useState('nexovibe_bd');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [urgentTasks, setUrgentTasks] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [objetivos, setObjetivos] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editObjetivos, setEditObjetivos] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allTasks, setAllTasks] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingObjetivoId, setEditingObjetivoId] = useState<string | null>(null);
  const [editTaskData, setEditTaskData] = useState<any>(null);

  const [clientSub, setClientSub] = useState(getClientSubscription());
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      const data = await res.json();

      let fetchedTasks = data.allTasks || [];
      setDbName(data.dbName || 'nexovibe_bd');
      let currentUrgentTasks = data.urgentTasks || [];

      if (role === 'empleado' && user?.email) {
        fetchedTasks = fetchedTasks.filter((t: any) => t.empleados_asignados && t.empleados_asignados.includes(user.email));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentUrgentTasks = fetchedTasks.filter((t: any) => t.prioridad === 'inmediata' || t.prioridad === 'high');
      } else if (role === 'cliente' && user?.email) {
        fetchedTasks = fetchedTasks.filter((t: any) => t.clientes_asignados && t.clientes_asignados.includes(user.email));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentUrgentTasks = fetchedTasks.filter((t: any) => t.prioridad === 'inmediata' || t.prioridad === 'high');
      }

      if (role === 'empleado' || role === 'cliente') {
        let calcCompletadas = 0, calcEnProceso = 0, calcRevision = 0, calcPendientes = 0;
        let calcPresupuestoUsado = 0, calcPresupuestoTotal = 0, calcSumaProgreso = 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetchedTasks.forEach((t: any) => {
          if (t.estado === 'Finalizado') calcCompletadas++;
          else if (t.estado === 'En desarrollo') calcEnProceso++;
          else if (t.estado === 'Suspendido') calcRevision++;
          else calcPendientes++;
          calcPresupuestoUsado += t.presupuesto_utilizado || 0;
          calcPresupuestoTotal += t.presupuesto_total || 0;
          calcSumaProgreso += t.progreso || 0;
        });

        setTotal(fetchedTasks.length);
        setTaskData([
          { name: 'Completadas', value: calcCompletadas, color: COLORS.completadas },
          { name: 'En Proceso', value: calcEnProceso, color: COLORS.en_proceso },
          { name: 'Revisión', value: calcRevision, color: COLORS.revision },
          { name: 'Pendientes', value: calcPendientes, color: COLORS.pendientes },
        ]);
        setMetrics({
          progresoPromedio: fetchedTasks.length > 0 ? Math.round(calcSumaProgreso / fetchedTasks.length) : 0,
          presupuestoUsado: calcPresupuestoUsado,
          presupuestoTotal: calcPresupuestoTotal,
          clientesActivos: data.clientes_activos || 0,
          suscripciones: data.suscripciones || { starter: { count: 0 }, pro: { count: 0 }, enterprise: { count: 0 } }
        });
      } else {
        setTotal(data.total);
        setTaskData([
          { name: 'Completadas', value: data.completadas, color: COLORS.completadas },
          { name: 'En Proceso', value: data.enProceso, color: COLORS.en_proceso },
          { name: 'Revisión', value: data.revision, color: COLORS.revision },
          { name: 'Pendientes', value: data.pendientes, color: COLORS.pendientes },
        ]);
        setMetrics({
          progresoPromedio: data.progreso_promedio || 0,
          presupuestoUsado: data.presupuesto_total_usado || 0,
          presupuestoTotal: data.presupuesto_total_asignado || 0,
          clientesActivos: data.clientes_activos || 0,
          suscripciones: data.suscripciones || { starter: { count: 0 }, pro: { count: 0 }, enterprise: { count: 0 } }
        });
      }

      setUrgentTasks(currentUrgentTasks);
      setAllTasks(fetchedTasks);
      setObjetivos(data.objetivos || []);
      setEditObjetivos(data.objetivos || []);
    } catch (e) {
      console.error("Error fetching dashboard stats", e);
    }
  };

  useEffect(() => {
    if (role !== null) fetchDashboardStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user?.email]);

  const handleSaveObjetivos = async () => {
    try {
      await fetch('/api/objetivos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objetivos: editObjetivos })
      });
      setObjetivos(editObjetivos);
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const onDragEndObjetivos = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(editObjetivos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditObjetivos(items);
    setObjetivos(items);

    try {
      await fetch('/api/objetivos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objetivos: items })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditTaskClick = (task: any) => {
    setEditingTaskId(task.id);
    setEditTaskData({ ...task });
  };

  const handleSaveTask = async () => {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTaskData)
      });
      setEditingTaskId(null);
      fetchDashboardStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    try {
      await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE'
      });
      fetchDashboardStats();
    } catch (e) {
      console.error(e);
    }
  };

  const eficiencia = total > 0 ? Math.round((taskData[0].value / total) * 100) : 0;

  return (
    <div className="flex-1 overflow-auto bg-background">
      <Header title="Resumen" />

      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>RESUMEN</h1>
          <p className="text-surface-600 uppercase tracking-widest text-xs">PANEL DE INTELIGENCIA OPERATIVA</p>
          <p className="text-xs text-surface-500 mt-2">Base de datos conectada: <strong className="text-white">{dbName}</strong></p>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-y-0 left-0 w-1 bg-primary"></div>
            <p className="text-[10px] uppercase tracking-widest text-surface-600 mb-1 font-bold">Progreso de Proyectos</p>
            <div className="flex items-end justify-between">
              <h2 className="text-4xl font-black text-white">{metrics.progresoPromedio}%</h2>
            </div>
            <div className="w-full bg-surface-400 h-1.5 mt-4 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${metrics.progresoPromedio}%` }}></div>
            </div>
          </div>
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-y-0 left-0 w-1 bg-[#00C48C]"></div>
            <p className="text-[10px] uppercase tracking-widest text-surface-600 mb-1 font-bold">Presupuesto Utilizado</p>
            <div className="flex items-end space-x-2">
              <h2 className="text-4xl font-black text-white">${metrics.presupuestoUsado.toLocaleString()}</h2>
              <span className="text-surface-500 font-bold mb-1">/ ${metrics.presupuestoTotal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-surface-400 h-1.5 mt-4 rounded-full overflow-hidden">
              <div className="bg-[#00C48C] h-full transition-all duration-1000" style={{ width: `${metrics.presupuestoTotal > 0 ? (metrics.presupuestoUsado / metrics.presupuestoTotal) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-6 shadow-lg relative overflow-hidden group flex flex-col justify-center">
            <div className="absolute inset-y-0 left-0 w-1 bg-[#FFB800]"></div>
            <p className="text-[10px] uppercase tracking-widest text-surface-600 mb-1 font-bold">Clientes Activos</p>
            <div className="flex items-end justify-between">
              <h2 className="text-4xl font-black text-white">{metrics.clientesActivos}</h2>
            </div>
          </div>
        </div>

        {/* SUBSCRIPTIONS ROW */}
        {role !== 'cliente' ? (
          <div className="mb-6 bg-surface-200 border border-surface-400 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-6">
              <Target className="w-4 h-4 text-primary mr-2" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">ESTADO DE SUSCRIPCIONES</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-300 border border-surface-400 rounded-xl p-5 relative overflow-hidden hover:border-surface-500 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-surface-500">Tier 1: Starter</span>
                  <span className="bg-surface-400 text-white text-[10px] font-bold px-2 py-1 rounded">MÁX 2 PROY.</span>
                </div>
                <p className="text-surface-600 text-[10px] mb-4 h-8">Puede crear hasta 2 proyectos básicos en la plataforma.</p>
                <div className="flex items-end">
                  <h3 className="text-3xl font-black text-white">{metrics.suscripciones.starter?.count || 0}</h3>
                  <span className="text-surface-500 text-xs ml-2 mb-1">clientes</span>
                </div>
              </div>

              <div className="bg-surface-300 border border-surface-400 rounded-xl p-5 relative overflow-hidden hover:border-surface-500 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00C48C]/10 rounded-bl-full"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-[#00C48C]">Tier 2: Pro</span>
                  <span className="bg-[#00C48C]/20 text-[#00C48C] border border-[#00C48C]/30 text-[10px] font-bold px-2 py-1 rounded">ILIMITADO</span>
                </div>
                <p className="text-surface-600 text-[10px] mb-4 h-8">Puede crear múltiples proyectos sin restricción de cantidad.</p>
                <div className="flex items-end">
                  <h3 className="text-3xl font-black text-white">{metrics.suscripciones.pro?.count || 0}</h3>
                  <span className="text-surface-500 text-xs ml-2 mb-1">clientes</span>
                </div>
              </div>

              <div className="bg-surface-300 border border-primary/50 rounded-xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(255,59,48,0.1)]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-primary">Tier 3: Enterprise</span>
                  <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold px-2 py-1 rounded flex items-center"><Target className="w-3 h-3 mr-1" /> VIP</span>
                </div>
                <p className="text-surface-600 text-[10px] mb-4 h-8">Todo de Tier 2 + contacto directo y alta eficiencia con empleados.</p>
                <div className="flex items-end">
                  <h3 className="text-3xl font-black text-white">{metrics.suscripciones.enterprise?.count || 0}</h3>
                  <span className="text-surface-500 text-xs ml-2 mb-1">clientes</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-surface-200 border border-surface-400 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Target className="w-4 h-4 text-[#00C48C] mr-2" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">MI SUSCRIPCIÓN</h3>
              </div>
              <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="bg-primary hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(255,59,48,0.2)]"
              >
                Mejorar Plan
              </button>
            </div>
            <div className="bg-surface-300 border border-[#00C48C]/50 rounded-xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(0,196,140,0.1)] max-w-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#00C48C]/10 rounded-bl-full"></div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-widest font-bold text-[#00C48C]">Suscripción Activa</span>
                <span className="bg-[#00C48C]/20 text-[#00C48C] border border-[#00C48C]/30 text-[10px] font-bold px-2 py-1 rounded">{clientSub.status}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-white">{clientSub.tier}</h3>
                <p className="text-surface-500 text-xs mt-1">Límite de proyectos: <span className="font-bold text-white">{clientSub.maxProjects}</span></p>
                <p className="text-surface-500 text-xs mt-1">Cliente desde: <span className="font-bold text-white">{clientSub.startDate}</span></p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda */}
          <div className="lg:col-span-7 bg-surface-200 border border-surface-400 rounded-2xl p-8 flex flex-col shadow-lg">
            <div className="flex items-center mb-6">
              <PieChartIcon className="w-4 h-4 text-primary mr-2" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">DISTRIBUCIÓN DE TAREAS</h3>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111111', borderColor: '#333333', color: '#F0F0F0' }}
                    itemStyle={{ color: '#F0F0F0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center space-x-6 mt-4 mb-8">
              {taskData.map((item) => (
                <div key={item.name} className="flex items-center text-xs text-surface-600 uppercase tracking-wide">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  {item.name}
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t border-surface-400 pt-6">
              <div>
                <p className="text-xs text-surface-600 uppercase tracking-widest mb-1">TOTAL ACTIVAS</p>
                <p className="text-3xl font-bold">{total}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-surface-600 uppercase tracking-widest mb-1">EFICIENCIA</p>
                <p className="text-3xl font-bold text-primary">{eficiencia}%</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-5 flex flex-col space-y-6">

            {/* Panel Objetivos e Impacto */}
            <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Target className="w-4 h-4 text-primary mr-2" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">OBJETIVOS E IMPACTO</h3>
                </div>
                {role === 'admin' && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-primary text-xs font-bold uppercase tracking-widest flex items-center hover:text-red-400 transition-colors"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    EDITAR
                  </button>
                )}
              </div>

              <div className="space-y-4 max-h-[190px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Dinámicos */}
                {objetivos.map(obj => (
                  <div key={obj.id} className={`border-l-2 pl-4 py-2 bg-surface-300/30 ${obj.tipo === 'critico' ? 'border-primary' : obj.tipo === 'alerta' ? 'border-[#FFB800]' : 'border-[#00C48C]'}`}>
                    <div className="flex items-center mb-1">
                      {obj.tipo === 'critico' ? (
                        <AlertCircle className="w-4 h-4 text-primary mr-2" />
                      ) : obj.tipo === 'alerta' ? (
                        <ArrowUpRight className="w-4 h-4 text-[#FFB800] mr-2" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#00C48C] mr-2 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#00C48C] rounded-full"></div>
                        </div>
                      )}
                      <h4 className={`font-bold uppercase text-xs tracking-wider ${obj.tipo === 'critico' ? 'text-primary' : obj.tipo === 'alerta' ? 'text-[#FFB800]' : 'text-[#00C48C]'}`}>{obj.titulo}</h4>
                    </div>
                    <p className="text-surface-600 text-xs italic ml-6">{obj.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tareas Críticas */}
            <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 flex-1 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-primary mr-2" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary">TAREAS CRÍTICAS</h3>
                </div>
                {role === 'admin' && (
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="bg-primary/20 hover:bg-primary/40 text-primary px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold border border-primary/30 transition-colors flex items-center"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    GESTIONAR TAREAS
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {urgentTasks.length > 0 ? urgentTasks.map(task => (
                  <Link href="/dashboard/kanban" key={task.id}>
                    <div className={`flex items-center justify-between group cursor-pointer p-3 rounded-xl transition-all duration-300 border-l-4 mb-3 relative overflow-hidden ${task.prioridad === 'inmediata' ? 'hover:bg-[#FF0055]/30 border-[#FF0055] shadow-[0_0_15px_rgba(255,0,85,0.15)] bg-gradient-to-r from-[#FF0055]/10 to-transparent' : 'hover:bg-red-900/30 border-red-500 shadow-[0_0_15px_rgba(255,59,48,0.15)] bg-gradient-to-r from-red-500/10 to-transparent'}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full animate-pulse ${task.prioridad === 'inmediata' ? 'bg-[#FF0055]' : 'bg-red-500'}`}></div>
                      <div className="pl-2">
                        <h4 className={`font-bold text-sm mb-1 text-white transition-colors flex items-center ${task.prioridad === 'inmediata' ? 'group-hover:text-[#FF0055]' : 'group-hover:text-red-400'}`}>
                          <AlertCircle className={`w-3 h-3 mr-2 animate-pulse ${task.prioridad === 'inmediata' ? 'text-[#FF0055]' : 'text-red-500'}`} />
                          {task.titulo}
                        </h4>
                        <div className="flex items-center text-xs ml-5">
                          <span className={`font-bold uppercase mr-2 tracking-widest text-[10px] px-2 py-0.5 rounded-sm ${task.prioridad === 'inmediata' ? 'text-[#FF0055] bg-[#FF0055]/20' : 'text-red-500 bg-red-500/20'}`}>{task.prioridad === 'inmediata' ? 'INMEDIATA' : 'URGENTE'}</span>
                          <span className="text-surface-500">— {task.fecha_limite}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-colors ${task.prioridad === 'inmediata' ? 'text-[#FF0055]/50 group-hover:text-[#FF0055]' : 'text-red-500/50 group-hover:text-red-400'}`} />
                    </div>
                  </Link>
                )) : (
                  <div className="border-l-2 border-surface-500 pl-4 py-2 bg-surface-300/30">
                    <div className="flex items-center mb-1">
                      <AlertCircle className="w-4 h-4 text-surface-500 mr-2" />
                      <h4 className="text-surface-500 font-bold uppercase text-xs tracking-wider">SIN TAREAS URGENTES</h4>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Modal de Edición de Objetivos (Amarillo y Verde) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-6 w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-surface-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 flex-shrink-0">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>
                EDITAR OBJETIVOS E IMPACTO
              </h2>
            </div>

            <DragDropContext onDragEnd={onDragEndObjetivos}>
              <Droppable droppableId="objetivos-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 overflow-y-auto pr-2 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  >
                    {editObjetivos.map((obj, index) => {
                      const isEditing = editingObjetivoId === obj.id;

                      if (isEditing) {
                        return (
                          <div key={obj.id} className="p-4 bg-surface-300/80 rounded-xl border border-primary shadow-lg">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-1">Título</label>
                                <input
                                  type="text"
                                  value={obj.titulo}
                                  onChange={(e) => {
                                    const newObjs = [...editObjetivos];
                                    newObjs[index].titulo = e.target.value;
                                    setEditObjetivos(newObjs);
                                  }}
                                  className="w-full bg-surface-100 border border-surface-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-1">Descripción</label>
                                <textarea
                                  value={obj.descripcion}
                                  onChange={(e) => {
                                    const newObjs = [...editObjetivos];
                                    newObjs[index].descripcion = e.target.value;
                                    setEditObjetivos(newObjs);
                                  }}
                                  className="w-full bg-surface-100 border border-surface-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-1">Importancia (Color)</label>
                                <select
                                  value={obj.tipo}
                                  onChange={(e) => {
                                    const newObjs = [...editObjetivos];
                                    newObjs[index].tipo = e.target.value;
                                    setEditObjetivos(newObjs);
                                  }}
                                  className="w-full bg-surface-100 border border-surface-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors uppercase"
                                >
                                  <option value="critico">Inmediato Rojo</option>
                                  <option value="alerta">Alerta Amarilla</option>
                                  <option value="cultura">Cultura Verde</option>
                                </select>
                              </div>

                              <div className="flex justify-end space-x-3 pt-2">
                                <button
                                  onClick={() => setEditingObjetivoId(null)}
                                  className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider text-surface-500 hover:text-white transition-colors"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => {
                                    handleSaveObjetivos();
                                    setEditingObjetivoId(null);
                                  }}
                                  className="bg-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg uppercase tracking-wider text-sm transition-colors flex items-center"
                                >
                                  <Save className="w-4 h-4 mr-2" /> Guardar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <Draggable key={obj.id} draggableId={obj.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-4 bg-surface-300/30 hover:bg-surface-300/50 rounded-xl border border-surface-500 transition-colors flex justify-between items-center group ${snapshot.isDragging ? 'shadow-xl shadow-primary/20 border-primary bg-surface-300' : ''}`}
                            >
                              <div className="flex-1 flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mr-3 text-surface-500 hover:text-white cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center mb-1">
                                    {obj.tipo === 'critico' ? (
                                      <span className="text-primary text-xs font-bold uppercase tracking-widest flex items-center mr-3"><AlertCircle className="w-4 h-4 mr-1" /> INMEDIATO</span>
                                    ) : obj.tipo === 'alerta' ? (
                                      <span className="text-[#FFB800] text-xs font-bold uppercase tracking-widest flex items-center mr-3"><ArrowUpRight className="w-4 h-4 mr-1" /> ALERTA</span>
                                    ) : (
                                      <span className="text-[#00C48C] text-xs font-bold uppercase tracking-widest flex items-center mr-3"><div className="w-3 h-3 rounded-full border-2 border-[#00C48C] mr-1 flex items-center justify-center"><div className="w-1 h-1 bg-[#00C48C] rounded-full"></div></div> CULTURA</span>
                                    )}
                                    <h4 className="font-bold text-white text-sm">{obj.titulo}</h4>
                                  </div>
                                  <p className="text-surface-600 text-xs ml-[120px] line-clamp-1">{obj.descripcion}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingObjetivoId(obj.id)}
                                  className="p-2 text-surface-500 hover:text-primary transition-colors bg-surface-200 rounded-lg"
                                  title="Editar Objetivo"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (!confirm("¿Seguro que deseas eliminar este objetivo?")) return;
                                    const filtered = editObjetivos.filter(o => o.id !== obj.id);
                                    setEditObjetivos(filtered);
                                    // Auto save on delete
                                    fetch('/api/objetivos', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ objetivos: filtered })
                                    }).then(() => fetchDashboardStats());
                                  }}
                                  className="p-2 text-surface-500 hover:text-red-500 transition-colors bg-surface-200 rounded-lg"
                                  title="Eliminar Objetivo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="mt-6 flex justify-between border-t border-surface-400 pt-4">
              <button
                onClick={() => {
                  const newObj = {
                    id: `obj_${Date.now()}`,
                    tipo: 'alerta',
                    titulo: 'NUEVO OBJETIVO',
                    descripcion: 'Descripción del objetivo'
                  };
                  setEditObjetivos([...editObjetivos, newObj]);
                  setEditingObjetivoId(newObj.id);
                }}
                className="text-surface-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
              >
                + AGREGAR OBJETIVO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Tareas */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-6 w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
            <button
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute top-4 right-4 text-surface-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 flex-shrink-0">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>
                GESTOR DE TAREAS Y MISIONES
              </h2>
              <p className="text-surface-600 text-xs uppercase tracking-widest">Aquí puedes cambiar la prioridad para volverlas críticas</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {allTasks.map((task) => {
                const isEditing = editingTaskId === task.id;

                if (isEditing && editTaskData) {
                  return (
                    <div key={task.id} className="p-4 bg-surface-300/80 rounded-xl border border-primary shadow-lg">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-1">Título</label>
                          <input
                            type="text"
                            value={editTaskData.titulo}
                            onChange={(e) => setEditTaskData({ ...editTaskData, titulo: e.target.value })}
                            className="w-full bg-surface-100 border border-surface-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-1">Descripción</label>
                          <textarea
                            value={editTaskData.descripcion}
                            onChange={(e) => setEditTaskData({ ...editTaskData, descripcion: e.target.value })}
                            className="w-full bg-surface-100 border border-surface-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-1">Prioridad</label>
                          <select
                            value={editTaskData.prioridad}
                            onChange={(e) => setEditTaskData({ ...editTaskData, prioridad: e.target.value })}
                            className="w-full bg-surface-100 border border-surface-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors uppercase"
                          >
                            <option value="inmediata">Inmediata (Aparecerá en Críticas)</option>
                            <option value="high">Alta</option>
                            <option value="medium">Media</option>
                            <option value="low">Baja</option>
                          </select>
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                          <button
                            onClick={() => setEditingTaskId(null)}
                            className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider text-surface-500 hover:text-white transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveTask}
                            className="bg-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg uppercase tracking-wider text-sm transition-colors flex items-center"
                          >
                            <Save className="w-4 h-4 mr-2" /> Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={task.id} className="p-4 bg-surface-300/30 hover:bg-surface-300/50 rounded-xl border border-surface-500 transition-colors flex justify-between items-center group">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mr-3 border ${task.prioridad === 'inmediata' ? 'bg-[#FF0055]/20 text-[#FF0055] border-[#FF0055]/30' :
                          task.prioridad === 'high' ? 'bg-surface-400/20 text-surface-400 border-surface-400/30' :
                            task.prioridad === 'medium' ? 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/30' :
                              'bg-surface-600/20 text-surface-600 border-surface-600/30'
                          }`}>
                          {task.prioridad}
                        </span>
                        <h4 className="font-bold text-white text-sm">{task.titulo}</h4>
                      </div>
                      <p className="text-surface-600 text-xs ml-[72px] line-clamp-1">{task.descripcion}</p>
                    </div>

                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditTaskClick(task)}
                        className="p-2 text-surface-500 hover:text-primary transition-colors bg-surface-200 rounded-lg"
                        title="Editar Misión"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-surface-500 hover:text-red-500 transition-colors bg-surface-200 rounded-lg"
                        title="Eliminar Misión"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Upgrade Plan */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 w-full max-w-3xl shadow-2xl relative">
            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute top-4 right-4 text-surface-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                MEJORAR PLAN DE SUSCRIPCIÓN
              </h2>
              <p className="text-surface-600 text-xs uppercase tracking-widest">Selecciona el plan que mejor se adapte a tus necesidades</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { tier: 'Starter', price: '$99/mo', desc: 'Ideal para individuos.', limit: '2 Proyectos' },
                { tier: 'Pro', price: '$299/mo', desc: 'Para equipos en crecimiento.', limit: 'Ilimitado', highlight: true },
                { tier: 'Enterprise', price: 'Personalizado', desc: 'Solución corporativa.', limit: 'Ilimitado + VIP' }
              ].map(plan => (
                <div 
                  key={plan.tier} 
                  className={`bg-surface-300 border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between transition-transform transform hover:scale-105 cursor-pointer ${plan.highlight ? 'border-primary shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-surface-400 hover:border-surface-500'}`}
                  onClick={() => {
                    const newSub = upgradeClientSubscription(plan.tier);
                    setClientSub(newSub);
                    setIsUpgradeModalOpen(false);
                    // Fetch to re-render local if necessary, but we are good.
                  }}
                >
                  {plan.highlight && <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg">RECOMENDADO</div>}
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">{plan.tier}</h3>
                    <p className="text-2xl font-bold text-white mb-4">{plan.price}</p>
                    <p className="text-surface-500 text-xs mb-4">{plan.desc}</p>
                    <div className="bg-surface-100 p-2 rounded text-[10px] text-surface-600 uppercase font-bold text-center border border-surface-400">
                      Límite: <span className="text-white">{plan.limit}</span>
                    </div>
                  </div>
                  <button className={`w-full mt-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${plan.highlight ? 'bg-primary hover:bg-red-600 text-white' : 'bg-surface-400 hover:bg-surface-500 text-white'}`}>
                    {clientSub.tier === plan.tier ? 'Plan Actual' : 'Seleccionar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
