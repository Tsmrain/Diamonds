package com.diamonds.repository;

import com.diamonds.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
    List<Reservation> findByStatusIn(List<Reservation.ReservationStatus> statuses);
    
    // Búsqueda de reservas futuras por habitación
    List<Reservation> findByRoomIdAndStatusIn(String roomId, List<Reservation.ReservationStatus> statuses);
    
    @Query("SELECT r FROM Reservation r JOIN r.guestCIs g WHERE g = :ci")
    List<Reservation> findByGuestCi(String ci);
}
