import { Booking, Room, Reservation } from '../core/domain';

export interface IBookingRepository {
  getRooms(): Promise<Room[]>;
  updateRoomStatus(roomId: string, status: Room['status']): Promise<void>;
  getActiveBookings(): Promise<Booking[]>;
  checkout(bookingId: string): Promise<void>;
  createBooking(bookingData: Omit<Booking, 'id' | 'assets'>): Promise<void>;
  getBookingsByGuest(ci: string): Promise<Booking[]>;
  confirmArrival(bookingId: string, roomId: string): Promise<void>;
  cancelBooking(bookingId: string, roomId: string): Promise<void>;
  
  // Reservations
  getReservations(): Promise<Reservation[]>;
  createReservation(reservationData: Omit<Reservation, 'id' | 'status' | 'createdAt'>): Promise<void>;
  updateReservationStatus(reservationId: string, status: Reservation['status']): Promise<void>;

  // Room CRUD
  createRoom(room: Partial<Room>): Promise<Room>;
  updateRoom(id: string, room: Partial<Room>): Promise<Room>;
  deleteRoom(id: string): Promise<void>;
  uploadRoomImage(file: File): Promise<string>;
}

const API_BASE_URL = 'http://localhost:8085/api';

export class SpringApiRepository implements IBookingRepository {
  private async apiFetch(endpoint: string, options: RequestInit = {}) {
    // Para multipart no queremos Content-Type: application/json
    const isMultipart = options.body instanceof FormData;
    
    const headers: Record<string, string> = { ...options.headers as any };
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (!res.ok) throw new Error(await res.text());
    if (res.status === 204 || options.method === 'DELETE') return;
    
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    return res.text();
  }

  async getRooms(): Promise<Room[]> {
    return this.apiFetch('/rooms');
  }

  async updateRoomStatus(roomId: string, status: Room['status']): Promise<void> {
    await this.apiFetch(`/rooms/${roomId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status)
    });
  }

  async getActiveBookings(): Promise<Booking[]> {
    return this.apiFetch('/bookings/active');
  }

  async checkout(bookingId: string): Promise<void> {
    await this.apiFetch(`/bookings/${bookingId}/checkout`, { method: 'POST' });
  }

  async createBooking(bookingData: Omit<Booking, 'id' | 'assets'>): Promise<void> {
    await this.apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async getBookingsByGuest(ci: string): Promise<Booking[]> {
    return this.apiFetch(`/bookings/guest/${ci}`);
  }

  async confirmArrival(bookingId: string, roomId: string): Promise<void> {
    await this.apiFetch(`/bookings/${bookingId}/confirm-arrival`, { method: 'POST' });
  }

  async cancelBooking(bookingId: string, roomId: string): Promise<void> {
    await this.apiFetch(`/bookings/${bookingId}/cancel`, { method: 'POST' });
  }

  // ROOM CRUD
  async createRoom(room: Partial<Room>): Promise<Room> {
    return this.apiFetch('/rooms', {
      method: 'POST',
      body: JSON.stringify({ ...room, status: room.status || 'VACANT' })
    });
  }

  async updateRoom(id: string, room: Partial<Room>): Promise<Room> {
    return this.apiFetch(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(room)
    });
  }

  async deleteRoom(id: string): Promise<void> {
    await this.apiFetch(`/rooms/${id}`, { method: 'DELETE' });
  }

  async uploadRoomImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiFetch('/rooms/upload-image', {
      method: 'POST',
      body: formData
    });
  }

  async getReservations(): Promise<Reservation[]> {
    return this.apiFetch('/reservations');
  }

  async createReservation(reservationData: Omit<Reservation, 'id' | 'status' | 'createdAt'>): Promise<void> {
    await this.apiFetch('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData)
    });
  }

  async updateReservationStatus(reservationId: string, status: Reservation['status']): Promise<void> {
    await this.apiFetch(`/reservations/${reservationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status)
    });
  }
}

export const api = new SpringApiRepository();
