export type RoomStatus = 'VACANT' | 'OCCUPIED' | 'OVERTIME' | 'DIRTY' | 'MAINTENANCE' | 'RESERVED';

export interface Room {
  id: string;
  number: string;
  name: string;
  type: 'ESTANDAR' | 'VIP' | 'SUPERVIP';
  price: number;
  duration: number; // en horas
  status: RoomStatus;
  image?: string;
  amenities?: string[];
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
  status: 'PENDING_ARRIVAL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  eta?: number; // Estimated time of arrival in minutes
  assets: {
    keyReturned: boolean;
    acRemoteReturned: boolean;
    tvRemoteReturned: boolean;
    ciReturned: boolean;
  };
}

export interface Reservation {
  id: string;
  roomId: string;
  guestCIs: string[]; // Carnets de identidad de los clientes
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FULFILLED';
  createdAt: string; // ISO string
}
