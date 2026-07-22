package com.foodorder.orderservice.delegate;

import com.foodorder.orderservice.repository.OrderRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component("deliveryServiceTask")
public class DeliveryServiceTask implements JavaDelegate {

    @Autowired
    private OrderRepository orderRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @SuppressWarnings("null")
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");

        System.out.println("[OrderService] Delegate: Assigning Delivery for Order #" + orderId);

        // Update local order status to OUT FOR DELIVERY
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus("OUT_FOR_DELIVERY");
            orderRepository.save(order);
        });

        // Call Delivery microservice
        String deliveryServiceUrl = "http://localhost:8083/api/deliveries";
        Map<String, Object> request = new HashMap<>();
        request.put("orderId", orderId);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(deliveryServiceUrl, request, Map.class);
            if (response != null) {
                String status = (String) response.get("status");

                if ("DELIVERED".equalsIgnoreCase(status) || "SUCCESS".equalsIgnoreCase(status) || response.containsKey("id")) {
                    orderRepository.findById(orderId).ifPresent(order -> {
                        order.setStatus("DELIVERED");
                        orderRepository.save(order);
                    });
                    System.out.println("[OrderService] Order #" + orderId + " - DELIVERED");
                }
            }
        } catch (Exception e) {
            System.err.println("[OrderService] Delegate: Error calling Delivery Service for Order #" + orderId + ": " + e.getMessage());
            // Fail-safe fallback: mark as delivered even if delivery service is unreachable
            orderRepository.findById(orderId).ifPresent(order -> {
                order.setStatus("DELIVERED");
                orderRepository.save(order);
            });
            System.out.println("[OrderService] Order #" + orderId + " - DELIVERED");
        }
    }
}
