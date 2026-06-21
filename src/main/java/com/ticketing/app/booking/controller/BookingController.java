package com.ticketing.app.booking.controller;

import com.ticketing.app.booking.service.BookingService;
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
    private final BookingService bookingService; 

    @PostMapping("/hold")
    public ResponseEntity<String> holdTicket(
            @RequestParam Long showtimeId, 
            @RequestParam String seatId, 
            @RequestParam String userId) {
            
        boolean lockAcquired = ticketLockService.acquireLock(showtimeId, seatId, userId);
        
        if (lockAcquired) {
            return ResponseEntity.ok("Seat " + seatId + " locked successfully for 10 minutes for User: " + userId);
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Seat " + seatId + " is currently on hold by someone else. Please try again later.");
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(
            @RequestParam Long showtimeId, 
            @RequestParam String seatId, 
            @RequestParam String userId,
            @RequestParam String creditCardNumber) {
            
        boolean success = bookingService.confirmBooking(showtimeId, seatId, userId, creditCardNumber);
        
        if (success) {
            return ResponseEntity.ok("Payment successful! Ticket for seat " + seatId + " has been booked and saved to PostgreSQL.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Checkout failed. You either do not hold the lock for this seat, or the 10-minute hold expired.");
        }
    }
}