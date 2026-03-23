package com.diamonds.controller;

import com.diamonds.model.Room;
import com.diamonds.repository.RoomRepository;
import com.diamonds.service.BookingService;
import com.diamonds.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomRepository roomRepository;
    private final BookingService bookingService;
    private final ImageService imageService;

    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @PostMapping
    public Room createRoom(@RequestBody Room room) {
        if (room.getId() == null) {
            room.setId(java.util.UUID.randomUUID().toString());
        }
        return roomRepository.save(room);
    }

    @PutMapping("/{id}")
    public Room updateRoom(@PathVariable("id") String id, @RequestBody Room roomDetails) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Habitación no encontrada"));
        
        room.setNumber(roomDetails.getNumber());
        room.setName(roomDetails.getName());
        room.setType(roomDetails.getType());
        room.setPrice(roomDetails.getPrice());
        room.setDuration(roomDetails.getDuration());
        room.setImage(roomDetails.getImage());
        room.setAmenities(roomDetails.getAmenities());
        room.setStatus(roomDetails.getStatus());
        return roomRepository.save(room);
    }

    @DeleteMapping("/{id}")
    public void deleteRoom(@PathVariable("id") String id) {
        if (!roomRepository.existsById(id)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Habitación no encontrada");
        }
        roomRepository.deleteById(id);
    }

    @PatchMapping("/{id}/status")
    public void updateStatus(@PathVariable("id") String id, @RequestBody Room.RoomStatus status) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Habitación no encontrada"));
        room.setStatus(status);
        roomRepository.save(room);
    }

    @GetMapping("/available-for-period")
    public List<Room> getAvailableRoomsForPeriod(@RequestParam String date, @RequestParam String time) {
        LocalDateTime start = LocalDateTime.of(LocalDate.parse(date), LocalTime.parse(time));
        return bookingService.getAvailableRoomsForPeriod(start, 3); // Valor por defecto de duración para búsqueda
    }

    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        String url = imageService.saveImage(file);
        return ResponseEntity.ok(url);
    }
}
