"use client";

import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Shield, Award, Edit2, Save } from 'lucide-react';
import { useState } from 'react';

export default function PerfilPage() {
  const { user, role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nombre: 'Cliente',
    apellido: 'NexoVibe',
    telefono: '+52 55 1234 5678',
    empresa: 'Mi Empresa S.A.'
  });

  const getRoleBadge = () => {
    switch(role) {
      case 'admin': return <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest flex items-center"><Shield className="w-3 h-3 mr-1" /> Superadmin</span>;
      case 'empleado': return <span className="bg-[#4da6ff]/20 text-[#4da6ff] border border-[#4da6ff]/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest flex items-center"><Award className="w-3 h-3 mr-1" /> Staff Empleado</span>;
      case 'cliente': return <span className="bg-[#00C48C]/20 text-[#00C48C] border border-[#00C48C]/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest flex items-center"><User className="w-3 h-3 mr-1" /> Cliente VIP</span>;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      <Header title="Mi Perfil" />
      <main className="p-8 max-w-4xl mx-auto w-full flex-1 overflow-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wide text-white mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>MI PERFIL</h1>
            <p className="text-surface-600 uppercase tracking-widest text-xs">GESTIONA TU INFORMACIÓN PERSONAL</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${isEditing ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-red-600' : 'bg-surface-200 text-surface-500 hover:text-white border border-surface-400 hover:border-surface-500'}`}
          >
            {isEditing ? <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</> : <><Edit2 className="w-4 h-4 mr-2" /> Editar Perfil</>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-surface-200 border border-surface-400 rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-surface-400 border-4 border-surface-200 shadow-xl overflow-hidden mb-4 relative group">
              <img src={`https://i.pravatar.cc/200?u=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer transition-opacity">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Cambiar</span>
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{profileData.nombre} {profileData.apellido}</h2>
            <p className="text-surface-500 text-sm mb-4">{profileData.empresa}</p>
            <div className="mb-6">
              {getRoleBadge()}
            </div>
            <div className="w-full border-t border-surface-400 pt-6">
              <div className="flex items-center justify-center text-surface-600 text-sm">
                <Mail className="w-4 h-4 mr-2" />
                {user?.email || 'usuario@nexovibe.com'}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-surface-200 border border-surface-400 rounded-2xl p-8 shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 border-b border-surface-400 pb-4">INFORMACIÓN BÁSICA</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Nombre</label>
                  <input 
                    type="text" 
                    value={profileData.nombre} 
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, nombre: e.target.value})}
                    className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Apellido</label>
                  <input 
                    type="text" 
                    value={profileData.apellido} 
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, apellido: e.target.value})}
                    className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Empresa / Organización</label>
                  <input 
                    type="text" 
                    value={profileData.empresa} 
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, empresa: e.target.value})}
                    className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Teléfono</label>
                  <input 
                    type="text" 
                    value={profileData.telefono} 
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, telefono: e.target.value})}
                    className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2 font-bold">Correo Electrónico (No Editable)</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full bg-surface-100 border border-surface-400 rounded-lg px-4 py-3 text-sm text-surface-500 cursor-not-allowed" 
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
