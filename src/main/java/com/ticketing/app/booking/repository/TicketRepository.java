package com.ticketing.app.booking.repository;

import com.ticketing.app.booking.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // Allows us to find all tickets bought by a specific user later
    boolean existsByEventIdAndSeatId(Long eventId, String seatId);
}