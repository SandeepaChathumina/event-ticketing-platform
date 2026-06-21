package com.ticketing.app.catalog.api;

public interface CatalogServiceAPI {
    // This is the ONLY method the Booking module is allowed to know about
    void decrementAvailableSeats(Long eventId);
}