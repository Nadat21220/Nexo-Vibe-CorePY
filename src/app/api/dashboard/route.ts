import { NextResponse } from 'next/server';
import { mockData } from '@/lib/data';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

type ProyectoRow = {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  progreso: number | null;
  presupuesto_total: string | number | null;
  presupuesto_utilizado: string | number | null;
  prioridad: string | null;
};

type AsignacionRow = {
  id_proyecto: number;
  email: string;
};

type ProyectoResponse = {
  id: string;
  proyectoId: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  progreso: number;
  presupuesto_total: number;
  presupuesto_utilizado: number;
  campana: string;
  empleados_asignados: string[];
  clientes_asignados: string[];
};

export async function GET() {
  try {
    const proyectosResult = await query<ProyectoRow>(
      `SELECT id, nombre, descripcion, estado, progreso, presupuesto_total, presupuesto_utilizado, prioridad
       FROM proyecto`
    );

    const proyectos: ProyectoResponse[] = proyectosResult.rows.map((project) => ({
      id: `p_${project.id}`,
      proyectoId: project.id,
      titulo: project.nombre,
      descripcion: project.descripcion,
      estado: project.estado,
      prioridad: project.prioridad || 'low',
      progreso: Number(project.progreso) || 0,
      presupuesto_total: Number(project.presupuesto_total) || 0,
      presupuesto_utilizado: Number(project.presupuesto_utilizado) || 0,
      campana: '',
      empleados_asignados: [],
      clientes_asignados: []
    }));

    const empleadoAsignaciones = await query<AsignacionRow>(
      `SELECT ep.id_proyecto, p.email
       FROM empleado_proyecto ep
       JOIN empleado e ON e.id = ep.id_empleado
       JOIN persona p ON p.id = e.id_persona`
    );

    const clienteAsignaciones = await query<AsignacionRow>(
      `SELECT cp.id_proyecto, p.email
       FROM cliente_proyecto cp
       JOIN cliente c ON c.id = cp.id_cliente
       JOIN persona p ON p.id = c.id_persona`
    );

    const projectById = new Map<number, ProyectoResponse>();
    proyectos.forEach((project) => projectById.set(project.proyectoId, project));

    empleadoAsignaciones.rows.forEach((row) => {
      const project = projectById.get(row.id_proyecto);
      if (project) {
        project.empleados_asignados.push(row.email);
      }
    });

    clienteAsignaciones.rows.forEach((row) => {
      const project = projectById.get(row.id_proyecto);
      if (project) {
        project.clientes_asignados.push(row.email);
      }
    });

    let completadas = 0;
    let enProceso = 0;
    let revision = 0;
    let pendientes = 0;
    let presupuesto_total_asignado = 0;
    let presupuesto_total_usado = 0;
    let suma_progreso = 0;

    proyectos.forEach((t) => {
      if (t.estado === 'Finalizado') completadas++;
      else if (t.estado === 'En desarrollo') enProceso++;
      else if (t.estado === 'Suspendido') revision++;
      else pendientes++;

      presupuesto_total_asignado += t.presupuesto_total || 0;
      presupuesto_total_usado += t.presupuesto_utilizado || 0;
      suma_progreso += t.progreso || 0;
    });

    const progreso_promedio = proyectos.length > 0 ? Math.round(suma_progreso / proyectos.length) : 0;
    const urgentTasks = proyectos.filter((t) => t.prioridad === 'inmediata' && t.estado !== 'Finalizado');

    type ClienteRow = {
      cliente_id: number;
      nombre: string;
      apellido: string;
      email: string;
      rango: string | null;
      suscripcion: string | null;
    };

    const clientesResult = await query<ClienteRow>(
      `SELECT c.id as cliente_id, p.nombre, p.apellido, p.email, c.rango, c.suscripcion
       FROM cliente c
       JOIN persona p ON p.id = c.id_persona`
    );

    const clientesActivos = clientesResult.rowCount || 0;
    const starterCount = clientesResult.rows.filter((c) => c.suscripcion === 'starter' && c.rango !== 'vip').length;
    const proCount = clientesResult.rows.filter((c) => c.suscripcion === 'pro').length;
    const enterpriseCount = clientesResult.rows.filter((c) => c.suscripcion === 'enterprise' || c.rango === 'vip').length;

    const suscripciones = {
      starter: { count: starterCount, name: 'Starter', desc: 'Max 2 proyectos' },
      pro: { count: proCount, name: 'Pro', desc: 'Proyectos ilimitados' },
      enterprise: { count: enterpriseCount, name: 'Enterprise', desc: 'Soporte VIP' }
    };

    return NextResponse.json({
      completadas,
      enProceso,
      revision,
      pendientes,
      total: proyectos.length,
      activeCampaigns: mockData.campanas.length,
      urgentTasks,
      allTasks: proyectos,
      objetivos: mockData.objetivos || [],
      presupuesto_total_asignado,
      presupuesto_total_usado,
      progreso_promedio,
      clientes_activos: clientesActivos,
      suscripciones,
      dbName: process.env.DB_NAME || 'nexovibe_bd'
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    const clientes = mockData.clientes || [];
    return NextResponse.json({
      completadas: 0,
      enProceso: 0,
      revision: 0,
      pendientes: 0,
      total: 0,
      activeCampaigns: mockData.campanas.length,
      urgentTasks: [],
      allTasks: [],
      objetivos: mockData.objetivos || [],
      presupuesto_total_asignado: 0,
      presupuesto_total_usado: 0,
      progreso_promedio: 0,
      clientes_activos: clientes.length,
      suscripciones: {
        starter: { count: 0, name: 'Starter', desc: 'Max 2 proyectos' },
        pro: { count: 0, name: 'Pro', desc: 'Proyectos ilimitados' },
        enterprise: { count: 0, name: 'Enterprise', desc: 'Soporte VIP' }
      },
      dbName: process.env.DB_NAME || 'nexovibe_bd'
    });
  }
}
