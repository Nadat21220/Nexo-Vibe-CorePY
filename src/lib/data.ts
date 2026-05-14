export const mockData = {
  campanas: [
    { id: "c1", nombre_campana: "NexoCore Redesign", color: "#FF3B30", status: "ACTIVE" },
    { id: "c2", nombre_campana: "Client X Portal", color: "#00C48C", status: "ACTIVE" },
    { id: "c3", nombre_campana: "Marketing Engine V2", color: "#FFB800", status: "ACTIVE" },
  ],
  clientes: [
    { id: "cl1", nombre: "Sarah", apellido: "Connor", email: "client@apple.com" },
    { id: "cl2", nombre: "Elon", apellido: "Mars", email: "client2@tesla.com" },
    { id: "cl3", nombre: "Tim", apellido: "Cook", email: "client3@apple.com" },
  ],
  empleados: [
    { id: "e1", nombre: "Alex", apellido: "Sterling", email: "admin@nexovibe.com", estado: "ACTIVE" },
    { id: "e2", nombre: "Jordan", apellido: "Vane", email: "pm1@nexovibe.com", estado: "ACTIVE" },
    { id: "e3", nombre: "Casey", apellido: "Quinn", email: "pm2@nexovibe.com", estado: "ACTIVE" },
  ],
  creadores: [
    { id: "u1", nombre: "Ana", apellido: "Tech", email: "ana@tiktok.com", plataforma: "TikTok", handle: "@anatech" },
  ],
  tareas: [
    { 
      id: "t1", 
      titulo: "Implement JWT Auth", 
      descripcion: "Secure the API using modern JWT practices.", 
      estado: "todo", 
      prioridad: "inmediata", 
      asignado_a: "admin@nexovibe.com", 
      fecha_limite: "Feb 9", 
      campana: "c1",
      empleados_asignados: ["admin@nexovibe.com"], 
      empleados_peticion: [], 
      adjuntos: [
        { nombre: "auth_schema.pdf", tamaño: "1.2 MB", tipo: "pdf" }
      ],
      comentarios: [{ autor: "System", texto: "Tarea generada automáticamente", fecha: "2026-02-01" }] 
    },
    { 
      id: "t2", 
      titulo: "Design Landing Page", 
      descripcion: "Create high-fidelity mockups in Figma.", 
      estado: "in_progress", 
      prioridad: "inmediata", 
      asignado_a: "pm1@nexovibe.com", 
      fecha_limite: "Feb 14", 
      campana: "c1",
      empleados_asignados: ["pm1@nexovibe.com", "pm2@nexovibe.com"], 
      empleados_peticion: ["admin@nexovibe.com"], 
      adjuntos: [
        { nombre: "landing_v1.png", tamaño: "4.5 MB", tipo: "image" },
        { nombre: "brief_proyecto.docx", tamaño: "0.8 MB", tipo: "word" },
        { nombre: "estilos_guia.pdf", tamaño: "2.1 MB", tipo: "pdf" }
      ],
      comentarios: [] 
    },
    { 
      id: "t3", 
      titulo: "Database Migration", 
      descripcion: "Move from legacy SQL to modern PostgreSQL.", 
      estado: "review", 
      prioridad: "medium", 
      asignado_a: "pm2@nexovibe.com", 
      fecha_limite: "Feb 4", 
      campana: "c2",
      empleados_asignados: ["pm2@nexovibe.com"], 
      empleados_peticion: [], 
      adjuntos: [
        { nombre: "migration_plan.txt", tamaño: "0.1 MB", tipo: "text" }
      ],
      comentarios: [] 
    },
    { 
      id: "t4", 
      titulo: "QA Testing Phase 1", 
      descripcion: "Bug hunting in the initial release.", 
      estado: "done", 
      prioridad: "low", 
      asignado_a: "pm1@nexovibe.com", 
      fecha_limite: "Jan 24", 
      campana: "c2",
      empleados_asignados: ["pm1@nexovibe.com"], 
      empleados_peticion: [], 
      adjuntos: [],
      comentarios: [] 
    },
    { 
      id: "t5", 
      titulo: "API Documentation", 
      descripcion: "Write Swagger docs for all endpoints.", 
      estado: "todo", 
      prioridad: "high", 
      asignado_a: "pm2@nexovibe.com", 
      fecha_limite: "Feb 19", 
      campana: "c3",
      empleados_asignados: ["pm2@nexovibe.com"], 
      empleados_peticion: [], 
      adjuntos: [],
      comentarios: [] 
    },
  ],
  objetivos: [
    { id: "obj1", tipo: "alerta", titulo: "DATABASE MIGRATION", descripcion: "Alto impacto detectado (20h). Supervisión recomendada." },
    { id: "obj2", tipo: "cultura", titulo: "CULTURA INTERNA", descripcion: "Optimización de capacitación trimestral." }
  ]
};
