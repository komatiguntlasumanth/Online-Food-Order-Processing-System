package com.foodorder.orderservice.messaging;

import org.camunda.bpm.engine.RuntimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class ActiveMQListener {

    @Autowired
    private RuntimeService runtimeService;

    @JmsListener(destination = "order.created")
    public void receiveOrderCreated(Map<String, Object> orderEvent) {
        try {
            Long orderId = ((Number) orderEvent.get("orderId")).longValue();
            String customerName = (String) orderEvent.get("customerName");
            String item = (String) orderEvent.get("item");
            Double amount = ((Number) orderEvent.get("amount")).doubleValue();

            System.out.println("[OrderService] ActiveMQ: Received order.created event for Order #" + orderId);

            // Set up process variables
            Map<String, Object> variables = new HashMap<>();
            variables.put("orderId", orderId);
            variables.put("customerName", customerName);
            variables.put("item", item);
            variables.put("amount", amount);

            // Start Camunda process instance using businessKey = orderId
            runtimeService.startProcessInstanceByKey("order-fulfillment-process", String.valueOf(orderId), variables);
            System.out.println("[OrderService] Order #" + orderId + " - Workflow started");
        } catch (Exception e) {
            System.err.println("[OrderService] Error processing ActiveMQ message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
