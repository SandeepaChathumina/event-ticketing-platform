package com.ticketing.app.payment.dto;

import lombok.Data;
import java.util.List;

@Data
public class PaymentRequest {
    private Long showtimeId;
    private List<String> seatIds; // MUST be a list to match the multiple seats feature!
    private String userId;
    private Double amount;
}