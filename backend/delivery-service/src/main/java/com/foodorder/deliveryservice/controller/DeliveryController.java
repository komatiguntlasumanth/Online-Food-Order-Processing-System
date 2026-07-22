package com.foodorder.deliveryservice.controller;

import com.foodorder.deliveryservice.entity.Delivery;
import com.foodorder.deliveryservice.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "*")
public class DeliveryController {

    @Autowired
    private DeliveryRepository deliveryRepository;

    private final String[] drivers = {"Ramesh Kumar", "Suresh Raina", "Amit Patel", "Vikram Singh"};
    private final Random random = new Random();

    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<Map<String, Object>> assignDelivery(@RequestBody Map<String, Object> request) {
        Long orderId = ((Number) request.get("orderId")).longValue();

        // Assign mock driver
        String driverName = drivers[random.nextInt(drivers.length)];

        // Save Delivery with DELIVERED status
        Delivery delivery = Delivery.builder()
                .orderId(orderId)
                .driverName(driverName)
                .status("DELIVERED")
                .build();
        deliveryRepository.save(delivery);

        // Required Console Log Format: [DeliveryService] Order #{id} - DELIVERED
        System.out.println("[DeliveryService] Order #" + orderId + " - DELIVERED");

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("status", "DELIVERED");
        response.put("driverName", driverName);
        response.put("deliveryId", delivery.getId());

        return ResponseEntity.ok(response);
    }
}
