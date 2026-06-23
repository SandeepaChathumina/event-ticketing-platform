package com.ticketing.app.catalog.repository;

import com.ticketing.app.catalog.model.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieId(Long movieId);
    // Needed to filter out canceled showtimes
    List<Showtime> findByMovieIdAndStatus(Long movieId, String status); 
}