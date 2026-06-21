package com.ticketing.app.booking.service;

import com.ticketing.app.booking.model.Ticket;
import com.ticketing.app.booking.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final TicketRepository ticketRepository;
    private final TicketLockService ticketLockService;
    private final StringRedisTemplate redisTemplate;

    public boolean confirmBooking(Long eventId, String seatId, String userId, String creditCardNumber) {
        String lockKey = "lock:event:" + eventId + ":seat:" + seatId;
        String currentLockOwner = redisTemplate.opsForValue().get(lockKey);

        // 1. Verify the user actually holds the lock (it hasn't expired or been taken)
        if (currentLockOwner == null || !currentLockOwner.equals(userId)) {
            return false; 
        }

        // 2. Double-check the database to ensure it wasn't already sold 
        // (Extra layer of security)
        if (ticketRepository.existsByEventIdAndSeatId(eventId, seatId)) {
            return false;
        }

        // 3. Mock Payment Processing would happen here using the creditCardNumber...
        // System.out.println("Processing payment for card: " + creditCardNumber);

        // 4. Payment successful! Save the permanent ticket to PostgreSQL
        Ticket ticket = new Ticket();
        ticket.setEventId(eventId);
        ticket.setSeatId(seatId);
        ticket.setUserId(userId);
        ticket.setPurchaseDate(LocalDateTime.now());
        ticket.setStatus("CONFIRMED");
        ticketRepository.save(ticket);

        // 5. Release the Redis lock so it doesn't just sit there
        ticketLockService.releaseLock(eventId, seatId, userId);

        return true;
    }
}