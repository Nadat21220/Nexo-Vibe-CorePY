import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { mockData } from '@/lib/data';

export async function GET() {
  let tareas = [];
  let clientes = [];
  
  try {
    const [resProyectos, resClientes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/proyectos`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/clientes`, { cache: 'no-store' })
    ]);
    const dataProyectos = await resProyectos.json();
    const dataClientes = await resClientes.json();
    
    tareas = dataProyectos.success ? dataProyectos.tareas : [];
    clientes = dataClientes.success ? dataClientes.clientes : [];
  } catch (err) {
    console.error("Error fetching data for dashboard:", err);
  }

  let completadas = 0, enProceso = 0, revision = 0, pendientes = 0;
  let presupuesto_total_asignado = 0;
  let presupuesto_total_usado = 0;
  let suma_progreso = 0;
  
  tareas.forEach((t: any) => {
    if (t.estado === 'Finalizado') completadas++;
    else if (t.estado === 'En desarrollo') enProceso++;
    else if (t.estado === 'Suspendido') revision++;
    else pendientes++;

    presupuesto_total_asignado += t.presupuesto_total || 0;
    presupuesto_total_usado += t.presupuesto_utilizado || 0;
    suma_progreso += t.progreso || 0;
  });

  const progreso_promedio = tareas.length > 0 ? Math.round(suma_progreso / tareas.length) : 0;

  const urgentTasks = tareas.filter((t: any) => t.prioridad === 'inmediata' && t.estado !== 'Finalizado');
  
  const totalClientes = clientes.length;
  
  let starterCount = 0;
  let proCount = 0;
  let enterpriseCount = 0;

  if (clientes) {
    clientes.forEach((c: any) => {
      if (c.rango === 'vip' || c.suscripcion === 'enterprise') {
        enterpriseCount++;
      } else if (c.suscripcion === 'pro') {
        proCount++;
      } else {
        starterCount++; 
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
    total: tareas.length,
    activeCampaigns: mockData.campanas.length,
    urgentTasks,
    allTasks: tareas,
    objetivos: mockData.objetivos,
    presupuesto_total_asignado,
    presupuesto_total_usado,
    progreso_promedio,
    clientes_activos: totalClientes,
    suscripciones
  });
}
