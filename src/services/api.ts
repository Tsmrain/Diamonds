import { Booking, Room } from '../core/domain';
import { INITIAL_ROOMS } from '../core/constants';

export interface IBookingRepository {
  getRooms(): Promise<Room[]>;
  updateRoomStatus(roomId: string, status: Room['status']): Promise<void>;
  getActiveBookings(): Promise<Booking[]>;
  checkout(bookingId: string): Promise<void>;
}

// Mock inicial para las habitaciones ocupadas
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    roomId: '2',
    guest: { ci: '1234567', name: 'Juan Pérez', ciInDeposit: true },
    checkInDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // Hace 2 horas
    status: 'ACTIVE',
    assets: { keyReturned: false, acRemoteReturned: false, tvRemoteReturned: false, ciReturned: false }
  },
  {
    id: 'b2',
    roomId: '3',
    guest: { ci: '7654321', name: 'María Gómez', ciInDeposit: true },
    checkInDate: new Date(Date.now() - 7 * 3600 * 1000).toISOString(), // Hace 7 horas (Overtime para una de 6h)
    status: 'ACTIVE',
    assets: { keyReturned: false, acRemoteReturned: false, tvRemoteReturned: false, ciReturned: false }
  }
];

export class LocalStorageRepository implements IBookingRepository {
  async getRooms(): Promise<Room[]> {
    const stored = localStorage.getItem('diamonds_rooms');
    if (!stored) {
      localStorage.setItem('diamonds_rooms', JSON.stringify(INITIAL_ROOMS));
      return INITIAL_ROOMS;
    }
    return JSON.parse(stored);
  }

  async updateRoomStatus(roomId: string, status: Room['status']): Promise<void> {
    const rooms = await this.getRooms();
    const updated = rooms.map(r => r.id === roomId ? { ...r, status } : r);
    localStorage.setItem('diamonds_rooms', JSON.stringify(updated));
  }

  async getActiveBookings(): Promise<Booking[]> {
    const stored = localStorage.getItem('diamonds_bookings');
    if (!stored) {
      localStorage.setItem('diamonds_bookings', JSON.stringify(MOCK_BOOKINGS));
      return MOCK_BOOKINGS;
    }
    return JSON.parse(stored).filter((b: Booking) => b.status === 'ACTIVE');
  }

  async checkout(bookingId: string): Promise<void> {
    const stored = localStorage.getItem('diamonds_bookings');
    if (stored) {
      const bookings: Booking[] = JSON.parse(stored);
      const updated = bookings.map(b => b.id === bookingId ? { ...b, status: 'COMPLETED' as const } : b);
      localStorage.setItem('diamonds_bookings', JSON.stringify(updated));
    }
  }
}

export const api = new LocalStorageRepository();
