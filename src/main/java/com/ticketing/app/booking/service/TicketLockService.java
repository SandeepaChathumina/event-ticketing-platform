package com.ticketing.app.booking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketLockService {

    private final StringRedisTemplate redisTemplate;

    public boolean acquireLocks(Long showtimeId, List<String> seatIds, String userId) {
        List<String> successfullyLocked = new ArrayList<>();
        
        for (String seatId : seatIds) {
            String lockKey = "lock:showtime:" + showtimeId + ":seat:" + seatId;
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, userId, Duration.ofMinutes(10));
            
            if (Boolean.TRUE.equals(acquired)) {
                successfullyLocked.add(seatId);
            } else {
                // Rollback if ANY seat fails to lock
                for (String lockedSeat : successfullyLocked) {
                    redisTemplate.delete("lock:showtime:" + showtimeId + ":seat:" + lockedSeat);
                }
                return false;
            }
        }
        return true;
    }

    public void releaseLocks(Long showtimeId, List<String> seatIds, String userId) {
        for (String seatId : seatIds) {
            String lockKey = "lock:showtime:" + showtimeId + ":seat:" + seatId;
            String currentOwner = redisTemplate.opsForValue().get(lockKey);
            if (userId.equals(currentOwner)) {
                redisTemplate.delete(lockKey);
            }
        }
    }
}