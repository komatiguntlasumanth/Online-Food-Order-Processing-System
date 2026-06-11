package com.foodorder.kitchenservice.controller;

import com.foodorder.kitchenservice.entity.KitchenTicket;
import com.foodorder.kitchenservice.repository.KitchenTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/kitchen-tickets")
@CrossOrigin(origins = "*")
public class KitchenController {

    @Autowired
    private KitchenTicketRepository kitchenTicketRepository;

    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<Map<String, Object>> createKitchenTicket(@RequestBody Map<String, Object> request) {
        Long orderId = ((Number) request.get("orderId")).longValue();
        String item = (String) request.get("item");

        // Save Ticket with READY status
        KitchenTicket ticket = KitchenTicket.builder()
                .orderId(orderId)
                .item(item)
                .status("READY")
                .build();
        kitchenTicketRepository.save(ticket);

        // Required Console Log Format: [KitchenService] Order #{id} - Food READY
        System.out.println("[KitchenService] Order #" + orderId + " - Food READY");

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("status", "READY");
        response.put("ticketId", ticket.getId());

        return ResponseEntity.ok(response);
    }
}
