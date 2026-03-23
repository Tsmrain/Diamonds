import { api } from './api';
import { Room, Reservation, Booking } from '../core/domain';

export class BookingService {
  private static CLEANING_BUFFER_MINUTES = 30;

  /**
   * Comprueba si una habitación está disponible para un rango de tiempo específico.
   * Considera Reservas en curso, Reservas programadas y tiempo de limpieza.
   */
  static async isRoomAvailable(
    roomId: string, 
    requestedStart: Date, 
    durationHours: number
  ): Promise<{ available: boolean; reason?: string }> {
    const rooms = await api.getRooms();
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) return { available: false, reason: 'La habitación no existe.' };
    if (room.status === 'MAINTENANCE') return { available: false, reason: 'La habitación está en mantenimiento.' };

    const requestedEnd = new Date(requestedStart.getTime() + durationHours * 60 * 60 * 1000);
    const requestedEndWithBuffer = new Date(requestedEnd.getTime() + this.CLEANING_BUFFER_MINUTES * 60 * 1000);
    const requestedStartWithBuffer = new Date(requestedStart.getTime() - this.CLEANING_BUFFER_MINUTES * 60 * 1000);

    // 1. Verificar choques con Reservas Programadas
    const allReservations = await api.getReservations();
    const overlappingReservation = allReservations.find(res => {
      if (res.roomId !== roomId) return false;
      if (res.status === 'CANCELLED' || res.status === 'FULFILLED') return false;

      const resStart = new Date(`${res.date}T${res.time}`);
      // Asumimos que todas las estancias duran lo que indica la habitación
      const resEnd = new Date(resStart.getTime() + room.duration * 60 * 60 * 1000);
      
      // Para que no haya choque:
      // El fin de la reserva existente + buffer debe ser antes del inicio pedido
      // O el fin pedido + buffer debe ser antes del inicio de la reserva existente
      const resEndWithBuffer = new Date(resEnd.getTime() + this.CLEANING_BUFFER_MINUTES * 60 * 1000);
      const requestedEndWithBuffer = new Date(requestedEnd.getTime() + this.CLEANING_BUFFER_MINUTES * 60 * 1000);

      const overlaps = requestedStart < resEndWithBuffer && requestedEndWithBuffer > resStart;
      return overlaps;
    });

    if (overlappingReservation) {
      return { 
        available: false, 
        reason: `Choca con una reserva programada (${overlappingReservation.time}).` 
      };
    }

    // 2. Verificar choques con Ocupaciones Actuales (Bookings Activos)
    const activeBookings = await api.getActiveBookings();
    const currentBooking = activeBookings.find(b => b.roomId === roomId);

    if (currentBooking) {
      const bookingStart = new Date(currentBooking.checkInDate);
      const bookingEnd = new Date(bookingStart.getTime() + room.duration * 60 * 60 * 1000);
      const bookingEndWithBuffer = new Date(bookingEnd.getTime() + this.CLEANING_BUFFER_MINUTES * 60 * 1000);

      if (requestedStart < bookingEndWithBuffer) {
        return { 
          available: false, 
          reason: 'La habitación está actualmente ocupada o en proceso de limpieza.' 
        };
      }
    }

    return { available: true };
  }

  /**
   * Obtiene todas las habitaciones disponibles para un momento dado de duración X.
   */
  static async getAvailableRoomsForPeriod(date: string, time: string): Promise<Room[]> {
    const allRooms = await api.getRooms();
    const requestedStart = new Date(`${date}T${time}`);
    
    const availabilityResults = await Promise.all(
      allRooms.map(async room => {
        const result = await this.isRoomAvailable(room.id, requestedStart, room.duration);
        return { room, available: result.available };
      })
    );

    return availabilityResults
      .filter(res => res.available)
      .map(res => res.room);
  }
}
