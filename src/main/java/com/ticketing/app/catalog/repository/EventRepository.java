package com.ticketing.app.catalog.repository;

import com.ticketing.app.catalog.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    // JpaRepository gives us save(), findAll(), findById(), etc., for free!
}