package com.ticketing.app.payment.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public Map<String, String> createCheckoutSession(Double amount, Long showtimeId, String seatId, String userId) throws StripeException {
        // Stripe expects the amount in cents (e.g., $10.00 is 1000)
        long amountInCents = (long) (amount * 100);

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                // Pass the booking data back to the frontend in the URL!
                .setSuccessUrl("http://localhost:3000/?session_id={CHECKOUT_SESSION_ID}&seat_id=" + seatId + "&showtime_id=" + showtimeId + "&user_id=" + userId)
                .setCancelUrl("http://localhost:3000/")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(amountInCents)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Cinema Ticket - Seat: " + seatId)
                                        .build())
                                .build())
                        .build())
                // Pass metadata so our webhook knows which seat to confirm later
                .putMetadata("showtimeId", showtimeId.toString())
                .putMetadata("seatId", seatId)
                .putMetadata("userId", userId)
                .build();

        Session session = Session.create(params);

        Map<String, String> responseData = new HashMap<>();
        responseData.put("sessionId", session.getId());
        
        // MAKE SURE THIS LINE IS HERE:
        responseData.put("url", session.getUrl()); 
        
        return responseData;
    }
}