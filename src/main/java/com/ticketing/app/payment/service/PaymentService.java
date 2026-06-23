package com.ticketing.app.payment.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public Map<String, String> createCheckoutSession(Double amount, Long showtimeId, List<String> seatIds, String userId) throws StripeException {
        long amountInCents = (long) (amount * 100);
        
        // Convert the list of seats to a single string (e.g., "A1,A2") for URL and metadata tracking
        String seatIdsString = String.join(",", seatIds);
        long totalQuantity = seatIds.size();

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                // Pass seat_ids explicitly back to React
                .setSuccessUrl("http://localhost:3000/?session_id={CHECKOUT_SESSION_ID}&seat_ids=" + seatIdsString + "&showtime_id=" + showtimeId + "&user_id=" + userId)
                .setCancelUrl("http://localhost:3000/")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(totalQuantity) // Charge dynamic total based on number of seats
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(amountInCents)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Cinema Tickets - Seats: " + seatIdsString)
                                        .build())
                                .build())
                        .build())
                .putMetadata("showtimeId", showtimeId.toString())
                .putMetadata("seatIds", seatIdsString)
                .putMetadata("userId", userId)
                .build();

        Session session = Session.create(params);

        Map<String, String> responseData = new HashMap<>();
        responseData.put("sessionId", session.getId());
        responseData.put("url", session.getUrl()); 
        
        return responseData;
    }
}