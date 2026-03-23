import React from 'react';
import { Reservation, Room } from '../../core/domain';
import { api } from '../../services/api';
import { Calendar } from 'lucide-react';

export function ReservationsList({ reservations, rooms, onUpdate }: { reservations: Reservation[], rooms: Room[], onUpdate: () => void }) {
  const handleStatusChange = async (id: string, status: Reservation['status']) => {
    await api.updateReservationStatus(id, status);
    onUpdate();
  };

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-12 text-center border border-black/5 shadow-sm">
        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-black mb-2">No hay reservas agendadas</h3>
        <p className="text-gray-500">Las reservas aparecerán aquí.</p>
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
              <div className="text-sm text-gray-500"><p>Huéspedes (CI): {res.guestCIs.join(', ')}</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {res.status === 'PENDING' && (
                <>
                  <button onClick={() => handleStatusChange(res.id, 'CONFIRMED')} className="px-4 py-2 bg-black text-white rounded-xl font-medium">Confirmar</button>
                  <button onClick={() => handleStatusChange(res.id, 'CANCELLED')} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium">Cancelar</button>
                </>
              )}
              {res.status === 'CONFIRMED' && (
                <>
                  <button onClick={() => handleStatusChange(res.id, 'FULFILLED')} className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-medium">Completada</button>
                  <button onClick={() => handleStatusChange(res.id, 'CANCELLED')} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium">Cancelar</button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
