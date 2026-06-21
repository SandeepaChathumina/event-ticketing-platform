package com.ticketing.app.booking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class TicketLockService {

    // Spring Boot automatically configures this using your application.yml
    private final StringRedisTemplate redisTemplate;

    /**
     * Attempts to lock a specific seat for a user for 10 minutes.
     * Returns true if successful, false if the seat is already locked.
     */
    public boolean acquireLock(Long eventId, String seatId, String userId) {
        // Creates a unique key for this specific seat, e.g., "lock:event:1:seat:A1"
        String lockKey = "lock:event:" + eventId + ":seat:" + seatId;
        
        // setIfAbsent is the Spring Data Redis equivalent of SETNX command
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, userId, Duration.ofMinutes(10));
                
        return Boolean.TRUE.equals(acquired);
    }

    /**
     * Releases the lock, but only if the user requesting the release is the current owner.
     */
    public void releaseLock(Long eventId, String seatId, String userId) {
        String lockKey = "lock:event:" + eventId + ":seat:" + seatId;
        String currentOwner = redisTemplate.opsForValue().get(lockKey);
        
        // Security check: Only the user who holds the lock can release it
        if (userId.equals(currentOwner)) {
            redisTemplate.delete(lockKey);
        }
    }
}