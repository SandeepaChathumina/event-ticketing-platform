package com.ticketing.app.payment.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long showtimeId;
    private String seatId;
    private String userId;
    private Double amount;
}