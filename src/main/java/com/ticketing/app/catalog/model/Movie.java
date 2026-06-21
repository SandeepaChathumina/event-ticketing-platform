package com.ticketing.app.catalog.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private String posterUrl; // We will use this in the Next.js frontend later

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private String ageRating; // e.g., "PG-13", "R"
}