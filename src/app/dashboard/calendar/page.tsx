"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Clock, Trash2, Save, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CalendarPage() {
  const { user } = useAuth();
  const isAdmin = true; // Forcing for demo, but normally check user.role

  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventos, setEventos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayEvents, setDayEvents] = useState<any[]>([]);
  
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    titulo: '',
    descripcion: '',
    hora: '12:00',
    fecha: ''
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      setEventos(data.eventos || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    const filtered = eventos.filter(e => e.fecha === dayString);
    setSelectedDay(day);
    setDayEvents(filtered);
    setIsModalOpen(true);
  };

  const handleAddEvent = async () => {
    if (!newEvent.titulo || !newEvent.fecha) return;
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newEvent })
      });
      setIsNewEventModalOpen(false);
      setNewEvent({ titulo: '', descripcion: '', hora: '12:00', fecha: '' });
      fetchData();
      // If we are looking at the modal for the same day, update it
      if (selectedDay && selectedDay.toISOString().split('T')[0] === newEvent.fecha) {
         // Refresh local state or just close
         setIsModalOpen(false);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/calendar?id=${id}`, { method: 'DELETE' });
      fetchData();
      setDayEvents(dayEvents.filter(e => e.id !== id));
    } catch (e) { console.error(e); }
  };

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });
  const year = currentDate.getFullYear();
  const days = getDaysInMonth(currentDate);
  const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <Header title="Calendario Maestro" />
      
      <main className="p-8 max-w-5xl mx-auto w-full flex-1 overflow-auto flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wide text-white mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>CALENDARIO MAESTRO</h1>
            <p className="text-surface-600 uppercase tracking-widest text-xs">EVENTOS Y ACTIVIDADES CLAVE DEL EQUIPO</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <button 
                onClick={() => setIsNewEventModalOpen(true)}
                className="flex items-center text-sm font-bold text-white bg-primary hover:bg-red-600 transition-colors px-4 py-2 rounded-lg uppercase tracking-wider shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" /> AGREGAR DÍA
              </button>
            )}
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
              const hasEvents = eventos.some(e => e.fecha === dayString);
              const isToday = new Date().toISOString().split('T')[0] === dayString;

              return (
                <div 
                  key={dayString} 
                  onClick={() => handleDayClick(day)}
                  className={`relative min-h-[120px] border-r border-b border-surface-400 p-4 cursor-pointer transition-all hover:bg-surface-300/50 group ${hasEvents ? 'bg-red-500/5' : ''}`}
                >
                  <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-surface-600 group-hover:text-white'}`}>
                    {day.getDate()}
                  </span>
                  
                  {hasEvents && (
                    <div className="mt-2 space-y-1">
                      {eventos.filter(e => e.fecha === dayString).slice(0, 2).map(e => (
                        <div key={e.id} className="bg-primary/20 border-l-2 border-primary px-2 py-1 rounded-sm overflow-hidden">
                           <p className="text-[9px] font-bold text-white truncate uppercase">{e.titulo}</p>
                        </div>
                      ))}
                      {eventos.filter(e => e.fecha === dayString).length > 2 && (
                        <p className="text-[8px] text-surface-600 font-bold ml-1">+ VER MÁS</p>
                      )}
                    </div>
                  )}
                  
                  {hasEvents && (
                    <div className="absolute inset-0 border-2 border-primary/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
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
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {dayEvents.length > 0 ? dayEvents.map(e => (
                <div key={e.id} className="bg-surface-100 border border-surface-400 rounded-xl p-4 group relative">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                    <h3 className="font-bold text-white uppercase tracking-wide">{e.titulo}</h3>
                  </div>
                  <div className="flex items-center text-xs text-surface-600 mb-3 ml-5">
                    <Clock className="w-3 h-3 mr-1" /> {e.hora} HS
                  </div>
                  <p className="text-sm text-surface-500 ml-5 leading-relaxed">{e.descripcion}</p>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeleteEvent(e.id)}
                      className="absolute top-4 right-4 text-surface-500 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-surface-600">
                  <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium uppercase tracking-widest">Sin actividades hoy</p>
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
          <div className="bg-surface-200 border border-surface-400 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setIsNewEventModalOpen(false)} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>AGREGAR EVENTO</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Título del Evento</label>
                <input type="text" value={newEvent.titulo} onChange={(e) => setNewEvent({...newEvent, titulo: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Ej: Lanzamiento Campaña X" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Fecha</label>
                  <input type="date" value={newEvent.fecha} onChange={(e) => setNewEvent({...newEvent, fecha: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Hora</label>
                  <input type="time" value={newEvent.hora} onChange={(e) => setNewEvent({...newEvent, hora: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Descripción</label>
                <textarea value={newEvent.descripcion} onChange={(e) => setNewEvent({...newEvent, descripcion: e.target.value})} className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[100px]" placeholder="Detalles de la actividad..." />
              </div>
              
              <div className="flex justify-end pt-4">
                <button onClick={handleAddEvent} className="bg-primary hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider text-sm transition-colors flex items-center shadow-lg">
                  <Save className="w-4 h-4 mr-2" /> GUARDAR EVENTO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
