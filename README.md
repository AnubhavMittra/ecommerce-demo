# ecommerce-demo

This project is a full-stack e-commerce demo with a Go backend and a React/TypeScript frontend.


## Prerequisites
- Go
- Node.js
- npm
- Docker (for backend database)
- Migrate tool for migrations (https://github.com/golang-migrate/migrate/tree/v4.17.0/cmd/migrate)

---

## Backend Setup

1. **Install Go dependencies:**
   ```bash
   cd backend
   go mod tidy
   ```

2. **Confugure database:**
    ```bash
    cd docker
    docker compose up
    ```

3. **Configure environment variables:**
   - Create .env in the backend directory.
   - Set your MariaDB credentials, JWT secret, and other settings as needed.

4. **Run database migrations:**
   ```bash
   make migrate-up
   ```
   This will create all necessary tables (users, products, orders, carts, etc).

5. **Start the backend server:**
   ```bash
   make run
   ```
   The backend will run on `http://localhost:8081` by default.

---

## Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend dev server:**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000` by default.

3. **API Configuration:**
   - The frontend is configured to call the backend at `http://localhost:8081/api/v1`.

---

## Usage
- Register a new user or sign in.
- Browse products, filter by category, search, and paginate.
- Add products to your cart (cart is persisted for logged-in users).
- Checkout to create an order.

---

---

## Project Structure
- backend - Go backend (REST API, database, migrations)
- frontend - React/TypeScript frontend (UI, state, API calls)

---
