import { NextResponse } from 'next/server';
import { mockData } from '@/lib/data';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

type ProyectoRow = {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  progreso: number | null;
  presupuesto_total: string | number | null;
  presupuesto_utilizado: string | number | null;
  prioridad: string | null;
  ias_usadas: string | null;
  detalles_proyecto: string | null;
};

type PersonaClienteRow = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rango: string | null;
  suscripcion: string | null;
};

type PersonaEmpleadoRow = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string | null;
  salario: number | null;
};

type AsignacionRow = {
  id_proyecto: number;
  email: string;
};

type TaskResponse = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  fecha_inicio: string;
  fecha_limite: string;
  estado: string;
  progreso: number;
  presupuesto_total: number;
  presupuesto_utilizado: number;
  prioridad: string;
  campana: string;
  ias_usadas: string;
  detalles_proyecto: string;
  adjuntos: unknown[];
  comentarios: unknown[];
  empleados_asignados: string[];
  clientes_asignados: string[];
  asignado_a?: string;
};

export async function GET() {
  try {
    const proyectosResult = await query<ProyectoRow>(
      `SELECT id, nombre, descripcion, categoria, fecha_inicio, fecha_fin, estado, progreso, presupuesto_total, presupuesto_utilizado, prioridad, ias_usadas, detalles_proyecto
       FROM proyecto`
    );

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

    const empleadosResult = await query<PersonaEmpleadoRow>(
      `SELECT e.id as id, p.nombre, p.apellido, p.email, e.rol, e.salario
       FROM persona p
       JOIN empleado e ON e.id_persona = p.id
       ORDER BY p.nombre, p.apellido`
    );

    const clientesResult = await query<PersonaClienteRow>(
      `SELECT c.id as id, p.nombre, p.apellido, p.email, c.rango, c.suscripcion
       FROM persona p
       JOIN cliente c ON c.id_persona = p.id
       ORDER BY p.nombre, p.apellido`
    );

    const tasks = proyectosResult.rows.map((project) => ({
      id: `p_${project.id}`,
      titulo: project.nombre,
      descripcion: project.descripcion,
      categoria: project.categoria,
      fecha_inicio: project.fecha_inicio,
      fecha_limite: project.fecha_fin,
      estado: project.estado,
      progreso: Number(project.progreso) || 0,
      presupuesto_total: Number(project.presupuesto_total) || 0,
      presupuesto_utilizado: Number(project.presupuesto_utilizado) || 0,
      prioridad: project.prioridad || 'low',
      campana: '',
      ias_usadas: project.ias_usadas || '',
      detalles_proyecto: project.detalles_proyecto || '',
      adjuntos: [],
      comentarios: [],
      empleados_asignados: [] as string[],
      clientes_asignados: [] as string[],
    })) as TaskResponse[];

    const tasksById = new Map<number, TaskResponse>();
    tasks.forEach((task) => {
      const projectId = Number(task.id.replace(/^p_/, ''));
      tasksById.set(projectId, task);
    });

    empleadoAsignaciones.rows.forEach((row) => {
      const task = tasksById.get(row.id_proyecto);
      if (task) {
        task.empleados_asignados.push(row.email);
      }
    });

    clienteAsignaciones.rows.forEach((row) => {
      const task = tasksById.get(row.id_proyecto);
      if (task) {
        task.clientes_asignados.push(row.email);
      }
    });

    tasks.forEach((task) => {
      if (!task.asignado_a && task.empleados_asignados?.length > 0) {
        task.asignado_a = task.empleados_asignados[0];
      }
      if (!task.asignado_a && task.clientes_asignados?.length > 0) {
        task.asignado_a = task.clientes_asignados[0];
      }
    });

    return NextResponse.json({
      tareas: tasks,
      empleados: empleadosResult.rows,
      clientes: clientesResult.rows,
      campanas: mockData.campanas || []
    });
  } catch (err) {
    console.error('Error fetching tasks from DB:', err);
    return NextResponse.json({
      tareas: mockData.tareas || [],
      empleados: mockData.empleados || [],
      clientes: mockData.clientes || [],
      campanas: mockData.campanas || []
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const projectId = Number(String(id).replace(/^p_/, ''));
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ success: false, message: 'Invalid project ID' }, { status: 400 });
    }

    const allowedFields = ['estado', 'progreso', 'presupuesto_utilizado', 'categoria', 'ias_usadas', 'detalles_proyecto', 'fecha_inicio', 'fecha_limite'];
    const fields = Object.keys(updates).filter((key) => allowedFields.includes(key));

    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid fields provided' }, { status: 400 });
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];
    fields.forEach((field, index) => {
      const column = field === 'fecha_limite' ? 'fecha_fin' : field;
      setClauses.push(`${column} = $${index + 1}`);
      values.push(updates[field]);
    });
    values.push(projectId);

    await query(
      `UPDATE proyecto SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating project:', err);
    return NextResponse.json({ success: false, message: 'Error updating project' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      titulo,
      descripcion,
      prioridad,
      fecha_inicio,
      fecha_limite,
      progreso,
      presupuesto_total,
      presupuesto_utilizado,
      estado,
      categoria,
      ias_usadas,
      detalles_proyecto,
      empleados_asignados = [],
      clientes_asignados = []
    } = body;

    const projectResult = await query(
      `INSERT INTO proyecto (nombre, descripcion, categoria, fecha_inicio, fecha_fin, estado, progreso, presupuesto_total, presupuesto_utilizado, prioridad, ias_usadas, detalles_proyecto)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        titulo,
        descripcion,
        categoria || 'Desarrollo Web',
        fecha_inicio,
        fecha_limite,
        estado || 'En desarrollo',
        progreso || 0,
        presupuesto_total || 0,
        presupuesto_utilizado || 0,
        prioridad || 'low',
        ias_usadas || '',
        detalles_proyecto || ''
      ]
    );

    const newProjectId = projectResult.rows[0].id;

    if (empleados_asignados.length > 0) {
      const empleadosIds = await query(
        `SELECT e.id FROM empleado e JOIN persona p ON p.id = e.id_persona WHERE p.email = ANY($1::text[])`,
        [empleados_asignados]
      );
      await Promise.all(empleadosIds.rows.map((row) => query(
        `INSERT INTO empleado_proyecto (id_empleado, id_proyecto) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [row.id, newProjectId]
      )));
    }

    if (clientes_asignados.length > 0) {
      const shouldUseIds = clientes_asignados.every((item: unknown) => typeof item === 'number' || (typeof item === 'string' && /^\d+$/.test(item)));
      const clientesIds = shouldUseIds
        ? await query(
            `SELECT c.id FROM cliente c WHERE c.id = ANY($1::int[])`,
            [clientes_asignados.map((id: string | number) => Number(id))]
          )
        : await query(
            `SELECT c.id FROM cliente c JOIN persona p ON p.id = c.id_persona WHERE p.email = ANY($1::text[])`,
            [clientes_asignados]
          );

      await Promise.all(clientesIds.rows.map((row) => query(
        `INSERT INTO cliente_proyecto (id_cliente, id_proyecto) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [row.id, newProjectId]
      )));
    }

    return NextResponse.json({ success: true, tarea: { id: `p_${newProjectId}` } });
  } catch (err) {
    console.error('Error creating project:', err);
    return NextResponse.json({ success: false, message: 'Error creating project' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const projectId = Number(String(id).replace(/^p_/, ''));
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ success: false, message: 'Invalid project ID' }, { status: 400 });
    }

    await query(`DELETE FROM proyecto WHERE id = $1`, [projectId]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting project:', err);
    return NextResponse.json({ success: false, message: 'Error deleting project' }, { status: 500 });
  }
}
