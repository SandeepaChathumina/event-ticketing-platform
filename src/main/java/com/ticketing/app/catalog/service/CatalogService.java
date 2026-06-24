package com.ticketing.app.catalog.service;

import com.ticketing.app.catalog.dto.BulkShowtimeRequest;
import com.ticketing.app.catalog.model.Movie;
import com.ticketing.app.catalog.model.Screen;
import com.ticketing.app.catalog.model.Showtime;
import com.ticketing.app.catalog.repository.MovieRepository;
import com.ticketing.app.catalog.repository.ScreenRepository;
import com.ticketing.app.catalog.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final MovieRepository movieRepository;
    private final ScreenRepository screenRepository;
    private final ShowtimeRepository showtimeRepository;

    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Screen addScreen(Screen screen) {
        return screenRepository.save(screen);
    }

    public Showtime addShowtime(Showtime showtime) {
        return showtimeRepository.save(showtime);
    }

    // --- RESTORED: Update Movie Logic ---
    @org.springframework.transaction.annotation.Transactional
    public Movie updateMovie(Long id, Movie movieDetails) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        movie.setTitle(movieDetails.getTitle());
        movie.setDescription(movieDetails.getDescription());
        movie.setPosterUrl(movieDetails.getPosterUrl());
        movie.setDurationMinutes(movieDetails.getDurationMinutes());
        movie.setAgeRating(movieDetails.getAgeRating());
        
        return movieRepository.save(movie);
    }

    // --- RESTORED & IMPROVED: Delete Movie Logic ---
    @org.springframework.transaction.annotation.Transactional
    public void deleteMovie(Long id) {
        // 1. Delete all showtimes linked to this movie first to prevent Foreign Key constraint errors
        List<Showtime> linkedShowtimes = showtimeRepository.findByMovieId(id);
        if (!linkedShowtimes.isEmpty()) {
            showtimeRepository.deleteAll(linkedShowtimes);
        }

        // 2. Safely delete the movie
        movieRepository.deleteById(id);
    }

    // NEW: Bulk Scheduling Logic
    public List<Showtime> bulkAddShowtimes(BulkShowtimeRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        List<Showtime> showtimesToSave = new ArrayList<>();
        LocalDate currentDate = request.getStartDate();

        while (!currentDate.isAfter(request.getEndDate())) {
            // Loop through each time provided by the admin for this specific date
            for (LocalTime time : request.getStartTimes()) {
                Showtime st = new Showtime();
                st.setMovie(movie);
                st.setScreen(screen);
                st.setStartTime(LocalDateTime.of(currentDate, time));
                st.setTicketPrice(request.getTicketPrice());
                st.setStatus("SCHEDULED");
                showtimesToSave.add(st);
            }
            currentDate = currentDate.plusDays(1);
        }

        return showtimeRepository.saveAll(showtimesToSave);
    }

    public Showtime cancelShowtime(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        showtime.setStatus("CANCELED");
        return showtimeRepository.save(showtime);
    }

    public List<Showtime> getShowtimesByMovie(Long movieId) {
        return showtimeRepository.findByMovieIdAndStatus(movieId, "SCHEDULED");
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }
}