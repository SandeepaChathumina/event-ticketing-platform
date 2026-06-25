package com.ticketing.app.analytics.service;

import com.ticketing.app.booking.repository.TicketRepository;
import com.ticketing.app.catalog.repository.ShowtimeRepository;
import com.ticketing.app.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;

    public Map<String, Object> getStats() {
        Map<String, Object> response = new HashMap<>();
        
        // Basic metrics
        response.put("totalRevenue7d", 12500.50); // Replace with real calculation logic
        response.put("ticketsSold7d", ticketRepository.count()); 
        response.put("activeUsers", userRepository.count());

        // Trend data for Recharts
        response.put("revenueData", java.util.List.of(
            Map.of("name", "Mon", "revenue", 1200),
            Map.of("name", "Tue", "revenue", 1900),
            Map.of("name", "Wed", "revenue", 1500)
        ));

        response.put("moviePerformanceData", java.util.List.of(
            Map.of("title", "Dune: Part Two", "sales", 450),
            Map.of("title", "Oppenheimer", "sales", 210)
        ));

        return response;
    }
}