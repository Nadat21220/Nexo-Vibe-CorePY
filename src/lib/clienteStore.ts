// src/lib/clienteStore.ts

type ClienteSubscription = {
  tier: string;
  maxProjects: string;
  startDate: string;
  status: string;
};

type MockTask = {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  asignado_a: string;
  fecha_inicio: string;
  fecha_limite: string;
  progreso: number;
  presupuesto_total: number;
  presupuesto_utilizado: number;
  empleados_asignados: string[];
  cliente_email: string;
  comentarios: unknown[];
  [key: string]: unknown;
};

let _tasks: MockTask[] = [];
let _initialized = false;

let _clientSubscription: ClienteSubscription = {
  tier: 'estandar',
  maxProjects: '1 Proyecto',
  startDate: '2026-01-15',
  status: 'Activa'
};

export function getClientSubscription() {
  return _clientSubscription;
}

export function upgradeClientSubscription(tier: string) {
  let maxProjects = 'Ilimitado';
  if (tier === 'estandar') maxProjects = '1 Proyecto';
  else if (tier === 'pro') maxProjects = '5 Proyectos';
  
  _clientSubscription = {
    ..._clientSubscription,
    tier,
    maxProjects
  };
  return _clientSubscription;
}

export function getClienteTasks(email: string) {
  if (!_initialized) {
    _tasks = [
      {
        id: "c_mock_1",
        titulo: "Mi Proyecto Web (Cliente)",
        descripcion: "Diseño y desarrollo de sitio web corporativo.",
        estado: "in_progress",
        prioridad: "high",
        asignado_a: "pm1@nexovibe.com", // Assigned PM
        fecha_inicio: "2026-05-01",
        fecha_limite: "2026-06-15",
        progreso: 45,
        presupuesto_total: 5000,
        presupuesto_utilizado: 2200,
        empleados_asignados: ["pm1@nexovibe.com"],
        cliente_email: email,
        comentarios: []
      },
      {
        id: "c_mock_2",
        titulo: "Campaña Marketing Q2",
        descripcion: "Estrategia de redes y ads.",
        estado: "todo",
        prioridad: "normal",
        asignado_a: "pm2@nexovibe.com",
        fecha_inicio: "2026-06-01",
        fecha_limite: "2026-07-30",
        progreso: 0,
        presupuesto_total: 3000,
        presupuesto_utilizado: 0,
        empleados_asignados: ["pm2@nexovibe.com"],
        cliente_email: email,
        comentarios: []
      }
    ];
    _initialized = true;
  }
  return [..._tasks];
}

export function mergeWithApiClient(apiTasks: MockTask[], email: string) {
  const local = getClienteTasks(email);
  // In a real app we'd filter apiTasks by cliente_email. For mock, we just use local.
  return local;
}
