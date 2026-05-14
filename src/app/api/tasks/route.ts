import { NextResponse } from 'next/server';
import { mockData } from '@/lib/data';

export async function GET() {
  return NextResponse.json({ tareas: mockData.tareas, empleados: mockData.empleados, campanas: mockData.campanas });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, estado, titulo, descripcion, prioridad, empleados_asignados, empleados_peticion, comentarios } = body;

  const taskIndex = mockData.tareas.findIndex(t => t.id === id);
  if (taskIndex > -1) {
    if (estado) mockData.tareas[taskIndex].estado = estado;
    if (titulo) mockData.tareas[taskIndex].titulo = titulo;
    if (descripcion) mockData.tareas[taskIndex].descripcion = descripcion;
    if (prioridad) mockData.tareas[taskIndex].prioridad = prioridad;
    if (empleados_asignados) mockData.tareas[taskIndex].empleados_asignados = empleados_asignados;
    if (empleados_peticion) mockData.tareas[taskIndex].empleados_peticion = empleados_peticion;
    if (comentarios) mockData.tareas[taskIndex].comentarios = comentarios;
    
    return NextResponse.json({ success: true, tarea: mockData.tareas[taskIndex] });
  }

  return NextResponse.json({ success: false, message: "Tarea no encontrada" }, { status: 404 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { titulo, descripcion, prioridad, empleados_asignados, fecha_inicio, fecha_limite, campana, adjuntos } = body;

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
    empleados_asignados: empleados_asignados || [],
    empleados_peticion: [],
    comentarios: []
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

