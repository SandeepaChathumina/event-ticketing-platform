package com.ticketing.app.booking.repository;

import com.ticketing.app.booking.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    // Checks if a seat is already sold for a specific movie showtime
    boolean existsByShowtimeIdAndSeatId(Long showtimeId, String seatId);
    
    // We will need this later for the frontend to know which seats to gray out!
    List<Ticket> findByShowtimeId(Long showtimeId);
}