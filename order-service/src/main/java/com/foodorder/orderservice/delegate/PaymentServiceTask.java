package com.foodorder.orderservice.delegate;

import com.foodorder.orderservice.repository.OrderRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component("paymentServiceTask")
public class PaymentServiceTask implements JavaDelegate {

    @Autowired
    private OrderRepository orderRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @SuppressWarnings("null")
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        Double amount = (Double) execution.getVariable("amount");

        System.out.println("[OrderService] Delegate: Processing Payment for Order #" + orderId);

        // Update local order status to PAYMENT in progress
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus("PAYMENT");
            orderRepository.save(order);
        });

        // Call Payment microservice
        String paymentServiceUrl = "http://localhost:8081/api/payments";
        Map<String, Object> request = new HashMap<>();
        request.put("orderId", orderId);
        request.put("amount", amount);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(paymentServiceUrl, request, Map.class);
            if (response != null) {
                String status = (String) response.get("status");

                if ("SUCCESS".equalsIgnoreCase(status)) {
                    System.out.println("[OrderService] Delegate: Payment SUCCESS for Order #" + orderId);
                    execution.setVariable("paymentSuccess", true);
                    
                    orderRepository.findById(orderId).ifPresent(order -> {
                        order.setStatus("PAYMENT_SUCCESS");
                        orderRepository.save(order);
                    });
                } else {
                    System.out.println("[OrderService] Delegate: Payment FAILED for Order #" + orderId);
                    execution.setVariable("paymentSuccess", false);
                    
                    orderRepository.findById(orderId).ifPresent(order -> {
                        order.setStatus("PAYMENT_FAILED");
                        orderRepository.save(order);
                    });
                }
            } else {
                System.out.println("[OrderService] Delegate: Payment response was null for Order #" + orderId);
                execution.setVariable("paymentSuccess", false);
                orderRepository.findById(orderId).ifPresent(order -> {
                    order.setStatus("PAYMENT_FAILED");
                    orderRepository.save(order);
                });
            }
        } catch (Exception e) {
            System.err.println("[OrderService] Delegate: Error calling Payment Service for Order #" + orderId + ": " + e.getMessage());
            execution.setVariable("paymentSuccess", false);
            orderRepository.findById(orderId).ifPresent(order -> {
                order.setStatus("PAYMENT_FAILED");
                orderRepository.save(order);
            });
        }
    }
}
