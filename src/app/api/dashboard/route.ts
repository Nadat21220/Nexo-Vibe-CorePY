import { NextResponse } from 'next/server';
import { mockData } from '@/lib/data';

export async function GET() {
  let completadas = 0, enProceso = 0, revision = 0, pendientes = 0;
  
  mockData.tareas.forEach((t) => {
    if (t.estado === 'done') completadas++;
    else if (t.estado === 'in_progress') enProceso++;
    else if (t.estado === 'review') revision++;
    else pendientes++;
  });

  const urgentTasks = mockData.tareas.filter(t => t.prioridad === 'inmediata' && t.estado !== 'done');
  return NextResponse.json({
    completadas,
    enProceso,
    revision,
    pendientes,
    total: mockData.tareas.length,
    activeCampaigns: mockData.campanas.length,
    urgentTasks,
    allTasks: mockData.tareas,
    objetivos: mockData.objetivos
  });
}
