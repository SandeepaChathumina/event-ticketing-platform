package com.ticketing.app.catalog.service;

import com.ticketing.app.catalog.api.CatalogServiceAPI;
import com.ticketing.app.catalog.model.Event;
import com.ticketing.app.catalog.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService implements CatalogServiceAPI { // Notice the "implements" here

    private final EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(Event event) {
        event.setAvailableSeats(event.getTotalSeats());
        return eventRepository.save(event);
    }

    // Here we implement the method from the API interface
    @Override
    public void decrementAvailableSeats(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
                
        if (event.getAvailableSeats() > 0) {
            event.setAvailableSeats(event.getAvailableSeats() - 1);
            eventRepository.save(event);
        } else {
            throw new RuntimeException("Event is completely sold out!");
        }
    }
}