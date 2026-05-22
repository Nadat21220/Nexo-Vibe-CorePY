"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Clock, Trash2, Save, Info, EyeOff, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mergeWithApi } from '@/lib/empleadoStore';
import { mergeWithApiClient } from '@/lib/clienteStore';

export default function CalendarPage() {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventos, setEventos] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [socios, setSocios] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dayItems, setDayItems] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    titulo: '',
    descripcion: '',
    hora: '12:00',
    fecha: '',
    prioridad: 'normal',
    audiencia: [] as string[],
    esPrivado: false,
    color: '#3b82f6' // Default blue
  });

  const fetchData = async (currentRole?: string | null, currentEmail?: string) => {
    const r = currentRole !== undefined ? currentRole : role;
    const e = currentEmail !== undefined ? currentEmail : user?.email;
    try {
      const [resCal, resTasks, resSocios] = await Promise.all([
        fetch('/api/calendar'),
        fetch('/api/tasks'),
        fetch('/api/socios')
      ]);
      const dataCal = await resCal.json();
      const dataTasks = await resTasks.json();
      const dataSocios = await resSocios.json();
      
      if (r === 'cliente') {
        const misEventos = (dataCal.eventos || []).filter((event: any) => event.autor === e && event.esPrivado);
        setEventos(misEventos);
      } else {
        setEventos(dataCal.eventos || []);
      }
      
      let fetchedProyectos = dataTasks.tareas || [];
      if (r === 'empleado' && e) {
        fetchedProyectos = mergeWithApi(fetchedProyectos, e);
      } else if (r === 'cliente' && e) {
        fetchedProyectos = mergeWithApiClient(fetchedProyectos, e);
      }
      // Ocultar completados
      fetchedProyectos = fetchedProyectos.filter((p: any) => p.estado !== 'done');
      
      setProyectos(fetchedProyectos);
      setSocios(dataSocios.socios || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (role !== null) fetchData(role, user?.email);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user?.email]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start (standard in many regions)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    // Padding for start of month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: Date) => {
    const dayString = day.toISOString().split('T')[0];
    
    // Filtrar anuncios/eventos
    const filteredEvents = eventos.filter(e => {
      if (e.esPrivado && e.autor !== user?.email) return false;
      return e.fecha === dayString;
    }).map(e => ({ ...e, type: 'evento' }));

    // Filtrar proyectos que SOLO inician o terminan este día
    const filteredProjects = proyectos.filter(p => {
      return dayString === p.fecha_inicio || dayString === p.fecha_limite;
    }).map(p => ({ ...p, type: 'proyecto' }));

    setSelectedDay(day);
    setDayItems([...filteredEvents, ...filteredProjects]);
    setIsModalOpen(true);
  };

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddEvent = async () => {
    // VALIDACIÓN ESTRICTA
    if (!newEvent.titulo.trim()) { showToast("El TÍTULO es obligatorio."); return; }
    if (!newEvent.fecha) { showToast("La FECHA es obligatoria."); return; }
    if (!newEvent.hora) { showToast("La HORA es obligatoria."); return; }
    if (isAdmin && !newEvent.esPrivado && newEvent.audiencia.length === 0) { showToast("Debes seleccionar la AUDIENCIA."); return; }
    if (!newEvent.descripcion.trim()) { showToast("La DESCRIPCIÓN es obligatoria."); return; }

    // For clients, force private event
    const eventData = { ...newEvent, autor: user?.email };
    if (role === 'cliente') {
      eventData.esPrivado = true;
    }

    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: eventData })
      });
      setIsNewEventModalOpen(false);
      setNewEvent({ titulo: '', descripcion: '', hora: '12:00', fecha: '', prioridad: 'normal', audiencia: [], esPrivado: false, color: '#3b82f6' });
      await fetchData();
      showToast("¡Anuncio guardado con éxito!", "success");
      
      // Si estamos en el mismo día, refrescar los items del día
      if (selectedDay) {
        handleDayClick(selectedDay);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/calendar?id=${id}`, { method: 'DELETE' });
      fetchData();
      setDayItems(dayItems.filter(e => e.id !== id));
    } catch (e) { console.error(e); }
  };

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });
  const year = currentDate.getFullYear();
  const days = getDaysInMonth(currentDate);
  const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-4 rounded-2xl border shadow-2xl flex items-center space-x-3 backdrop-blur-xl ${toast.type === 'error' ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-green-500/20 border-green-500/30 text-green-400'}`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      <Header title="Calendario Maestro" />
      
      <main className="p-8 max-w-7xl mx-auto w-full flex-1 overflow-auto flex flex-col">
        <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold uppercase tracking-wide text-white mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>{isAdmin ? 'CALENDARIO MAESTRO' : 'MI CALENDARIO'}</h1>
            <p className="text-surface-600 uppercase tracking-widest text-xs">{isAdmin ? 'EVENTOS Y ACTIVIDADES CLAVE DEL EQUIPO' : 'EVENTOS PERSONALES Y AVISOS A CLIENTES'}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsNewEventModalOpen(true)}
              className="flex items-center text-sm font-bold text-white bg-primary hover:bg-red-600 transition-all px-6 py-2.5 rounded-xl uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(255,59,48,0.2)]"
            >
              <Plus className="w-4 h-4 mr-2" /> {isAdmin ? 'Crear Evento / Anuncio' : 'Agregar Evento Personal'}
            </button>
            <div className="flex items-center bg-surface-200 border border-surface-400 rounded-lg p-1">
              <button onClick={handlePrevMonth} className="p-2 text-surface-600 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <span className="px-4 py-1 text-sm font-bold text-white uppercase tracking-widest min-w-[140px] text-center">{monthName} {year}</span>
              <button onClick={handleNextMonth} className="p-2 text-surface-600 hover:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        <div className="bg-surface-200 border border-surface-400 rounded-2xl overflow-hidden shadow-2xl flex-1">
          <div className="grid grid-cols-7 border-b border-surface-400">
            {weekDays.map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-bold text-surface-600 tracking-[0.2em]">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 flex-1">
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="border-r border-b border-surface-400/50 bg-surface-100/30"></div>;
              
              const dayString = day.toISOString().split('T')[0];
              const dayEvents = eventos.filter(e => {
                if (e.esPrivado && e.autor !== user?.email) return false;
                return e.fecha === dayString;
              });
              const dayProjects = proyectos.filter(p => dayString === p.fecha_inicio || dayString === p.fecha_limite);
              
              const hasItems = dayEvents.length > 0 || dayProjects.length > 0;
              const isToday = new Date().toISOString().split('T')[0] === dayString;

              return (
                <div 
                  key={dayString} 
                  onClick={() => handleDayClick(day)}
                  className={`relative min-h-[180px] border-r border-b border-surface-400 p-4 cursor-pointer transition-all hover:bg-surface-300/30 group ${hasItems ? 'bg-primary/5' : ''}`}
                >
                  <span className={`text-lg font-black ${isToday ? 'text-primary' : 'text-surface-600 group-hover:text-white'}`}>
                    {day.getDate()}
                  </span>
                  
                  <div className="mt-2 space-y-1">
                    {/* Dibujar Proyectos (Solo Inicio o Fin) */}
                    {proyectos.filter(p => dayString === p.fecha_inicio || dayString === p.fecha_limite).slice(0, 2).map(p => {
                      const isStart = dayString === p.fecha_inicio;
                      return (
                        <div key={p.id} className={`border-l-2 px-2 py-1 rounded-sm mb-1 ${isStart ? 'bg-green-500/10 border-green-500' : 'bg-[#4da6ff]/10 border-[#4da6ff]'}`}>
                           <p className="text-[8px] font-bold text-white truncate uppercase">
                             {isStart ? '🚀 INICIO: ' : '🏁 FIN: '}{p.titulo}
                           </p>
                        </div>
                      );
                    })}
                    
                    {/* Dibujar Eventos/Anuncios */}
                    {dayEvents.slice(0, 3).map(e => (
                      <div 
                        key={e.id} 
                        style={{ backgroundColor: `${e.prioridad === 'alta' ? '#ff3b30' : (e.color || '#3b82f6')}33`, borderLeftColor: e.prioridad === 'alta' ? '#ff3b30' : (e.color || '#3b82f6') }}
                        className="border-l-4 px-2 py-1.5 rounded-md shadow-sm mb-1"
                      >
                         <p className="text-[10px] font-black text-white truncate uppercase tracking-wider">
                           {e.esPrivado ? '🔒 ' : '📢 '}{e.titulo}
                         </p>
                      </div>
                    ))}

                    {(dayEvents.length + dayProjects.length) > 3 && (
                      <p className="text-[8px] text-surface-600 font-black mt-2 text-center bg-surface-100/50 py-1 rounded uppercase tracking-tighter">Ver + Actividades</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* MODAL DETALLES DÍA */}
      {isModalOpen && selectedDay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
              {selectedDay.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <p className="text-surface-600 text-xs uppercase tracking-widest mb-6">Actividades Programadas</p>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {dayItems.length > 0 ? dayItems.map(item => (
                <div key={item.id} className={`bg-surface-100 border ${item.type === 'proyecto' ? 'border-[#4da6ff]/30' : 'border-surface-400'} rounded-xl p-5 group relative shadow-md`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mr-3 ${item.type === 'proyecto' ? 'bg-[#4da6ff]' : (item.prioridad === 'alta' ? 'bg-primary animate-pulse' : 'bg-surface-600')}`}></div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-surface-600">
                        {item.type === 'proyecto' ? '📂 Proyecto Activo' : (item.esPrivado ? '🔒 Nota Personal' : '📢 Anuncio')}
                      </span>
                    </div>
                    {item.type === 'proyecto' && (
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-surface-600 uppercase tracking-tighter">PERÍODO PROYECTO</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">INICIO: {item.fecha_inicio || '---'}</span>
                          <span className="text-[9px] font-bold text-[#4da6ff] bg-[#4da6ff]/10 px-2 py-0.5 rounded">FIN: {item.fecha_limite || '---'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-white text-lg mb-1 uppercase tracking-wide">{item.titulo}</h3>
                  {item.type === 'evento' && (
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-xs text-surface-600 font-bold bg-surface-300/50 w-fit px-3 py-1.5 rounded-lg border border-surface-400">
                        <Clock className="w-3.5 h-3.5 mr-2 text-primary" /> 
                        {item.hora} HS
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(item.audiencia) ? item.audiencia.map((aud: string, idx: number) => (
                          <div key={idx} className="flex items-center px-2 py-1 bg-surface-300 border border-surface-400 rounded-md text-[9px] font-black uppercase tracking-tighter text-white">
                            <Users className="w-3 h-3 mr-1.5 text-primary opacity-70" />
                            {aud}
                          </div>
                        )) : (
                          <div className="flex items-center px-2 py-1 bg-surface-300 border border-surface-400 rounded-md text-[9px] font-black uppercase tracking-tighter text-white">
                            <Users className="w-3 h-3 mr-1.5 text-primary opacity-70" />
                            {item.audiencia}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-surface-500 leading-relaxed italic">
                    {item.descripcion || "Sin descripción adicional..."}
                  </p>
                  
                  {item.type === 'proyecto' && item.empleados_asignados && (
                    <div className="mt-4 flex items-center">
                      <p className="text-[9px] font-bold text-surface-600 uppercase mr-3">EQUIPO:</p>
                      <div className="flex -space-x-2">
                        {item.empleados_asignados.map((emp: string, i: number) => (
                          <div key={i} className="w-6 h-6 rounded-full border border-surface-200 bg-surface-500 overflow-hidden shadow-sm" title={emp}>
                            <img src={`https://i.pravatar.cc/100?u=${emp}`} alt="avatar" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(isAdmin || item.autor === user?.email) && item.type === 'evento' && (
                    <button 
                      onClick={() => handleDeleteEvent(item.id)}
                      className="absolute top-5 right-5 text-surface-600 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-16 text-surface-600">
                  <CalendarIcon className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-sm font-bold uppercase tracking-widest italic">Sin compromisos registrados</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-end">
               <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-surface-100 hover:bg-surface-300 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO EVENTO (ADMIN) */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative">
            <button onClick={() => setIsNewEventModalOpen(false)} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>{isAdmin ? 'AGREGAR EVENTO' : 'AGREGAR EVENTO PERSONAL'}</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Título del Anuncio / Evento <span className="text-primary">*</span></label>
                <input type="text" value={newEvent.titulo} onChange={(e) => setNewEvent({...newEvent, titulo: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Ej: No se trabaja por feriado" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Fecha del Evento <span className="text-primary">*</span></label>
                  <input type="date" value={newEvent.fecha} onChange={(e) => setNewEvent({...newEvent, fecha: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Prioridad <span className="text-primary">*</span></label>
                  <select 
                    value={newEvent.prioridad} 
                    onChange={(e) => setNewEvent({...newEvent, prioridad: e.target.value})} 
                    className="w-full bg-surface-100 border border-surface-400 rounded-lg px-3 py-3 text-[11px] text-white focus:outline-none focus:border-primary transition-colors font-bold uppercase tracking-wider h-[46px]"
                  >
                    <option value="normal">INFORMATIVO / NORMAL</option>
                    <option value="alta">🔥 ALTA PRIORIDAD (ROJO)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Personalizar Color <span className="text-primary">*</span></label>
                  <div className="flex items-center space-x-2 h-[46px]">
                    {newEvent.prioridad === 'alta' ? (
                      <div className="flex items-center space-x-2 bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 w-full">
                        <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_rgba(255,59,48,0.5)]"></div>
                        <span className="text-[10px] font-bold text-primary uppercase">Urgente (Bloqueado)</span>
                      </div>
                    ) : (
                      ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'].map(color => (
                        <button
                          key={color}
                          onClick={() => setNewEvent({ ...newEvent, color })}
                          className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${newEvent.color === color ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-50'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Hora del Evento <span className="text-primary">*</span></label>
                  <input type="time" value={newEvent.hora} onChange={(e) => setNewEvent({...newEvent, hora: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
                </div>
              </div>

              {/* Audiencia: Admin elige entre grupos, Empleado/Cliente tienen opciones limitadas o ninguna */}
              <div className={newEvent.esPrivado || role === 'cliente' ? 'opacity-30 pointer-events-none transition-opacity hidden' : 'transition-opacity'}>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">
                  {isAdmin ? '¿Quién puede ver este anuncio? (Audiencia)' : '¿A quién va dirigido?'} {isAdmin && !newEvent.esPrivado && <span className="text-primary">*</span>}
                </label>
                {isAdmin ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'empleados', label: '💼 EMPLEADOS' },
                      { id: 'vip', label: '👑 CLIENTES VIP' },
                      { id: 'normal', label: '👤 CLIENTES' }
                    ].map(cat => {
                      const isSelected = newEvent.audiencia.includes(cat.label);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            const next = isSelected 
                              ? newEvent.audiencia.filter(a => a !== cat.label) 
                              : [...newEvent.audiencia, cat.label];
                            setNewEvent({ ...newEvent, audiencia: next });
                          }}
                          className={`py-3 px-2 rounded-xl text-[9px] font-black tracking-widest transition-all border ${isSelected ? 'bg-primary border-primary text-white shadow-[0_5px_15px_rgba(255,59,48,0.3)]' : 'bg-surface-100 border-surface-400 text-surface-600 hover:border-surface-600'}`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'clientes_proyecto', label: '📢 AVISO A CLIENTES DE MIS PROYECTOS' }
                    ].map(cat => {
                      const isSelected = newEvent.audiencia.includes(cat.label);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            const next = isSelected 
                              ? newEvent.audiencia.filter(a => a !== cat.label) 
                              : [...newEvent.audiencia, cat.label];
                            setNewEvent({ ...newEvent, audiencia: next });
                          }}
                          className={`py-3 px-4 rounded-xl text-[9px] font-black tracking-widest transition-all border ${isSelected ? 'bg-[#4da6ff] border-[#4da6ff] text-white shadow-[0_5px_15px_rgba(77,166,255,0.3)]' : 'bg-surface-100 border-surface-400 text-surface-600 hover:border-surface-600'}`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Descripción / Detalles <span className="text-primary">*</span></label>
                <textarea value={newEvent.descripcion} onChange={(e) => setNewEvent({...newEvent, descripcion: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[60px]" placeholder="Escribe aquí los detalles del anuncio..." />
              </div>

              {/* Modo Privado: funciona diferente para cada rol */}
              <div className={`flex items-center justify-between p-4 bg-surface-100 border border-surface-400 rounded-xl ${role === 'cliente' ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center">
                  <EyeOff className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">{isAdmin ? 'Modo Privado (Solo Admin)' : 'Evento Privado (Solo Yo)'}</p>
                    <p className="text-[9px] text-surface-600">{role === 'cliente' ? 'Tus eventos son siempre privados.' : isAdmin ? 'Este evento no será visible para los empleados.' : 'Solo tú podrás ver este evento en el calendario.'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNewEvent({...newEvent, esPrivado: !newEvent.esPrivado})}
                  className={`w-12 h-6 rounded-full transition-all relative ${newEvent.esPrivado || role === 'cliente' ? 'bg-primary' : 'bg-surface-400'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newEvent.esPrivado || role === 'cliente' ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              
              <div className="flex justify-end pt-4">
                <button onClick={handleAddEvent} className="bg-primary hover:bg-red-600 text-white font-bold py-3.5 px-10 rounded-xl uppercase tracking-widest text-[10px] transition-all flex items-center shadow-[0_10px_20px_rgba(255,59,48,0.2)]">
                  <Save className="w-4 h-4 mr-2" /> GUARDAR ANUNCIO / EVENTO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
