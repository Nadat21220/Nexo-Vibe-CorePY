# NexoVibe — Separación de Vistas: Admin vs Empleado

## 📋 Descripción General

Este documento describe la arquitectura implementada para **aislar completamente** la vista del `Superadmin` de la vista del `Empleado` dentro del dashboard de NexoVibe, sin usar una base de datos real.

---

## 🧠 El Problema

NexoVibe opera en modo **simulación (mock)** — no hay base de datos real. Toda la información vive en `src/lib/data.ts` (un objeto en memoria del servidor Next.js) y en el estado React del cliente.

El reto era:
- **Admin** debe ver **todos** los proyectos globales sin contaminación.
- **Empleado** debe ver **sólo sus proyectos asignados**, más proyectos simulados exclusivos para él.
- Los proyectos que el empleado crea **NO deben aparecer en la vista del Admin**.

---

## 🏗️ Arquitectura Implementada

### 1. Autenticación Simulada (`src/app/api/auth/login/route.ts`)

El rol se asigna según el dominio del email al hacer login:

| Email termina en | Rol asignado |
|-----------------|-------------|
| `.com`          | `admin`     |
| `.net`          | `empleado`  |

El objeto de sesión se guarda en `localStorage` bajo la clave `mock_user` y se lee en el `AuthContext` (`src/context/AuthContext.tsx`).

---

### 2. Flujo de Datos

#### Vista Admin
```
API (/api/tasks) → data.tareas (completo) → setTasks
```
El admin recibe el array completo sin filtrar. Sus métricas en el Dashboard se calculan directamente desde la respuesta de la API.

#### Vista Empleado
```
API (/api/tasks) → filtrar por empleados_asignados[email]
                  + mergeWithApi(empleadoStore) → setTasks
```
El empleado recibe sus tareas de la API **más** los proyectos del `empleadoStore` (ver sección 3).

---

### 3. Employee Store — `src/lib/empleadoStore.ts`

El componente central de la separación es un **módulo singleton** que vive fuera de React:

```typescript
// Variables a nivel de módulo (fuera del componente)
let _tasks: any[] = [];
let _initialized = false;
```

**¿Por qué a nivel de módulo?**
- Las variables de módulo en JavaScript persisten durante toda la sesión del navegador.
- Diferentes páginas (Kanban, Dashboard, IAS) que importen este módulo **comparten la misma instancia** en memoria.
- El Admin **nunca importa ni ve** este store — sólo usa la API directamente.

**Funciones exportadas:**

| Función | Descripción |
|---------|-------------|
| `getEmpTasks(email)` | Devuelve tareas del empleado. En el primer llamado, siembra los 2 proyectos simulados. |
| `addEmpTask(task)` | Agrega un proyecto creado por el empleado al store local. |
| `updateEmpTask(id, updates)` | Actualiza campos de un proyecto (progreso, presupuesto, estado). |
| `deleteEmpTask(id)` | Elimina un proyecto del store local. |
| `mergeWithApi(apiTasks, email)` | Combina las tareas de la API con las del store, deduplicando por `id`. |

---

### 4. Páginas Modificadas

#### `src/app/dashboard/kanban/page.tsx`
- **Creación**: Si `role === 'empleado'`, el nuevo proyecto se guarda en `addEmpTask()` y se actualiza el estado React local. **No llama a la API** (POST).
- **Drag & Drop**: Si es empleado, actualiza `updateEmpTask()`. Si es admin, llama a la API (PUT).
- **Eliminación**: Si es empleado, llama a `deleteEmpTask()`. Si es admin, llama a la API (DELETE).
- **Fetch**: Usa `mergeWithApi()` para combinar datos de la API con el store local.

#### `src/app/dashboard/page.tsx` (Resumen/Dashboard)
- Si `role === 'empleado'`, llama a `getEmpTasks()` para obtener **todos** los proyectos del store (incluyendo los recién creados en Kanban).
- Recalcula las métricas (progreso promedio, presupuesto usado, distribución de tareas) usando los proyectos del empleado, no los del admin.
- **El Admin** usa directamente los datos de `/api/dashboard` sin pasar por el store.

#### `src/app/dashboard/ias/page.tsx` (Gestión de Tecnologías)
- Filtra y muestra sólo los proyectos del empleado usando `mergeWithApi()`.

---

### 5. Proyectos Simulados

Al inicializarse por primera vez (cuando el empleado entra a cualquier sección), el store siembra **2 proyectos de demostración**:

| ID | Nombre | Estado | Progreso |
|----|--------|--------|---------|
| `e_mock_1` | Proyecto Exclusivo Empleado A | TO DO | 30% |
| `e_mock_2` | Proyecto Exclusivo Empleado B | IN PROGRESS | 70% |

Estos **nunca aparecen en la vista del Admin** porque el Admin lee directamente de `src/lib/data.ts` vía la API.

---

## 🔒 Garantía de Separación

| Acción | Admin | Empleado |
|--------|-------|---------|
| Ver proyectos | Todos los de `data.ts` | Solo los asignados + store local |
| Crear proyecto | Escribe en `data.ts` vía API | Escribe en `empleadoStore` (memoria) |
| Ver métricas | Calculadas sobre todos los proyectos | Recalculadas sobre sus proyectos |
| Proyectos mock | ❌ Nunca los ve | ✅ Siempre los tiene |

---

## 📁 Archivos Clave

```
src/
├── lib/
│   ├── data.ts              # Mock DB del servidor (solo admin lo modifica)
│   └── empleadoStore.ts     # Singleton de proyectos del empleado (solo cliente)
├── context/
│   └── AuthContext.tsx      # Provee role y user a toda la app
└── app/
    └── dashboard/
        ├── page.tsx         # Resumen/Dashboard — métricas por rol
        ├── kanban/
        │   └── page.tsx     # Tablero — CRUD por rol
        └── ias/
            └── page.tsx     # Gestión de tecnologías — filtrado por rol
```

---

## ⚠️ Limitaciones Actuales

1. **Sin persistencia real**: Si el usuario recarga la página, los proyectos creados por el empleado se pierden (el store se reinicializa con los 2 mocks). Esto es intencional para la fase de simulación.
2. **Sin autenticación segura**: El rol se basa en el email, no en tokens JWT o sesiones seguras. Para producción se requiere implementar NextAuth o similar.
3. **Sin sincronización entre pestañas**: Si el empleado abre dos pestañas, los stores son independientes.

---

*Documentado por: Antigravity AI — NexoVibe Platform, Mayo 2026*
