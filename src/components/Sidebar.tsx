import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Users, Video, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { name: 'Resumen General', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tablero de Tareas', href: '/dashboard/kanban', icon: CheckSquare },
  { name: 'Gestión de Socios', href: '/dashboard/socios', icon: Users },
  { name: 'Producción UGC', href: '/dashboard/ugc', icon: Video },
  { name: 'Calendario Maestro', href: '/dashboard/calendar', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-[200px] bg-[#080808] border-r border-surface-400 flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6 border-b border-surface-400">
        <h1 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-unbounded)' }}>NEXOVIBE.</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <div className="px-6 mb-4">
          <p className="text-[10px] text-surface-600 uppercase tracking-[0.2em] font-semibold">Sistema Core - Admin</p>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center px-6 py-3 text-sm transition-colors ${isActive ? 'text-primary border-r-2 border-primary bg-surface-300/50' : 'text-surface-600 hover:text-white hover:bg-surface-300/30'}`}>
                <item.icon className={`w-4 h-4 mr-3 ${isActive ? 'text-primary' : 'text-surface-600'}`} />
                <span className="flex-1 font-medium">{item.name}</span>
                {item.hasSubmenu && <span className="text-surface-600 text-xs">›</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-surface-400 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-surface-500 mr-3 flex items-center justify-center text-xs text-white">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="text-xs">
            <p className="text-white font-medium">{user?.email || 'Admin User'}</p>
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
