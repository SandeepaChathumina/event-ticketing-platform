package com.ticketing.app.booking.controller;

import com.ticketing.app.booking.service.TicketLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final TicketLockService ticketLockService;

    @PostMapping("/hold")
    public ResponseEntity<String> holdTicket(
            @RequestParam Long eventId, 
            @RequestParam String seatId, 
            @RequestParam String userId) {
            
        boolean lockAcquired = ticketLockService.acquireLock(eventId, seatId, userId);
        
        if (lockAcquired) {
            return ResponseEntity.ok("Seat " + seatId + " locked successfully for 10 minutes for User: " + userId);
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Seat " + seatId + " is currently on hold by someone else. Please try again later.");
        }
    }
}