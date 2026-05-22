import { NextResponse } from 'next/server';
import { mockData } from '@/lib/data';

export async function GET() {
  let completadas = 0, enProceso = 0, revision = 0, pendientes = 0;
  let presupuesto_total_asignado = 0;
  let presupuesto_total_usado = 0;
  let suma_progreso = 0;
  
  mockData.tareas.forEach((t) => {
    if (t.estado === 'done') completadas++;
    else if (t.estado === 'in_progress') enProceso++;
    else if (t.estado === 'review') revision++;
    else pendientes++;

    presupuesto_total_asignado += t.presupuesto_total || 0;
    presupuesto_total_usado += t.presupuesto_utilizado || 0;
    suma_progreso += t.progreso || 0;
  });

  const progreso_promedio = mockData.tareas.length > 0 ? Math.round(suma_progreso / mockData.tareas.length) : 0;

  const urgentTasks = mockData.tareas.filter(t => t.prioridad === 'inmediata' && t.estado !== 'done');
  
  const totalClientes = mockData.clientes ? mockData.clientes.length : 0;
  
  let starterCount = 0;
  let proCount = 0;
  let enterpriseCount = 0;

  if (mockData.clientes) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockData.clientes.forEach((c: any) => {
      if (c.rango === 'vip' || c.suscripcion === 'enterprise') {
        enterpriseCount++;
      } else if (c.suscripcion === 'pro') {
        proCount++;
      } else {
        starterCount++; // Default for normal clients without a specified subscription
      }
    });
  }

  const suscripciones = {
    starter: { count: starterCount, name: "Starter", desc: "Max 2 proyectos" },
    pro: { count: proCount, name: "Pro", desc: "Proyectos ilimitados" },
    enterprise: { count: enterpriseCount, name: "Enterprise", desc: "Soporte VIP" }
  };

  return NextResponse.json({
    completadas,
    enProceso,
    revision,
    pendientes,
    total: mockData.tareas.length,
    activeCampaigns: mockData.campanas.length,
    urgentTasks,
    allTasks: mockData.tareas,
    objetivos: mockData.objetivos,
    presupuesto_total_asignado,
    presupuesto_total_usado,
    progreso_promedio,
    clientes_activos: totalClientes,
    suscripciones
  });
}
