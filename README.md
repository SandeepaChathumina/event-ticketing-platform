# High-Concurrency Event Ticketing Platform

A full-stack, highly scalable event ticketing system engineered to handle massive traffic spikes and prevent race conditions (double-booking) during high-demand ticket sales.

## 🏗 Architecture
This system is built using a **Modular Monolith** architecture. The backend is strictly divided into isolated business domains (Catalog, Booking, Identity). While they run in a single Spring Boot application and share a PostgreSQL database, they communicate exclusively via defined internal APIs. This enforces strict boundaries, making it trivial to extract these modules into separate Microservices in the future.

## 💻 Tech Stack
* **Frontend:** Next.js 15, React, Tailwind CSS v4, Framer Motion
* **Backend:** Java 21, Spring Boot 3
* **Database:** PostgreSQL (Relational persistence)
* **Caching & Concurrency:** Redis (Distributed Locks)

## 🚀 Key Features
* **Distributed Locking (Concurrency Control):** Utilizes Redis `SETNX` commands to create a temporary 10-minute lock on a specific seat when a user selects it. This completely prevents the classic "double-booking" race condition if two users click the same seat at the exact same millisecond.
* **Cross-Module Communication:** The `Booking` domain handles transactions, but it dynamically updates the `Catalog` domain's inventory via a strict interface contract, preventing database coupling.
* **Global Exception Handling:** Implements a centralized `@ControllerAdvice` layer to intercept runtime errors and missing parameters, ensuring the frontend always receives clean, predictable JSON error responses.