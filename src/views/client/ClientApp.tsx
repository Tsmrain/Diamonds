import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ChevronLeft, Diamond } from 'lucide-react';

// Nuevos componentes extraídos para alta cohesión
import { HomeView } from '../../components/HomeView';
import { NewReservationFlow } from '../../components/NewReservationFlow';
import { ManageReservations } from '../../components/ManageReservations';
import { ScheduleReservationFlow } from '../../components/ScheduleReservationFlow';

export default function ClientApp() {
  const [view, setView] = useState<'home' | 'new' | 'manage' | 'schedule'>('home');

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] flex justify-center selection:bg-black/10">
      <div className="w-full max-w-md bg-[#f5f5f7] min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        <header className="sticky top-0 z-50 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-black/5 px-4 py-4 flex items-center justify-between">
          {view !== 'home' ? (
            <button 
              onClick={() => setView('home')} 
              className="p-2 -ml-2 text-black hover:bg-black/5 rounded-full transition-colors"
            >
              <ChevronLeft size={28} />
            </button>
          ) : <div className="w-11" />}
          
          <div className="flex items-center space-x-2">
            <Diamond className="text-black" size={24} fill="currentColor" />
            <h1 className="font-semibold text-lg tracking-tight">Diamonds</h1>
          </div>
          <div className="w-11" />
        </header>

        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <HomeView key="home" onNavigate={setView} />
            )}
            
            {view === 'new' && (
              <NewReservationFlow key="new" onFinish={() => setView('manage')} />
            )}
            
            {view === 'manage' && (
              <ManageReservations key="manage" />
            )}
            
            {view === 'schedule' && (
              <ScheduleReservationFlow key="schedule" onFinish={() => setView('home')} />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
