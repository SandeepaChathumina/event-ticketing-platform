package com.ticketing.app.catalog.controller;

import com.ticketing.app.catalog.dto.BulkShowtimeRequest;
import com.ticketing.app.catalog.model.Movie;
import com.ticketing.app.catalog.model.Screen;
import com.ticketing.app.catalog.model.Showtime;
import com.ticketing.app.catalog.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @PostMapping("/movies")
    public ResponseEntity<Movie> addMovie(@RequestBody Movie movie) {
        return ResponseEntity.ok(catalogService.addMovie(movie));
    }

    @PostMapping("/screens")
    public ResponseEntity<Screen> addScreen(@RequestBody Screen screen) {
        return ResponseEntity.ok(catalogService.addScreen(screen));
    }

    @PostMapping("/showtimes")
    public ResponseEntity<Showtime> addShowtime(@RequestBody Showtime showtime) {
        return ResponseEntity.ok(catalogService.addShowtime(showtime));
    }

    // NEW: Bulk Scheduling Endpoint
    @PostMapping("/showtimes/bulk")
    public ResponseEntity<List<Showtime>> bulkAddShowtimes(@RequestBody BulkShowtimeRequest request) {
        return ResponseEntity.ok(catalogService.bulkAddShowtimes(request));
    }

    // NEW: Cancel Endpoint
    @PatchMapping("/showtimes/{id}/cancel")
    public ResponseEntity<Showtime> cancelShowtime(@PathVariable("id") Long id) {
        return ResponseEntity.ok(catalogService.cancelShowtime(id));
    }

    // FIX: Added ("movieId") explicitly so Spring Boot doesn't throw a 400 error!
    @GetMapping("/showtimes")
    public ResponseEntity<List<Showtime>> getShowtimes(@RequestParam("movieId") Long movieId) {
        return ResponseEntity.ok(catalogService.getShowtimesByMovie(movieId));
    }

    @GetMapping("/movies")
    public ResponseEntity<List<Movie>> getAllMovies() {
      return ResponseEntity.ok(catalogService.getAllMovies());
    }
}