import React, { useState, useEffect } from 'react';
import { Room, Booking } from '../../core/domain';
import { calculateCurrentTotal } from '../../core/pricing';
import { Key, Wind, Tv, CreditCard, X, Check, CheckCircle, AlertTriangle } from 'lucide-react';

export function CheckoutModal({ room, booking, onClose, onCheckout }: { room: Room, booking: Booking, onClose: () => void, onCheckout: () => void }) {
  const [checks, setChecks] = useState({ key: false, ac: false, tv: false, ci: false });
  const [currentTotal, setCurrentTotal] = useState(room.price);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTotal(calculateCurrentTotal(room.price, room.duration, new Date(booking.checkInDate)));
    }, 1000);
    return () => clearInterval(interval);
  }, [room, booking]);

  const allChecked = checks.key && checks.ac && checks.tv && checks.ci;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-black hover:bg-gray-100 rounded-full transition-colors z-10">
          <X size={24} />
        </button>
        <div className="p-6 md:p-8 border-b border-black/5 shrink-0">
          <h2 className="text-2xl font-bold text-black mb-1 pr-8">Salida Hab. {room.number}</h2>
          <p className="text-gray-500 font-medium">Huésped: {booking.guest.name}</p>
        </div>
        <div className="p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1">
          {booking.guest.ciInDeposit && (
            <div className="bg-black text-white p-5 rounded-2xl flex items-start space-x-4">
              <AlertTriangle className="shrink-0 mt-0.5" size={24} />
              <div>
                <p className="font-bold text-lg">CI en Depósito</p>
                <p className="text-sm opacity-80">Devolver el carnet al huésped.</p>
              </div>
            </div>
          )}
          <div className="bg-[#f5f5f7] p-6 rounded-3xl border border-black/5 text-center">
            <p className="text-xs font-bold text-gray-400 mb-1">Total</p>
            <p className="text-5xl font-bold text-black tracking-tight">Bs. {currentTotal.toFixed(2)}</p>
          </div>
          <div className="space-y-3">
             <ChecklistItem icon={Key} label="Llave" checked={checks.key} onChange={(v: boolean) => setChecks({...checks, key: v})} />
             <ChecklistItem icon={Wind} label="AC" checked={checks.ac} onChange={(v: boolean) => setChecks({...checks, ac: v})} />
             <ChecklistItem icon={Tv} label="TV" checked={checks.tv} onChange={(v: boolean) => setChecks({...checks, tv: v})} />
             <ChecklistItem icon={CreditCard} label="CI Devuelto" checked={checks.ci} onChange={(v: boolean) => setChecks({...checks, ci: v})} />
          </div>
        </div>
        <div className="p-6 md:p-8 border-t border-black/5">
          <button disabled={!allChecked} onClick={onCheckout} className="w-full py-4 bg-black disabled:bg-gray-100 text-white font-medium rounded-2xl flex items-center justify-center space-x-2">
            <CheckCircle size={20} /><span>Finalizar Estancia</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ icon: Icon, label, checked, onChange }: any) {
  return (
    <div onClick={() => onChange(!checked)} className={`flex items-center space-x-4 p-4 rounded-2xl cursor-pointer border ${checked ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10'}`}>
      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${checked ? 'border-white bg-white text-black' : 'border-black/30'}`}>
        {checked && <Check size={14} strokeWidth={3} />}
      </div>
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
  );
}
