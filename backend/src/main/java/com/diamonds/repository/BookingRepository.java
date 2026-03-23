package com.diamonds.repository;

import com.diamonds.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByStatusIn(List<Booking.BookingStatus> statuses);
    
    // Búsqueda de reservas activas o en camino por CI del huésped principal
    List<Booking> findByGuestCi(String ci);
    
    // Búsqueda de estancias por habitación
    List<Booking> findByRoomIdAndStatusIn(String roomId, List<Booking.BookingStatus> statuses);
}
