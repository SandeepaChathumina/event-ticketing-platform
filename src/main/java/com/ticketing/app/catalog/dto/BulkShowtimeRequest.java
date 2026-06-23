package com.ticketing.app.catalog.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class BulkShowtimeRequest {
    private Long movieId;
    private Long screenId;
    private LocalDate startDate;
    private LocalDate endDate;
    // Changed to a List so the frontend can send multiple times!
    private List<LocalTime> startTimes; 
    private Double ticketPrice;
}