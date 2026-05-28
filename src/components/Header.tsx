import { Search, Bell, Maximize } from 'lucide-react';

export function Header({ title }: { title: string }) {
  return (
    <header className="h-[56px] bg-[#050505] border-b border-surface-400 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center min-w-0 mr-4">
        <div className="text-surface-600 mr-3 md:mr-4 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        </div>
        <h2 className="text-xs md:text-sm text-surface-600 uppercase font-semibold tracking-widest truncate">{title}</h2>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-surface-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="bg-surface-300 border border-surface-500 rounded-full py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary w-[120px] md:w-[280px] transition-all placeholder-surface-500 shadow-inner"
          />
        </div>

        <div className="flex items-center space-x-3 md:space-x-4 text-surface-600">
          <button className="hover:text-white transition-colors p-1"><Maximize className="w-4 h-4" /></button>
          <button className="hover:text-white transition-colors relative p-1">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
