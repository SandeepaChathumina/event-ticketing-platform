package com.ticketing.app.booking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class TicketLockService {

    private final StringRedisTemplate redisTemplate;

    public boolean acquireLock(Long showtimeId, String seatId, String userId) {
        // Lock key is now specific to the showtime
        String lockKey = "lock:showtime:" + showtimeId + ":seat:" + seatId;
        
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, userId, Duration.ofMinutes(10));
                
        return Boolean.TRUE.equals(acquired);
    }

    public void releaseLock(Long showtimeId, String seatId, String userId) {
        String lockKey = "lock:showtime:" + showtimeId + ":seat:" + seatId;
        String currentOwner = redisTemplate.opsForValue().get(lockKey);
        
        if (userId.equals(currentOwner)) {
            redisTemplate.delete(lockKey);
        }
    }
}