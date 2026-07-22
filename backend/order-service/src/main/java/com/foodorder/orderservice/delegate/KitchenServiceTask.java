package com.foodorder.orderservice.delegate;

import com.foodorder.orderservice.repository.OrderRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component("kitchenServiceTask")
public class KitchenServiceTask implements JavaDelegate {

    @Autowired
    private OrderRepository orderRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @SuppressWarnings("null")
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        String item = (String) execution.getVariable("item");

        System.out.println("[OrderService] Delegate: Submitting Kitchen Ticket for Order #" + orderId);

        // Update local order status to KITCHEN PREPARATION
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus("KITCHEN PREPARATION");
            orderRepository.save(order);
        });

        // Call Kitchen microservice
        String kitchenServiceUrl = "http://localhost:8082/api/kitchen-tickets";
        Map<String, Object> request = new HashMap<>();
        request.put("orderId", orderId);
        request.put("item", item);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(kitchenServiceUrl, request, Map.class);
            if (response != null) {
                String status = (String) response.get("status");

                if ("READY".equalsIgnoreCase(status) || "SUCCESS".equalsIgnoreCase(status) || response.containsKey("id")) {
                    System.out.println("[OrderService] Delegate: Kitchen ticket status READY for Order #" + orderId);
                    // Keep status at KITCHEN PREPARATION for tracking, or update to KITCHEN_PREPARING
                    orderRepository.findById(orderId).ifPresent(order -> {
                        order.setStatus("KITCHEN PREPARATION");
                        orderRepository.save(order);
                    });
                }
            }
        } catch (Exception e) {
            System.err.println("[OrderService] Delegate: Error calling Kitchen Service for Order #" + orderId + ": " + e.getMessage());
            // In a real system, you might trigger a user task or retry. Here we keep it robust.
        }
    }
}
