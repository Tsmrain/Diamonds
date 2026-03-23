package com.diamonds.controller;

import com.diamonds.model.Room;
import com.diamonds.repository.RoomRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RoomControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        roomRepository.deleteAll();
    }

    @Test
    void testGetAllRooms_ShouldReturnEmptyListInitially() throws Exception {
        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void testUpdateRoomStatus_ShouldChangeStatusInDatabase() throws Exception {
        Room room = Room.builder()
                .number("TEST101")
                .name("Test Room")
                .type(Room.RoomType.ESTANDAR)
                .price(50.0)
                .duration(6)
                .status(Room.RoomStatus.VACANT)
                .build();
        room = roomRepository.save(room);

        mockMvc.perform(patch("/api/rooms/" + room.getId() + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Room.RoomStatus.DIRTY)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DIRTY"));
    }
}
