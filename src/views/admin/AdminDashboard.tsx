import React, { useEffect, useState } from 'react';
import { Room, Booking } from '../../core/domain';
import { api } from '../../services/api';
import { calculateCurrentTotal } from '../../core/pricing';
import { useTimer } from '../../hooks/useTimer';
import { ChevronLeft, Key, Tv, Wind, CreditCard, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

// RoomCard Component
const RoomCard = ({ room, booking, onClick }: { room: Room, booking?: Booking, onClick: () => void }) => {
  const { isOvertime, remainingOrOvertimeFormatted } = useTimer(booking?.checkInDate || new Date().toISOString(), room.duration);
  
  const statusColors = {
    VACANT: 'bg-green-50 border-green-200 text-green-800',
    OCCUPIED: 'bg-blue-50 border-blue-200 text-blue-800',
    OVERTIME: 'bg-orange-50 border-orange-300 text-orange-900',
    DIRTY: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    MAINTENANCE: 'bg-gray-100 border-gray-300 text-gray-800',
  };

  // Force status override if overtime detected
  const displayStatus = (room.status === 'OCCUPIED' && isOvertime) ? 'OVERTIME' : room.status;

  return (
    <div onClick={onClick} className={`p-5 rounded-3xl border-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${statusColors[displayStatus]} flex flex-col justify-between h-44 relative overflow-hidden`}>
      {displayStatus === 'OVERTIME' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 animate-pulse" />
      )}
      <div className="flex justify-between items-start">
        <span className="text-3xl font-bold tracking-tight">{room.number}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">{displayStatus}</span>
      </div>
      <div>
        <p className="font-semibold opacity-90 text-sm">{room.type}</p>
        {booking && (
          <div className="mt-3 flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-xl w-fit">
            <span className={`font-mono font-bold ${isOvertime ? 'text-orange-600' : 'text-blue-600'}`}>
              {isOvertime ? '+' : '-'}{remainingOrOvertimeFormatted}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  const loadData = async () => {
    const r = await api.getRooms();
    const b = await api.getActiveBookings();
    setRooms(r);
    setBookings(b);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh periodically
    return () => clearInterval(interval);
  }, []);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setActiveBooking(bookings.find(b => b.roomId === room.id) || null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 md:p-10 font-sans text-[#1d1d1f]">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-5">
          <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-blue-600">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Recepción</h1>
            <p className="text-gray-500 text-lg">Control de Habitaciones</p>
          </div>
        </div>
        <button onClick={loadData} className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-all text-gray-500" title="Actualizar">
          <RefreshCw size={20} />
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {rooms.map(room => (
          <RoomCard 
            key={room.id} 
            room={room} 
            booking={bookings.find(b => b.roomId === room.id)} 
            onClick={() => handleRoomClick(room)} 
          />
        ))}
      </div>

      {selectedRoom && activeBooking && (
        <CheckoutModal 
          room={selectedRoom} 
          booking={activeBooking} 
          onClose={() => setSelectedRoom(null)} 
          onCheckout={async () => {
            await api.checkout(activeBooking.id);
            await api.updateRoomStatus(selectedRoom.id, 'DIRTY');
            setSelectedRoom(null);
            loadData();
          }}
        />
      )}

      {selectedRoom && !activeBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-2">Habitación {selectedRoom.number}</h2>
            <p className="text-gray-500 mb-6">Estado: {selectedRoom.status}</p>
            <button onClick={() => setSelectedRoom(null)} className="w-full py-4 bg-gray-100 text-gray-800 font-semibold rounded-2xl hover:bg-gray-200 transition-colors">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckoutModal({ room, booking, onClose, onCheckout }: { room: Room, booking: Booking, onClose: () => void, onCheckout: () => void }) {
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Check-out Hab. {room.number}</h2>
            <p className="text-gray-500">Huésped: {booking.guest.name}</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {booking.guest.ciInDeposit && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-start space-x-3 text-orange-800 shadow-sm">
              <AlertTriangle className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">CI en Depósito</p>
                <p className="text-sm">No olvides devolver el carnet de identidad al huésped.</p>
              </div>
            </div>
          )}

          <div className="bg-[#f5f5f7] p-6 rounded-3xl border border-gray-200 shadow-inner">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total a cobrar (Tiempo Real)</p>
            <p className="text-5xl font-bold text-blue-600 tracking-tight">Bs. {currentTotal.toFixed(2)}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 uppercase tracking-wider text-xs mb-2">Checklist de Recepción</h3>
            <label className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
              <input type="checkbox" checked={checks.key} onChange={e => setChecks({...checks, key: e.target.checked})} className="w-6 h-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
              <div className="flex items-center space-x-3"><Key size={20} className="text-gray-500"/><span className="font-medium">Llave entregada</span></div>
            </label>
            <label className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
              <input type="checkbox" checked={checks.ac} onChange={e => setChecks({...checks, ac: e.target.checked})} className="w-6 h-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
              <div className="flex items-center space-x-3"><Wind size={20} className="text-gray-500"/><span className="font-medium">Control AC entregado</span></div>
            </label>
            <label className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
              <input type="checkbox" checked={checks.tv} onChange={e => setChecks({...checks, tv: e.target.checked})} className="w-6 h-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
              <div className="flex items-center space-x-3"><Tv size={20} className="text-gray-500"/><span className="font-medium">Control TV entregado</span></div>
            </label>
            <label className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
              <input type="checkbox" checked={checks.ci} onChange={e => setChecks({...checks, ci: e.target.checked})} className="w-6 h-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
              <div className="flex items-center space-x-3"><CreditCard size={20} className="text-gray-500"/><span className="font-medium">CI devuelto al huésped</span></div>
            </label>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex space-x-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-colors shadow-sm">Cancelar</button>
          <button disabled={!allChecked} onClick={onCheckout} className="flex-1 py-4 bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-md">
            <CheckCircle size={20} /><span>Completar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
