import React from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, LogOut } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (v: 'new' | 'manage' | 'schedule') => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8 pt-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-black">Bienvenido</h2>
        <p className="text-gray-500 font-medium">¿Qué deseas hacer hoy?</p>
      </div>
      <div className="space-y-4">
        <button onClick={() => onNavigate('new')} className="w-full bg-black text-white p-6 rounded-[2rem] shadow-md hover:bg-gray-900 transition-all flex flex-col items-center space-y-3 active:scale-[0.98]">
          <Clock size={40} />
          <span className="font-semibold text-xl">Ingreso Inmediato</span>
        </button>
        <button onClick={() => onNavigate('schedule')} className="w-full bg-white text-black border border-black/10 p-6 rounded-[2rem] shadow-sm hover:border-black transition-all flex flex-col items-center space-y-3 active:scale-[0.98]">
          <Calendar size={40} />
          <span className="font-semibold text-xl">Agendar Reserva</span>
        </button>
        <button onClick={() => onNavigate('manage')} className="w-full bg-[#f5f5f7] text-black border border-black/10 p-6 rounded-[2rem] shadow-sm hover:border-black transition-all flex flex-col items-center space-y-3 active:scale-[0.98]">
          <LogOut size={40} />
          <span className="font-semibold text-xl">Mis Reservas</span>
        </button>
      </div>
    </motion.div>
  );
}
