package com.ticketing.app.analytics.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AnalyticsResponse {
    private Double totalRevenue7d;
    private Long ticketsSold7d;
    private Long activeUsers;
    private List<Map<String, Object>> revenueTrend;
    private List<Map<String, Object>> moviePerformance;
}