package com.diamonds.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String roomId;

    @Embedded
    private Guest guest;

    @Column(nullable = false)
    private LocalDateTime checkInDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    private Integer eta; // Estimated time of arrival in minutes

    @Embedded
    private BookingAssets assets;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingAssets {
        @Builder.Default private boolean keyReturned = false;
        @Builder.Default private boolean acRemoteReturned = false;
        @Builder.Default private boolean tvRemoteReturned = false;
        @Builder.Default private boolean ciReturned = false;
    }

    public enum BookingStatus {
        PENDING_ARRIVAL, ACTIVE, COMPLETED, CANCELLED
    }
}
