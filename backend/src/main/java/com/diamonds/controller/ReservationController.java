package com.diamonds.controller;

import com.diamonds.model.Reservation;
import com.diamonds.model.Room;
import com.diamonds.repository.ReservationRepository;
import com.diamonds.repository.RoomRepository;
import com.diamonds.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationRepository repository;
    private final BookingService bookingService;
    private final RoomRepository roomRepository;

    @GetMapping
    public List<Reservation> getAllReservations() {
        return repository.findAll();
    }

    @PostMapping
    public Reservation createReservation(@RequestBody Reservation reservationData) {
        Room room = roomRepository.findById(reservationData.getRoomId()).orElseThrow();
        
        // Business validation
        LocalDateTime requestedStart = LocalDateTime.of(reservationData.getDate(), reservationData.getTime());
        if (!bookingService.isRoomAvailable(room.getId(), requestedStart, room.getDuration())) {
            throw new RuntimeException("Habitación no disponible para este horario.");
        }

        reservationData.setId(null);
        reservationData.setStatus(Reservation.ReservationStatus.PENDING);
        reservationData.setCreatedAt(LocalDateTime.now());
        
        return repository.save(reservationData);
    }

    @PatchMapping("/{id}/status")
    public Reservation updateStatus(@PathVariable("id") String id, @RequestBody Reservation.ReservationStatus status) {
        Reservation reservation = repository.findById(id).orElseThrow();
        reservation.setStatus(status);
        return repository.save(reservation);
    }
}
