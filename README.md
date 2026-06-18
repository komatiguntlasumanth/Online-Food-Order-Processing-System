# Online Food Ordering System 🍔🍕🥗

A modern, microservices-based application for managing online food orders from placement to delivery. 

## 🚀 Architecture

The system follows an event-driven microservices architecture to ensure loose coupling, high availability, and scalability. It leverages **Camunda BPM** for process orchestration and **Apache ActiveMQ** for reliable asynchronous messaging.

## 🛠️ Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.5, Camunda BPM 7.21
- **Frontend:** React, Vite (served via Nginx)
- **Database:** MySQL 8.0
- **Messaging:** Apache ActiveMQ (JMS Broker)
- **Containerization:** Docker & Docker Compose

## 📦 Microservices Overview

1. **Order Service (Port 8080):** Handles order placement, customer interactions, and orchestrates the entire order lifecycle using Camunda BPM engine workflows.
2. **Payment Service (Port 8081):** Processes simulated payments and validates transactions asynchronously.
3. **Kitchen Service (Port 8082):** Manages food preparation workflows and signals back when an order is ready for delivery.
4. **Delivery Service (Port 8083):** Tracks and manages the delivery assignment and delivery state until completion.
5. **Food Delivery UI (Port 3000):** A responsive React/Vite-based frontend for interacting with the services.

## ⚙️ Running Locally

### Prerequisites
- Docker and Docker Compose installed.
- (Optional) Java 17 & Maven if you wish to run services locally without Docker.

### Using Docker Compose
You can easily spin up the entire application stack including databases, messaging queues, backend services, and the frontend via Docker:

```bash
docker-compose up --build -d
```

### Accessing the Application
- **Live Deployed App:** [https://swiggyexpress.netlify.app/](https://swiggyexpress.netlify.app/)
- **Frontend App (Local):** `http://localhost:3000`
- **Camunda Cockpit (Order Service):** `http://localhost:8080/camunda`
- **ActiveMQ Web Console:** `http://localhost:8161` (Credentials: `admin` / `admin`)
- **MySQL Database:** `localhost:3306`

## 📝 License
This project is open-source and available for educational purposes.
