import React, { useEffect, useState } from 'react';
import { Room, Booking, RoomStatus, Reservation } from '../../core/domain';
import { api } from '../../services/api';
import { calculateCurrentTotal } from '../../core/pricing';
import { useTimer } from '../../hooks/useTimer';
import { ChevronLeft, Key, Tv, Wind, CreditCard, CheckCircle, AlertTriangle, RefreshCw, X, Check, ChevronRight, Calendar, Clock } from 'lucide-react';

const STATUS_ES: Record<RoomStatus, string> = {
  VACANT: 'Disponible',
  OCCUPIED: 'Ocupada',
  OVERTIME: 'Tiempo Excedido',
  DIRTY: 'Por Limpiar',
  MAINTENANCE: 'Mantenimiento',
  RESERVED: 'En Camino'
};

const RoomCard = ({ room, booking, onClick }: { room: Room, booking?: Booking, onClick: () => void }) => {
  const { isOvertime, remainingOrOvertimeFormatted } = useTimer(booking?.checkInDate || new Date().toISOString(), room.duration);
  
  const displayStatus = (room.status === 'OCCUPIED' && isOvertime) ? 'OVERTIME' : room.status;

  let cardStyles = '';
  let badgeStyles = '';

  switch (displayStatus) {
    case 'VACANT':
      cardStyles = 'bg-white text-black border border-black/20 hover:border-black';
      badgeStyles = 'bg-black/5 text-black';
      break;
    case 'OCCUPIED':
      cardStyles = 'bg-black text-white border border-black';
      badgeStyles = 'bg-white/20 text-white';
      break;
    case 'OVERTIME':
      cardStyles = 'bg-black text-white border border-black';
      badgeStyles = 'bg-white text-black animate-pulse';
      break;
    case 'DIRTY':
      cardStyles = 'bg-white text-black border border-black/20 border-dashed opacity-75';
      badgeStyles = 'bg-black/5 text-black';
      break;
    case 'MAINTENANCE':
      cardStyles = 'bg-[#f5f5f7] text-black border border-black/10';
      badgeStyles = 'bg-black/5 text-black';
      break;
    case 'RESERVED':
      cardStyles = 'bg-yellow-50 text-yellow-900 border border-yellow-200 hover:border-yellow-400';
      badgeStyles = 'bg-yellow-200 text-yellow-900';
      break;
  }

  return (
    <div onClick={onClick} className={`p-6 rounded-3xl cursor-pointer transition-all hover:shadow-sm flex flex-col justify-between h-44 relative overflow-hidden ${cardStyles}`}>
      <div className="flex justify-between items-start">
        <span className="text-3xl font-bold tracking-tight">{room.number}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${badgeStyles}`}>
          {STATUS_ES[displayStatus as RoomStatus]}
        </span>
      </div>
      <div>
        <p className="font-medium opacity-90 text-sm">{room.type}</p>
        {booking && booking.status === 'ACTIVE' && (
          <div className={`mt-3 flex items-center space-x-2 px-3 py-1.5 rounded-xl w-fit ${displayStatus === 'OVERTIME' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
            <span className="font-mono font-bold">
              {isOvertime ? '+' : '-'}{remainingOrOvertimeFormatted}
            </span>
          </div>
        )}
        {booking && booking.status === 'PENDING_ARRIVAL' && (
          <div className="mt-3 flex items-center space-x-2 px-3 py-1.5 rounded-xl w-fit bg-yellow-200/50 text-yellow-900">
            <span className="font-bold text-sm">~{booking.eta} min</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'rooms' | 'reservations'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  const loadData = async () => {
    const r = await api.getRooms();
    const b = await api.getActiveBookings();
    const res = await api.getReservations();
    setRooms(r);
    setBookings(b);
    setReservations(res);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setActiveBooking(bookings.find(b => b.roomId === room.id) || null);
  };

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    await api.updateRoomStatus(roomId, newStatus);
    setSelectedRoom(null);
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 md:p-10 font-sans text-[#1d1d1f]">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center space-x-5">
          <button onClick={onBack} className="p-3 bg-white border border-black/10 rounded-full shadow-sm hover:bg-gray-50 transition-all text-black">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black">Recepción</h1>
            <p className="text-gray-500 font-medium text-lg">Control de Habitaciones y Reservas</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white p-1 rounded-full border border-black/10 shadow-sm flex">
            <button 
              onClick={() => setView('rooms')} 
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${view === 'rooms' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
            >
              Habitaciones
            </button>
            <button 
              onClick={() => setView('reservations')} 
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${view === 'reservations' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
            >
              Agendadas
            </button>
          </div>
          <button onClick={loadData} className="p-3 bg-white border border-black/10 rounded-full shadow-sm hover:bg-gray-50 transition-all text-black" title="Actualizar">
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {view === 'rooms' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {rooms.map(room => (
            <RoomCard 
              key={room.id} 
              room={room} 
              booking={bookings.find(b => b.roomId === room.id)} 
              onClick={() => handleRoomClick(room)} 
            />
          ))}
        </div>
      ) : (
        <ReservationsList reservations={reservations} rooms={rooms} onUpdate={loadData} />
      )}

      {selectedRoom && activeBooking && activeBooking.status === 'PENDING_ARRIVAL' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedRoom(null)} className="absolute top-6 right-6 p-2 text-black hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2 mt-2">Habitación {selectedRoom.number}</h2>
            <p className="text-gray-500 font-medium mb-6">El huésped {activeBooking.guest.name} está en camino.</p>
            
            <div className="space-y-3 mb-8 text-left">
              <button 
                onClick={async () => {
                  await api.confirmArrival(activeBooking.id, selectedRoom.id);
                  setSelectedRoom(null);
                  loadData();
                }}
                className="w-full py-4 px-5 bg-black text-white font-medium rounded-2xl hover:bg-gray-900 transition-all flex justify-center items-center space-x-2 shadow-md"
              >
                <CheckCircle size={20} />
                <span>Confirmar Llegada (Iniciar Tiempo)</span>
              </button>
              <button 
                onClick={async () => {
                  await api.cancelBooking(activeBooking.id, selectedRoom.id);
                  setSelectedRoom(null);
                  loadData();
                }}
                className="w-full py-4 px-5 bg-red-50 text-red-600 font-medium rounded-2xl hover:bg-red-100 transition-all flex justify-center items-center space-x-2"
              >
                <X size={20} />
                <span>Cancelar Reserva</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRoom && activeBooking && activeBooking.status === 'ACTIVE' && (
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedRoom(null)} className="absolute top-6 right-6 p-2 text-black hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-black mb-2 mt-2">Habitación {selectedRoom.number}</h2>
            <p className="text-gray-500 font-medium mb-6">Estado actual: <span className="text-black font-bold">{STATUS_ES[selectedRoom.status as RoomStatus]}</span></p>
            
            <div className="space-y-3 mb-8 text-left">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cambiar estado a:</h3>
              {['VACANT', 'DIRTY', 'MAINTENANCE'].map((status) => {
                if (status === selectedRoom.status) return null;
                return (
                  <button 
                    key={status}
                    onClick={() => handleStatusChange(selectedRoom.id, status as RoomStatus)}
                    className="w-full py-4 px-5 bg-white border border-black/10 text-black font-medium rounded-2xl hover:border-black hover:shadow-sm transition-all flex justify-between items-center group"
                  >
                    <span>{STATUS_ES[status as RoomStatus]}</span>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-black transition-colors" />
                  </button>
                );
              })}
            </div>

            <button onClick={() => setSelectedRoom(null)} className="w-full py-4 bg-black text-white font-medium rounded-2xl hover:bg-gray-900 transition-colors">Cerrar</button>
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-black hover:bg-gray-100 rounded-full transition-colors z-10">
          <X size={24} />
        </button>
        
        <div className="p-6 md:p-8 border-b border-black/5 shrink-0">
          <h2 className="text-2xl font-bold text-black mb-1 pr-8">Salida Hab. {room.number}</h2>
          <p className="text-gray-500 font-medium">Huésped: {booking.guest.name}</p>
        </div>
        
        <div className="p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1 hide-scrollbar">
          {booking.guest.ciInDeposit && (
            <div className="bg-black text-white p-5 rounded-2xl flex items-start space-x-4 shadow-sm">
              <AlertTriangle className="shrink-0 mt-0.5" size={24} />
              <div>
                <p className="font-bold text-lg">CI en Depósito</p>
                <p className="text-sm opacity-80 font-medium">Devolver el carnet de identidad al huésped.</p>
              </div>
            </div>
          )}

          <div className="bg-[#f5f5f7] p-6 rounded-3xl border border-black/5 shrink-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total a cobrar</p>
            <p className="text-5xl font-bold text-black tracking-tight">Bs. {currentTotal.toFixed(2)}</p>
          </div>

          <div className="space-y-3 shrink-0">
            <h3 className="font-bold text-black uppercase tracking-wider text-xs mb-3">Validación de Entrega</h3>
            
            <ChecklistItem icon={Key} label="Llave entregada" checked={checks.key} onChange={(v: boolean) => setChecks({...checks, key: v})} />
            <ChecklistItem icon={Wind} label="Control AC entregado" checked={checks.ac} onChange={(v: boolean) => setChecks({...checks, ac: v})} />
            <ChecklistItem icon={Tv} label="Control TV entregado" checked={checks.tv} onChange={(v: boolean) => setChecks({...checks, tv: v})} />
            <ChecklistItem icon={CreditCard} label="CI devuelto al huésped" checked={checks.ci} onChange={(v: boolean) => setChecks({...checks, ci: v})} />
          </div>
        </div>

        <div className="p-6 md:p-8 bg-white border-t border-black/5 shrink-0">
          <button 
            disabled={!allChecked} 
            onClick={onCheckout} 
            className="w-full py-4 bg-black disabled:bg-gray-100 disabled:text-gray-400 text-white font-medium rounded-2xl hover:bg-gray-900 transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle size={20} />
            <span>Finalizar Estancia</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ icon: Icon, label, checked, onChange }: any) {
  return (
    <div onClick={() => onChange(!checked)} className={`flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all border ${checked ? 'bg-black text-white border-black' : 'bg-white text-black border-black/20 hover:border-black/40'}`}>
      <div className={`flex items-center justify-center w-6 h-6 rounded-full border transition-colors ${checked ? 'border-white bg-white text-black' : 'border-black/30'}`}>
        {checked && <Check size={14} strokeWidth={3} />}
      </div>
      <div className="flex items-center space-x-3">
        <Icon size={20} className={checked ? 'text-white' : 'text-gray-500'} />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
}

function ReservationsList({ reservations, rooms, onUpdate }: { reservations: Reservation[], rooms: Room[], onUpdate: () => void }) {
  const handleStatusChange = async (id: string, status: Reservation['status']) => {
    await api.updateReservationStatus(id, status);
    onUpdate();
  };

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-12 text-center border border-black/5 shadow-sm">
        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-black mb-2">No hay reservas agendadas</h3>
        <p className="text-gray-500">Las reservas futuras aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()).map(res => {
        const room = rooms.find(r => r.id === res.roomId);
        if (!room) return null;

        return (
          <div key={res.id} className="bg-white p-6 rounded-3xl border border-black/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h3 className="font-bold text-xl text-black">Habitación {room.number}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  res.status === 'FULFILLED' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {res.status === 'PENDING' ? 'Pendiente' :
                   res.status === 'CONFIRMED' ? 'Confirmada' :
                   res.status === 'FULFILLED' ? 'Completada' : 'Cancelada'}
                </span>
              </div>
              <p className="text-gray-500 font-medium">Fecha: <span className="text-black">{res.date}</span> a las <span className="text-black">{res.time}</span></p>
              <div className="text-sm text-gray-500">
                <p>Huéspedes (CI): {res.guestCIs.join(', ')}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {res.status === 'PENDING' && (
                <>
                  <button onClick={() => handleStatusChange(res.id, 'CONFIRMED')} className="px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-colors">Confirmar</button>
                  <button onClick={() => handleStatusChange(res.id, 'CANCELLED')} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors">Cancelar</button>
                </>
              )}
              {res.status === 'CONFIRMED' && (
                <>
                  <button onClick={() => handleStatusChange(res.id, 'FULFILLED')} className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors">Marcar Completada</button>
                  <button onClick={() => handleStatusChange(res.id, 'CANCELLED')} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors">Cancelar</button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
