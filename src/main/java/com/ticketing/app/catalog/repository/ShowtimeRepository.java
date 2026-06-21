package com.ticketing.app.catalog.repository;

import com.ticketing.app.catalog.model.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    // A custom method so we can easily find all showtimes for a specific movie!
    List<Showtime> findByMovieId(Long movieId);
}