package com.ticketing.app.payment.controller;

import com.ticketing.app.payment.dto.PaymentRequest;
import com.ticketing.app.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody PaymentRequest request) {
        try {
            log.info("Initiating Stripe checkout for Seats: {} by User: {}", request.getSeatIds(), request.getUserId());
            Map<String, String> response = paymentService.createCheckoutSession(
                    request.getAmount(),
                    request.getShowtimeId(),
                    request.getSeatIds(), // Passing the list of seats
                    request.getUserId()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating Stripe session: ", e);
            return ResponseEntity.badRequest().body("Payment processing failed: " + e.getMessage());
        }
    }
}