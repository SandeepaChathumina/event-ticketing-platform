package com.ticketing.app.booking.service;

import com.ticketing.app.booking.model.Ticket;
import com.ticketing.app.booking.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final TicketRepository ticketRepository;
    private final TicketLockService ticketLockService;
    private final StringRedisTemplate redisTemplate;

    public boolean confirmBooking(Long showtimeId, String seatId, String userId, String creditCardNumber) {
        String lockKey = "lock:showtime:" + showtimeId + ":seat:" + seatId;
        String currentLockOwner = redisTemplate.opsForValue().get(lockKey);

        // 1. Verify the user actually holds the lock
        if (currentLockOwner == null || !currentLockOwner.equals(userId)) {
            return false; 
        }

        // 2. Double-check the database to ensure it wasn't already sold 
        if (ticketRepository.existsByShowtimeIdAndSeatId(showtimeId, seatId)) {
            return false;
        }

        // 3. Payment successful! Save the permanent ticket to PostgreSQL
        Ticket ticket = new Ticket();
        ticket.setShowtimeId(showtimeId); // Now linked to the specific movie showtime!
        ticket.setSeatId(seatId);
        ticket.setUserId(userId);
        ticket.setPurchaseDate(LocalDateTime.now());
        ticket.setStatus("CONFIRMED");
        ticketRepository.save(ticket);

        // 4. Release the Redis lock
        ticketLockService.releaseLock(showtimeId, seatId, userId);

        return true;
    }

    // --- NEW METHOD FOR PHASE 5 ---
    public List<Ticket> getTicketsByShowtime(Long showtimeId) {
        // This uses the method we already defined in TicketRepository during Phase 2!
        return ticketRepository.findByShowtimeId(showtimeId);
    }
}