package com.ticketing.app.catalog.service;

import com.ticketing.app.catalog.model.Movie;
import com.ticketing.app.catalog.model.Screen;
import com.ticketing.app.catalog.model.Showtime;
import com.ticketing.app.catalog.repository.MovieRepository;
import com.ticketing.app.catalog.repository.ScreenRepository;
import com.ticketing.app.catalog.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
        // In a real production app, we would add validation here to ensure 
        // the movie and screen actually exist before saving!
        return showtimeRepository.save(showtime);
    }

    public List<Showtime> getShowtimesByMovie(Long movieId) {
        return showtimeRepository.findByMovieId(movieId);
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }
}