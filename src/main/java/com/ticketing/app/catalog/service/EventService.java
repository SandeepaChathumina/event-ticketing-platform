package com.ticketing.app.catalog.service;

import com.ticketing.app.catalog.model.Event;
import com.ticketing.app.catalog.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor // Lombok: Injects the repository automatically
public class EventService {

    private final EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(Event event) {
        // When creating an event, initially, available seats = total seats
        event.setAvailableSeats(event.getTotalSeats());
        return eventRepository.save(event);
    }
}