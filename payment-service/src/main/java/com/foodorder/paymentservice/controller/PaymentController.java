package com.foodorder.paymentservice.controller;

import com.foodorder.paymentservice.entity.Payment;
import com.foodorder.paymentservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    private final java.util.Random random = new java.util.Random();

    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> request) {
        Long orderId = ((Number) request.get("orderId")).longValue();
        Double amount = ((Number) request.get("amount")).doubleValue();

        // Simulate random success/failure (50/50 chance)
        boolean isSuccess = random.nextBoolean();
        String status = isSuccess ? "SUCCESS" : "FAILED";

        // Save to Database
        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(amount)
                .status(status)
                .build();
        paymentRepository.save(payment);

        // Required Console Log Format: [PaymentService] Order #{id} - Payment SUCCESS/FAILED
        System.out.println("[PaymentService] Order #" + orderId + " - Payment " + status);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("status", status);
        response.put("paymentId", payment.getId());

        return ResponseEntity.ok(response);
    }
}
