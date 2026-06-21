package com.ticketing.app.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long eventId;

    @Column(nullable = false)
    private String seatId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private LocalDateTime purchaseDate;
    
    @Column(nullable = false)
    private String status; // e.g., "CONFIRMED"
}