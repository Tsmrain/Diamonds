import React, { useEffect, useState } from 'react';
import { Room, Booking, RoomStatus } from '../../core/domain';
import { useTimer } from '../../hooks/useTimer';

const STATUS_ES: Record<RoomStatus, string> = {
  VACANT: 'Disponible',
  OCCUPIED: 'Ocupada',
  OVERTIME: 'Tiempo Excedido',
  DIRTY: 'Por Limpiar',
  MAINTENANCE: 'Mantenimiento',
  RESERVED: 'En Camino'
};

interface RoomCardProps {
  room: Room;
  booking?: Booking;
  onClick: () => void;
}

export function RoomCard({ room, booking, onClick }: RoomCardProps) {
  const { isOvertime, remainingOrOvertimeFormatted } = useTimer(
    booking?.checkInDate || new Date().toISOString(), 
    room.duration
  );
  
  const displayStatus = (room.status === 'OCCUPIED' && isOvertime) ? 'OVERTIME' : room.status as RoomStatus;

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
          {STATUS_ES[displayStatus]}
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
}
