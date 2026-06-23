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

    public boolean confirmBookings(Long showtimeId, List<String> seatIds, String userId, String creditCardNumber) {
        // 1. Verify locks and ensure NO seats are already sold
        for (String seatId : seatIds) {
            String lockKey = "lock:showtime:" + showtimeId + ":seat:" + seatId;
            String currentLockOwner = redisTemplate.opsForValue().get(lockKey);
            
            if (currentLockOwner == null || !currentLockOwner.equals(userId)) return false; 
            if (ticketRepository.existsByShowtimeIdAndSeatId(showtimeId, seatId)) return false;
        }

        // 2. Save all permanent tickets to PostgreSQL
        for (String seatId : seatIds) {
            Ticket ticket = new Ticket();
            ticket.setShowtimeId(showtimeId);
            ticket.setSeatId(seatId);
            ticket.setUserId(userId);
            ticket.setPurchaseDate(LocalDateTime.now());
            ticket.setStatus("CONFIRMED");
            ticketRepository.save(ticket);
        }

        // 3. Release the Redis locks
        ticketLockService.releaseLocks(showtimeId, seatIds, userId);

        return true;
    }

    public List<Ticket> getTicketsByShowtime(Long showtimeId) {
        return ticketRepository.findByShowtimeId(showtimeId);
    }
}