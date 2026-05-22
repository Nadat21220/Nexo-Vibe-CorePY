/**
 * empleadoStore.ts
 * ─────────────────────────────────────────────────────────
 * Module-level (singleton) store for employee-exclusive tasks.
 *
 * WHY THIS EXISTS:
 *   - Next.js pages are separate React trees. The Kanban page and the
 *     Dashboard page cannot share React state directly.
 *   - We use a module-level variable (outside any component) so the same
 *     reference is used every time any page imports this module during
 *     the current browser session.
 *   - ADMIN NEVER TOUCHES THIS. Admin reads directly from the API (/api/tasks).
 *     This store is 100% invisible to admin views.
 *
 * USAGE:
 *   import { getEmpTasks, addEmpTask, updateEmpTask, deleteEmpTask } from '@/lib/empleadoStore';
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _tasks: any[] = [];
let _initialized = false;

/**
 * Returns the full list of employee-local tasks.
 * On first call, seeds the store with the 2 default simulated projects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEmpTasks(userEmail: string): any[] {
  if (!_initialized) {
    _initialized = true;
    _tasks = [
      {
        id: 'e_mock_1',
        titulo: 'Proyecto Exclusivo Empleado A',
        descripcion: 'Rediseño de componentes UI para el panel interno de NexoVibe.',
        estado: 'todo',
        prioridad: 'high',
        empleados_asignados: [userEmail],
        asignado_a: userEmail,
        progreso: 30,
        presupuesto_total: 1000,
        presupuesto_utilizado: 300,
        campana: 'c1',
        adjuntos: [],
        comentarios: [],
        categoria: 'diseno_web',
        ias_usadas: 'ChatGPT',
        detalles_proyecto: 'Proyecto de prueba simulado para empleado.',
        fecha_inicio: '2026-05-01',
        fecha_limite: '2026-05-31',
      },
      {
        id: 'e_mock_2',
        titulo: 'Proyecto Exclusivo Empleado B',
        descripcion: 'Campaña de marketing digital en redes sociales Q2.',
        estado: 'in_progress',
        prioridad: 'medium',
        empleados_asignados: [userEmail],
        asignado_a: userEmail,
        progreso: 70,
        presupuesto_total: 3000,
        presupuesto_utilizado: 1500,
        campana: 'c2',
        adjuntos: [],
        comentarios: [],
        categoria: 'marketing',
        ias_usadas: 'Midjourney',
        detalles_proyecto: 'Proyecto de prueba simulado para empleado.',
        fecha_inicio: '2026-05-05',
        fecha_limite: '2026-06-15',
      },
    ];
  }
  return _tasks;
}

/** Adds a new task to the employee store */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addEmpTask(task: any): void {
  _tasks = [..._tasks, task];
}

/** Updates fields of an existing task in the employee store */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateEmpTask(id: string, updates: any): void {
  _tasks = _tasks.map(t => (t.id === id ? { ...t, ...updates } : t));
}

/** Deletes a task from the employee store */
export function deleteEmpTask(id: string): void {
  _tasks = _tasks.filter(t => t.id !== id);
}

/**
 * Merges API tasks (assigned to the employee) with the local store.
 * Deduplicates by id so the 2 mocks don't appear twice if the API
 * somehow returns them.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeWithApi(apiTasks: any[], userEmail: string): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = apiTasks.filter((t: any) =>
    t.empleados_asignados?.includes(userEmail)
  );
  const localTasks = getEmpTasks(userEmail);
  const localIds = new Set(localTasks.map(t => t.id));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniqueApi = filtered.filter((t: any) => !localIds.has(t.id));
  return [...uniqueApi, ...localTasks];
}
