package com.ticketing.app.catalog.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BulkShowtimeRequest {
    private Long movieId;
    private Long screenId;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private Double ticketPrice;
}