package com.diamonds.service;

import com.diamonds.model.Booking;
import com.diamonds.model.Reservation;
import com.diamonds.model.Room;
import com.diamonds.repository.BookingRepository;
import com.diamonds.repository.ReservationRepository;
import com.diamonds.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class BookingServiceTest {

    @Mock
    private RoomRepository roomRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private BookingService bookingService;

    private Room mockRoom;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockRoom = Room.builder()
                .id("room1")
                .number("101")
                .duration(6)
                .status(Room.RoomStatus.VACANT)
                .build();
        
        when(roomRepository.findById("room1")).thenReturn(Optional.of(mockRoom));
    }

    @Test
    void testIsRoomAvailable_WhenNoConflicts_ShouldReturnTrue() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        when(bookingRepository.findByRoomIdAndStatusIn(eq("room1"), anyList())).thenReturn(Collections.emptyList());
        when(reservationRepository.findByRoomIdAndStatusIn(eq("room1"), anyList())).thenReturn(Collections.emptyList());
        assertTrue(bookingService.isRoomAvailable("room1", start, 6));
    }

    @Test
    void testIsRoomAvailable_WhenConflictWithActiveBooking_ShouldReturnFalse() {
        LocalDateTime requestedStart = LocalDateTime.now().plusHours(2);
        Booking activeBooking = Booking.builder()
                .roomId("room1")
                .checkInDate(LocalDateTime.now().minusHours(2))
                .status(Booking.BookingStatus.ACTIVE)
                .build();

        when(bookingRepository.findByRoomIdAndStatusIn(eq("room1"), anyList()))
                .thenReturn(Collections.singletonList(activeBooking));
        when(reservationRepository.findByRoomIdAndStatusIn(eq("room1"), anyList()))
                .thenReturn(Collections.emptyList());

        assertFalse(bookingService.isRoomAvailable("room1", requestedStart, 6));
    }

    @Test
    void testIsRoomAvailable_WhenConflictWithReservation_ShouldReturnFalse() {
        LocalDateTime requestedStart = LocalDateTime.now().plusHours(10);
        LocalDateTime resStart = LocalDateTime.now().plusHours(11);
        Reservation reservation = Reservation.builder()
                .roomId("room1")
                .date(resStart.toLocalDate())
                .time(resStart.toLocalTime())
                .status(Reservation.ReservationStatus.PENDING)
                .build();

        when(bookingRepository.findByRoomIdAndStatusIn(eq("room1"), anyList()))
                .thenReturn(Collections.emptyList());
        when(reservationRepository.findByRoomIdAndStatusIn(eq("room1"), anyList()))
                .thenReturn(Collections.singletonList(reservation));

        assertFalse(bookingService.isRoomAvailable("room1", requestedStart, 6));
    }

    @Test
    void testIsRoomAvailable_RespectsCleaningBuffer() {
        LocalDateTime resStart = LocalDateTime.now().plusHours(2);
        Reservation expRes = Reservation.builder()
                .roomId("room1")
                .date(resStart.toLocalDate())
                .time(resStart.toLocalTime())
                .status(Reservation.ReservationStatus.PENDING)
                .build();

        when(reservationRepository.findByRoomIdAndStatusIn(eq("room1"), anyList()))
                .thenReturn(Collections.singletonList(expRes));

        LocalDateTime requestedStart = LocalDateTime.now().plusHours(8).plusMinutes(15);
        assertFalse(bookingService.isRoomAvailable("room1", requestedStart, 6));
    }
}
