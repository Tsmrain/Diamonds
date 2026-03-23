package com.diamonds.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String number;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType type;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer duration; // en horas

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    private String image;

    @ElementCollection
    private List<String> amenities;

    public enum RoomType {
        ESTANDAR, VIP, SUPERVIP
    }

    public enum RoomStatus {
        VACANT, OCCUPIED, OVERTIME, DIRTY, MAINTENANCE, RESERVED
    }
}
