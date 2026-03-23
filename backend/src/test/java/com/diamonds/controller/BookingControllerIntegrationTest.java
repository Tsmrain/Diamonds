package com.diamonds.controller;

import com.diamonds.model.Booking;
import com.diamonds.model.Room;
import com.diamonds.repository.BookingRepository;
import com.diamonds.repository.RoomRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Room testRoom;

    @BeforeEach
    void setup() {
        bookingRepository.deleteAll();
        roomRepository.deleteAll();
        
        testRoom = Room.builder()
                .number("TEST-B1")
                .name("Room B1")
                .type(Room.RoomType.ESTANDAR)
                .price(50.0)
                .duration(6)
                .status(Room.RoomStatus.VACANT)
                .build();
        testRoom = roomRepository.save(testRoom);
    }

    @Test
    void testCreateBooking_Success() throws Exception {
        Booking bookingRequest = Booking.builder()
                .roomId(testRoom.getId())
                .guest(com.diamonds.model.Guest.builder().ci("111").name("Ana").build())
                .eta(0)
                .status(Booking.BookingStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.guest.name").value("Ana"));
    }

    @Test
    void testCreateBooking_FailsWhenOccupied() throws Exception {
        // Primero ocupamos la habitación
        Booking active = Booking.builder()
                .roomId(testRoom.getId())
                .guest(com.diamonds.model.Guest.builder().ci("222").name("Leo").build())
                .checkInDate(LocalDateTime.now())
                .status(Booking.BookingStatus.ACTIVE)
                .build();
        bookingRepository.save(active);

        // Intentamos crear otra encima
        Booking failRequest = Booking.builder()
                .roomId(testRoom.getId())
                .guest(com.diamonds.model.Guest.builder().ci("333").name("Mario").build())
                .eta(0)
                .status(Booking.BookingStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(failRequest)))
                .andExpect(status().isInternalServerError()); // "Habitación no disponible" RuntimeException
    }
}
