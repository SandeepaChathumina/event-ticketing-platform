package com.ticketing.app.booking.controller;

import com.ticketing.app.booking.service.BookingService;
import com.ticketing.app.booking.service.TicketLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.ticketing.app.booking.model.Ticket;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final TicketLockService ticketLockService;
    private final BookingService bookingService; 

    @PostMapping("/hold")
    public ResponseEntity<String> holdTickets(
            @RequestParam Long showtimeId, 
            @RequestParam List<String> seatIds, 
            @RequestParam String userId) {
            
        if (seatIds.size() > 5) return ResponseEntity.badRequest().body("Maximum 5 seats allowed.");
            
        boolean lockAcquired = ticketLockService.acquireLocks(showtimeId, seatIds, userId);
        
        if (lockAcquired) {
            return ResponseEntity.ok("Seats locked successfully for 10 minutes.");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("One or more seats are currently on hold.");
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(
            @RequestParam Long showtimeId, 
            @RequestParam List<String> seatIds, 
            @RequestParam String userId,
            @RequestParam String creditCardNumber) {
            
        boolean success = bookingService.confirmBookings(showtimeId, seatIds, userId, creditCardNumber);
        
        if (success) {
            return ResponseEntity.ok("Payment successful! Tickets have been saved.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Checkout failed. Lock expired.");
        }
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> getTicketsForShowtime(@RequestParam Long showtimeId) {
        return ResponseEntity.ok(bookingService.getTicketsByShowtime(showtimeId));
    }
}