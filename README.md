# High-Concurrency Event Ticketing Platform

A highly scalable event ticketing system engineered to handle massive traffic spikes and prevent race conditions (double-booking) during high-demand ticket sales. 

## Architecture
Built using a **Modular Monolith** architecture. The system is divided into strictly isolated domains (Catalog, Booking, Identity, Payment) that run in a single Spring Boot application but communicate via internal APIs, allowing for a seamless transition to microservices in the future.

## Tech Stack
* **Backend:** Java 17, Spring Boot 
* **Database:** PostgreSQL
* **Caching & Distributed Locks:** Redis