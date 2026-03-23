package com.diamonds.controller;

import com.diamonds.model.Booking;
import com.diamonds.model.Room;
import com.diamonds.repository.BookingRepository;
import com.diamonds.repository.RoomRepository;
import com.diamonds.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingRepository repository;
    private final BookingService bookingService;
    private final RoomRepository roomRepository;

    @GetMapping("/active")
    public List<Booking> getActiveBookings() {
        return repository.findByStatusIn(Arrays.asList(Booking.BookingStatus.ACTIVE, Booking.BookingStatus.PENDING_ARRIVAL));
    }

    @GetMapping("/guest/{ci}")
    public List<Booking> getByGuest(@PathVariable("ci") String ci) {
        return repository.findByGuestCi(ci);
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking bookingData) {
        Room room = roomRepository.findById(bookingData.getRoomId()).orElseThrow();
        
        // Validation using service
        if (!bookingService.isRoomAvailable(room.getId(), LocalDateTime.now(), room.getDuration())) {
            throw new RuntimeException("Habitación no disponible.");
        }

        bookingData.setId(null); // Ensure creation
        bookingData.setCheckInDate(LocalDateTime.now());
        bookingData.setAssets(new Booking.BookingAssets());
        
        // Update room status
        room.setStatus(bookingData.getEta() > 0 ? Room.RoomStatus.RESERVED : Room.RoomStatus.OCCUPIED);
        roomRepository.save(room);
        
        return repository.save(bookingData);
    }

    @PostMapping("/{id}/checkout")
    public void checkout(@PathVariable("id") String id) {
        Booking booking = repository.findById(id).orElseThrow();
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        repository.save(booking);
        
        Room room = roomRepository.findById(booking.getRoomId()).orElseThrow();
        room.setStatus(Room.RoomStatus.DIRTY);
        roomRepository.save(room);
    }

    @PostMapping("/{id}/cancel")
    public void cancel(@PathVariable("id") String id) {
        Booking booking = repository.findById(id).orElseThrow();
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        repository.save(booking);
        
        Room room = roomRepository.findById(booking.getRoomId()).orElseThrow();
        room.setStatus(Room.RoomStatus.VACANT);
        roomRepository.save(room);
    }

    @PostMapping("/{id}/confirm-arrival")
    public void confirmArrival(@PathVariable("id") String id) {
        Booking booking = repository.findById(id).orElseThrow();
        booking.setStatus(Booking.BookingStatus.ACTIVE);
        booking.setCheckInDate(LocalDateTime.now());
        repository.save(booking);
        
        Room room = roomRepository.findById(booking.getRoomId()).orElseThrow();
        room.setStatus(Room.RoomStatus.OCCUPIED);
        roomRepository.save(room);
    }
}
