import React, { useState } from 'react';
import AdminDashboard from './views/admin/AdminDashboard';
import ClientApp from './views/client/ClientApp';
import { Monitor, Smartphone, Diamond } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'SELECT' | 'ADMIN' | 'CLIENT'>('SELECT');

  if (mode === 'ADMIN') return <AdminDashboard onBack={() => setMode('SELECT')} />;
  if (mode === 'CLIENT') return (
    <div className="relative">
      <button 
        onClick={() => setMode('SELECT')} 
        className="absolute top-4 left-4 z-[100] px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-md text-blue-600 font-medium hover:bg-blue-50 transition-colors"
      >
        ← Volver al Menú
      </button>
      <ClientApp />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center p-6 font-sans text-[#1d1d1f] selection:bg-blue-200">
      <div className="mb-16 flex flex-col items-center space-y-5 text-center">
        <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-500/30">
          <Diamond size={48} fill="currentColor" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Diamonds Residencial</h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-md">Selecciona el entorno de trabajo para continuar</p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <button 
          onClick={() => setMode('ADMIN')} 
          className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center space-y-6 border border-gray-100 group"
        >
          <div className="w-28 h-28 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <Monitor size={56} />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">Recepción</h2>
            <p className="text-gray-500 leading-relaxed text-lg">Dashboard de administración, control de habitaciones, check-in y check-out.</p>
          </div>
        </button>

        <button 
          onClick={() => setMode('CLIENT')} 
          className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center space-y-6 border border-gray-100 group"
        >
          <div className="w-28 h-28 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <Smartphone size={56} />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">App Cliente</h2>
            <p className="text-gray-500 leading-relaxed text-lg">Interfaz de reservas, monitor de estancia y pagos para huéspedes.</p>
          </div>
        </button>
      </div>
    </div>
  );
}
