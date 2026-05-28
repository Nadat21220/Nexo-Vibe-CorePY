import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Users, Bot, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { name: 'Resumen General', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tablero de Proyectos', href: '/dashboard/kanban', icon: CheckSquare },
  { name: 'Gestión de Socios', href: '/dashboard/socios', icon: Users },
  { name: 'Gestión de Tecnologías', href: '/dashboard/ias', icon: Bot },
  { name: 'Calendario Maestro', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Mi Perfil', href: '/dashboard/perfil', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user, role } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const filteredNavItems = navItems.filter(item => {
    if (role === 'admin') return true;
    if (role === 'empleado') {
      return true; // Empleados ven todo (con restricciones dentro de cada página)
    }
    if (role === 'cliente') {
      return ['Resumen General', 'Tablero de Proyectos', 'Calendario Maestro', 'Mi Perfil'].includes(item.name);
    }
    return true;
  });

  return (
    <aside className="w-[200px] bg-[#080808] border-r border-surface-400 flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6 border-b border-surface-400">
        <h1 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-unbounded)' }}>NEXOVIBE.</h1>
        {role && (
          <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1">
            {role === 'admin' ? 'Superadmin' : role === 'empleado' ? 'Staff Empleado' : 'Panel Cliente'}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <div className="px-6 mb-4">
          <p className="text-[10px] text-surface-600 uppercase tracking-[0.2em] font-semibold">
            {role === 'admin' ? 'Sistema Core - Admin' : 'Portal de Trabajo'}
          </p>
        </div>

        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center px-6 py-3 text-sm transition-colors ${isActive ? 'text-primary border-r-2 border-primary bg-surface-300/50' : 'text-surface-600 hover:text-white hover:bg-surface-300/30'}`}>
                <item.icon className={`w-4 h-4 mr-3 ${isActive ? 'text-primary' : 'text-surface-600'}`} />
                <span className="flex-1 font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-surface-400 flex items-center justify-between">
        <div className="flex items-center min-w-0">
          <div className="w-8 h-8 rounded-full bg-surface-500 mr-3 flex-shrink-0 flex items-center justify-center text-xs text-white uppercase">
            {user?.email ? user.email.charAt(0) : 'A'}
          </div>
          <div className="text-xs min-w-0">
            <p className="text-white font-medium truncate" title={user?.email}>
              {user?.email || 'Admin User'}
            </p>
            <button onClick={handleLogout} className="text-surface-600 hover:text-primary transition-colors flex items-center mt-1">
              <LogOut className="w-3 h-3 mr-1" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
