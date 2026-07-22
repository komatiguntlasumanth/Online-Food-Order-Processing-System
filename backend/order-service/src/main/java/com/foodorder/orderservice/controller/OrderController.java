package com.foodorder.orderservice.controller;

import com.foodorder.orderservice.entity.Order;
import com.foodorder.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // Cross-origin enabled for React Frontend
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private JmsTemplate jmsTemplate;

    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<Order> placeOrder(@RequestBody Order orderRequest) {
        // Create new order with PLACED status
        Order order = Order.builder()
                .customerName(orderRequest.getCustomerName())
                .item(orderRequest.getItem())
                .amount(orderRequest.getAmount())
                .status("PLACED")
                .build();
        order.setPaymentMethod(orderRequest.getPaymentMethod());

        Order savedOrder = orderRepository.save(order);

        // Required Console Log Format: [OrderService] Order #{id} - PLACED
        System.out.println("[OrderService] Order #" + savedOrder.getId() + " - PLACED");

        // Prepare JSON payload for ActiveMQ
        Map<String, Object> orderEvent = new HashMap<>();
        orderEvent.put("orderId", savedOrder.getId());
        orderEvent.put("customerName", savedOrder.getCustomerName());
        orderEvent.put("item", savedOrder.getItem());
        orderEvent.put("amount", savedOrder.getAmount());

        // Publish to ActiveMQ queue
        jmsTemplate.convertAndSend("order.created", orderEvent);

        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
