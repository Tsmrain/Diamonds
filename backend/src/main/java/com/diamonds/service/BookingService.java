package com.diamonds.service;

import com.diamonds.model.Booking;
import com.diamonds.model.Reservation;
import com.diamonds.model.Room;
import com.diamonds.repository.BookingRepository;
import com.diamonds.repository.ReservationRepository;
import com.diamonds.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final ReservationRepository reservationRepository;

    private static final int CLEANING_BUFFER_MINUTES = 30;

    @Transactional(readOnly = true)
    public boolean isRoomAvailable(String roomId, LocalDateTime requestedStart, int durationHours) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (roomOpt.isEmpty()) return false;
        Room room = roomOpt.get();

        if (room.getStatus() == Room.RoomStatus.MAINTENANCE) return false;

        LocalDateTime requestedEndWithBuffer = requestedStart.plusHours(durationHours).plusMinutes(CLEANING_BUFFER_MINUTES);

        // 1. Check current active bookings
        List<Booking> activeBookings = bookingRepository.findByRoomIdAndStatusIn(
                roomId, 
                Arrays.asList(Booking.BookingStatus.ACTIVE, Booking.BookingStatus.PENDING_ARRIVAL)
        );

        for (Booking b : activeBookings) {
            LocalDateTime bStart = b.getCheckInDate();
            LocalDateTime bEndWithBuffer = bStart.plusHours(room.getDuration()).plusMinutes(CLEANING_BUFFER_MINUTES);
            
            if (requestedStart.isBefore(bEndWithBuffer) && requestedEndWithBuffer.isAfter(bStart)) {
                return false;
            }
        }

        // 2. Check future reservations
        List<Reservation> futureReservations = reservationRepository.findByRoomIdAndStatusIn(
                roomId, 
                Arrays.asList(Reservation.ReservationStatus.PENDING, Reservation.ReservationStatus.CONFIRMED)
        );

        for (Reservation r : futureReservations) {
            LocalDateTime rStart = LocalDateTime.of(r.getDate(), r.getTime());
            LocalDateTime rEndWithBuffer = rStart.plusHours(room.getDuration()).plusMinutes(CLEANING_BUFFER_MINUTES);

            if (requestedStart.isBefore(rEndWithBuffer) && requestedEndWithBuffer.isAfter(rStart)) {
                return false;
            }
        }

        return true;
    }

    @Transactional(readOnly = true)
    public List<Room> getAvailableRoomsForPeriod(LocalDateTime start, int durationHours) {
        List<Room> allRooms = roomRepository.findAll();
        return allRooms.stream()
                .filter(room -> isRoomAvailable(room.getId(), start, durationHours))
                .toList();
    }

    @Transactional
    public Booking createImmediateBooking(String roomId, Room.RoomStatus roomStatus, String ci, String name, int eta) {
        if (!isRoomAvailable(roomId, LocalDateTime.now(), 1)) { // Refinar duracion?
            throw new RuntimeException("Habitación no disponible.");
        }

        Booking booking = Booking.builder()
                .roomId(roomId)
                .guest(com.diamonds.model.Guest.builder().ci(ci).name(name).build())
                .checkInDate(LocalDateTime.now())
                .status(eta > 0 ? Booking.BookingStatus.PENDING_ARRIVAL : Booking.BookingStatus.ACTIVE)
                .eta(eta)
                .build();

        // Update room status
        Room room = roomRepository.findById(roomId).orElseThrow();
        room.setStatus(eta > 0 ? Room.RoomStatus.RESERVED : Room.RoomStatus.OCCUPIED);
        roomRepository.save(room);

        return bookingRepository.save(booking);
    }
}
