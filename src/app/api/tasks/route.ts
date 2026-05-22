import { NextResponse } from 'next/server';
import { mockData } from '@/lib/data';

export async function GET() {
  return NextResponse.json({ tareas: mockData.tareas, empleados: mockData.empleados, campanas: mockData.campanas, clientes: mockData.clientes });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, estado, titulo, descripcion, prioridad, empleados_asignados, clientes_asignados, empleados_peticion, comentarios, categoria, ias_usadas, detalles_proyecto, progreso, presupuesto_total, presupuesto_utilizado } = body;

  const taskIndex = mockData.tareas.findIndex(t => t.id === id);
  if (taskIndex > -1) {
    const task = mockData.tareas[taskIndex] as any;
    if (estado) task.estado = estado;
    if (titulo) task.titulo = titulo;
    if (descripcion) task.descripcion = descripcion;
    if (prioridad) task.prioridad = prioridad;
    if (empleados_asignados) task.empleados_asignados = empleados_asignados;
    if (clientes_asignados) task.clientes_asignados = clientes_asignados;
    if (empleados_peticion) task.empleados_peticion = empleados_peticion;
    if (comentarios) task.comentarios = comentarios;
    if (categoria !== undefined) task.categoria = categoria;
    if (ias_usadas !== undefined) task.ias_usadas = ias_usadas;
    if (detalles_proyecto !== undefined) task.detalles_proyecto = detalles_proyecto;
    if (progreso !== undefined) task.progreso = progreso;
    if (presupuesto_total !== undefined) task.presupuesto_total = presupuesto_total;
    if (presupuesto_utilizado !== undefined) task.presupuesto_utilizado = presupuesto_utilizado;
    
    return NextResponse.json({ success: true, tarea: mockData.tareas[taskIndex] });
  }

  return NextResponse.json({ success: false, message: "Tarea no encontrada" }, { status: 404 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { titulo, descripcion, prioridad, empleados_asignados, clientes_asignados, fecha_inicio, fecha_limite, campana, adjuntos, progreso, presupuesto_total, presupuesto_utilizado } = body;

  const newTask = {
    id: `t_${Date.now()}`,
    titulo: titulo || "Nueva Tarea",
    descripcion: descripcion || "",
    estado: "todo",
    prioridad: prioridad || "low",
    campana: campana || "",
    adjuntos: adjuntos || [],
    asignado_a: empleados_asignados?.[0] || "unassigned",
    fecha_inicio: fecha_inicio || new Date().toISOString().split('T')[0],
    fecha_limite: fecha_limite || new Date().toISOString().split('T')[0],
    progreso: progreso || 0,
    presupuesto_total: presupuesto_total || 0,
    presupuesto_utilizado: presupuesto_utilizado || 0,
    empleados_asignados: empleados_asignados || [],
    clientes_asignados: clientes_asignados || [],
    empleados_peticion: [],
    comentarios: [],
    categoria: "",
    ias_usadas: "",
    detalles_proyecto: ""
  };

  mockData.tareas.push(newTask);
  return NextResponse.json({ success: true, tarea: newTask });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

  const taskIndex = mockData.tareas.findIndex(t => t.id === id);
  if (taskIndex > -1) {
    mockData.tareas.splice(taskIndex, 1);
    return NextResponse.json({ success: true, message: "Task deleted" });
  }

  return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
}

