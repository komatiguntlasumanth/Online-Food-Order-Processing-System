package com.foodorder.kitchenservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kitchen_tickets")
public class KitchenTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private String item;

    @Column(nullable = false)
    private String status;

    @Column(name = "ticket_created")
    private LocalDateTime ticketCreated;

    @PrePersist
    protected void onCreate() {
        this.ticketCreated = LocalDateTime.now();
    }

    // Default Constructor
    public KitchenTicket() {
    }

    // All Arguments Constructor
    public KitchenTicket(Long id, Long orderId, String item, String status, LocalDateTime ticketCreated) {
        this.id = id;
        this.orderId = orderId;
        this.item = item;
        this.status = status;
        this.ticketCreated = ticketCreated;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTicketCreated() {
        return ticketCreated;
    }

    public void setTicketCreated(LocalDateTime ticketCreated) {
        this.ticketCreated = ticketCreated;
    }

    @Override
    public String toString() {
        return "KitchenTicket{" +
                "id=" + id +
                ", orderId=" + orderId +
                ", item='" + item + '\'' +
                ", status='" + status + '\'' +
                ", ticketCreated=" + ticketCreated +
                '}';
    }

    // Static Builder Pattern
    public static KitchenTicketBuilder builder() {
        return new KitchenTicketBuilder();
    }

    public static class KitchenTicketBuilder {
        private Long id;
        private Long orderId;
        private String item;
        private String status;
        private LocalDateTime ticketCreated;

        KitchenTicketBuilder() {
        }

        public KitchenTicketBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public KitchenTicketBuilder orderId(Long orderId) {
            this.orderId = orderId;
            return this;
        }

        public KitchenTicketBuilder item(String item) {
            this.item = item;
            return this;
        }

        public KitchenTicketBuilder status(String status) {
            this.status = status;
            return this;
        }

        public KitchenTicketBuilder ticketCreated(LocalDateTime ticketCreated) {
            this.ticketCreated = ticketCreated;
            return this;
        }

        public KitchenTicket build() {
            return new KitchenTicket(id, orderId, item, status, ticketCreated);
        }
    }
}
