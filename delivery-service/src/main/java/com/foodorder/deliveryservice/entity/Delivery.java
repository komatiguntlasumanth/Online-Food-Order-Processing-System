package com.foodorder.deliveryservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "driver_name")
    private String driverName;

    @Column(nullable = false)
    private String status;

    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;

    @PrePersist
    protected void onCreate() {
        this.deliveryDate = LocalDateTime.now();
    }

    // Default Constructor
    public Delivery() {
    }

    // All Arguments Constructor
    public Delivery(Long id, Long orderId, String driverName, String status, LocalDateTime deliveryDate) {
        this.id = id;
        this.orderId = orderId;
        this.driverName = driverName;
        this.status = status;
        this.deliveryDate = deliveryDate;
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

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    @Override
    public String toString() {
        return "Delivery{" +
                "id=" + id +
                ", orderId=" + orderId +
                ", driverName='" + driverName + '\'' +
                ", status='" + status + '\'' +
                ", deliveryDate=" + deliveryDate +
                '}';
    }

    // Static Builder Pattern
    public static DeliveryBuilder builder() {
        return new DeliveryBuilder();
    }

    public static class DeliveryBuilder {
        private Long id;
        private Long orderId;
        private String driverName;
        private String status;
        private LocalDateTime deliveryDate;

        DeliveryBuilder() {
        }

        public DeliveryBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public DeliveryBuilder orderId(Long orderId) {
            this.orderId = orderId;
            return this;
        }

        public DeliveryBuilder driverName(String driverName) {
            this.driverName = driverName;
            return this;
        }

        public DeliveryBuilder status(String status) {
            this.status = status;
            return this;
        }

        public DeliveryBuilder deliveryDate(LocalDateTime deliveryDate) {
            this.deliveryDate = deliveryDate;
            return this;
        }

        public Delivery build() {
            return new Delivery(id, orderId, driverName, status, deliveryDate);
        }
    }
}
