export type RoomStatus = 'VACANT' | 'OCCUPIED' | 'OVERTIME' | 'DIRTY' | 'MAINTENANCE';

export interface Room {
  id: string;
  number: string;
  name: string;
  type: 'ESTANDAR' | 'VIP' | 'SUPERVIP';
  price: number;
  duration: number; // en horas
  status: RoomStatus;
}

export interface Guest {
  ci: string;
  name: string;
  phone?: string;
  ciInDeposit: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  guest: Guest;
  checkInDate: string; // ISO string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  assets: {
    keyReturned: boolean;
    acRemoteReturned: boolean;
    tvRemoteReturned: boolean;
    ciReturned: boolean;
  };
}
