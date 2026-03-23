import React, { useEffect, useState } from 'react';
import { Room, Booking, RoomStatus, Reservation } from '../../core/domain';
import { api } from '../../services/api';
import { ChevronLeft, RefreshCw, X, Clock, CheckCircle, Settings } from 'lucide-react';

// Nuevos componentes para alta cohesión
import { RoomCard } from '../../components/admin/RoomCard';
import { CheckoutModal } from '../../components/admin/CheckoutModal';
import { ReservationsList } from '../../components/admin/ReservationsList';
import { ManageRooms } from '../../components/admin/ManageRooms';

const STATUS_ES: Record<RoomStatus, string> = {
  VACANT: 'Disponible',
  OCCUPIED: 'Ocupada',
  OVERTIME: 'Tiempo Excedido',
  DIRTY: 'Por Limpiar',
  MAINTENANCE: 'Mantenimiento',
  RESERVED: 'En Camino'
};

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'rooms' | 'reservations' | 'manage'>('rooms');
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

  const renderContent = () => {
    switch (view) {
      case 'rooms':
        return (
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
        );
      case 'reservations':
        return <ReservationsList reservations={reservations} rooms={rooms} onUpdate={loadData} />;
      case 'manage':
        return <ManageRooms onUpdate={loadData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 md:p-10 font-sans text-[#1d1d1f]">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center space-x-5">
          <button onClick={onBack} className="p-3 bg-white border border-black/10 rounded-full shadow-sm hover:bg-gray-50 transition-all text-black">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black">Diamonds</h1>
            <p className="text-gray-500 font-medium text-lg">Panel de Administración</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white p-1 rounded-full border border-black/10 shadow-sm flex overflow-hidden">
            <TabButton active={view === 'rooms'} onClick={() => setView('rooms')} label="Estado" />
            <TabButton active={view === 'reservations'} onClick={() => setView('reservations')} label="Agendas" />
            <TabButton active={view === 'manage'} onClick={() => setView('manage')} label="Gestionar" icon={<Settings size={14} />} />
          </div>
          <button onClick={loadData} className="p-3 bg-white border border-black/10 rounded-full shadow-sm hover:bg-gray-50 transition-all text-black" title="Actualizar">
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {renderContent()}

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
                <span>Confirmar Llegada</span>
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
                <span>Cancelar con Multa</span>
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
                    <X size={20} className="text-gray-300 group-hover:text-black transition-colors" />
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

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center space-x-2 ${active ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
