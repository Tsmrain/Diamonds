import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Room, Booking } from '../core/domain';
import { useTimer } from '../hooks/useTimer';

export function ManageReservations() {
  const [loginCI, setLoginCI] = useState('');
  const [loggedInCI, setLoggedInCI] = useState('');
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const loadData = async () => {
    if (loggedInCI) {
      const b = await api.getBookingsByGuest(loggedInCI);
      const r = await api.getRooms();
      setMyBookings(b.sort((x, y) => new Date(y.checkInDate).getTime() - new Date(x.checkInDate).getTime()));
      setRooms(r);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loggedInCI]);

  if (!loggedInCI) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 pt-12 space-y-6">
        <h2 className="text-2xl font-bold text-black">Ingresa a tus reservas</h2>
        <p className="text-gray-500 font-medium">Ingresa tu Carnet de Identidad para ver tu estancia actual.</p>
        <input type="text" placeholder="Ej. 1234567" value={loginCI} onChange={e => setLoginCI(e.target.value)} className="w-full bg-white border border-black/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-lg shadow-sm" />
        <button disabled={!loginCI.trim()} onClick={() => setLoggedInCI(loginCI.trim())} className="w-full bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm">
          Ingresar
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Mis Reservas</h2>
        <button onClick={() => setLoggedInCI('')} className="p-2 text-black hover:bg-black/5 rounded-full transition-colors"><LogOut size={20} /></button>
      </div>

      {myBookings.length === 0 ? (
        <p className="text-gray-500 text-center py-12 font-medium">No tienes reservas registradas con este CI.</p>
      ) : (
        <div className="space-y-4">
          {myBookings.map(booking => {
            const room = rooms.find(r => r.id === booking.roomId);
            if (!room) return null;
            return <BookingCard key={booking.id} booking={booking} room={room} onUpdate={loadData} />;
          })}
        </div>
      )}
    </motion.div>
  );
}

function BookingCard({ booking, room, onUpdate }: { booking: Booking, room: Room, onUpdate: () => void }) {
  const { isOvertime, remainingOrOvertimeFormatted } = useTimer(booking.checkInDate, room.duration);
  const isActive = booking.status === 'ACTIVE';
  const isPending = booking.status === 'PENDING_ARRIVAL';
  const [confirmAction, setConfirmAction] = useState<'CANCEL' | 'CHECKOUT' | null>(null);

  const handleAction = async () => {
    if (confirmAction === 'CANCEL') {
      await api.cancelBooking(booking.id, room.id);
    } else if (confirmAction === 'CHECKOUT') {
      await api.checkout(booking.id);
      await api.updateRoomStatus(room.id, 'DIRTY');
    }
    setConfirmAction(null);
    onUpdate();
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-xl text-black">Habitación {room.number}</h3>
          <p className="text-sm font-medium text-gray-500">{room.type}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-black text-white' : isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-black/5 text-black'}`}>
          {isActive ? 'Activa' : isPending ? 'En Camino' : 'Completada'}
        </span>
      </div>
      
      {isActive && (
        <div className={`p-4 rounded-2xl flex items-center justify-between ${isOvertime ? 'bg-black text-white' : 'bg-[#f5f5f7] text-black'}`}>
          <span className="font-semibold text-sm uppercase tracking-wider">{isOvertime ? 'Tiempo Excedido' : 'Tiempo Restante'}</span>
          <span className={`font-mono font-bold text-xl ${isOvertime ? 'animate-pulse' : ''}`}>
            {isOvertime ? '+' : '-'}{remainingOrOvertimeFormatted}
          </span>
        </div>
      )}

      {isPending && (
        <div className="p-4 rounded-2xl flex items-center justify-between bg-yellow-50 text-yellow-900 border border-yellow-200">
          <span className="font-semibold text-sm uppercase tracking-wider flex items-center space-x-2">
            <Clock size={16} />
            <span>Esperando Llegada</span>
          </span>
          <span className="font-bold text-sm">
            ~{booking.eta} min
          </span>
        </div>
      )}

      <div className="text-sm font-medium text-gray-500 space-y-1 border-t border-black/5 pt-4">
        <p>Reserva: {new Date(booking.checkInDate).toLocaleString('es-BO')}</p>
        <p>Huésped: {booking.guest.name}</p>
      </div>

      {!confirmAction && isActive && (
        <button onClick={() => setConfirmAction('CHECKOUT')} className="w-full mt-4 py-3 bg-black/5 text-black font-semibold rounded-xl hover:bg-black/10 transition-colors">
          Finalizar Estancia Anticipadamente
        </button>
      )}
      {!confirmAction && isPending && (
        <button onClick={() => setConfirmAction('CANCEL')} className="w-full mt-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors">
          Cancelar Reserva
        </button>
      )}

      {confirmAction && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
          <h4 className="text-lg font-bold text-black mb-2">
            {confirmAction === 'CANCEL' ? '¿Cancelar reserva?' : '¿Finalizar estancia?'}
          </h4>
          <p className="text-sm text-gray-500 mb-6">
            {confirmAction === 'CANCEL' 
              ? 'Esta acción liberará la habitación.' 
              : 'La habitación se marcará para limpieza y tu tiempo terminará.'}
          </p>
          <div className="flex space-x-3 w-full">
            <button onClick={() => setConfirmAction(null)} className="flex-1 py-3 bg-gray-100 text-black font-semibold rounded-xl">
              Volver
            </button>
            <button onClick={handleAction} className={`flex-1 py-3 text-white font-semibold rounded-xl ${confirmAction === 'CANCEL' ? 'bg-red-600' : 'bg-black'}`}>
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
