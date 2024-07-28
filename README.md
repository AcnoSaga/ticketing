# Ticketing
### Concert Ticket Reservation Service
A scalable, PubSub event-driven ticketing platform built with microservices architecture, leveraging Node.js, TypeScript, and React, orchestrated with Kubernetes, and featuring distributed data consistency through NATS Streaming for real-time event processing across services.
## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Architecture](#architecture)
4. [Core Functionalities](#core-functionalities)
5. [Microservices Ecosystem](#microservices-ecosystem)
6. [Development Process](#development-process)
7. [Kubernetes Deployment](#kubernetes-deployment)
8. [Challenges Overcome](#challenges-overcome)
9. [Local Development Setup](#local-development-setup)
    
## Project Overview
<img width="521" src="https://github.com/user-attachments/assets/f2e2517a-6626-42fb-ab2b-7db135db9eb2">

This project is a robust, scalable ticketing platform built on a microservices-based architecture. 

It's a showcase of an advanced implementation of distributed systems concepts, along with modern web development, DevOps practices, and cloud-native technologies.

Key highlights:
- Fully distributed microservices architecture with 5 independent services
- Event-driven design using NATS Streaming for reliable, asynchronous inter-service communication
- Implemented with TypeScript for type-safety and improved developer experience
- Leverages Docker and Kubernetes for containerization and orchestration
- Utilizes Next.js for server-side rendering, improving performance and SEO
- Implements JWT-based authentication with custom middleware for secure, stateless authentication across services
- Integrated Stripe for payment processing

## Technical Stack

<div style="text-align: center; margin-bottom: 20px; max-width: 1200px; margin: 0 auto;">
    <img src="https://nodejs.org/static/images/logo.svg" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://expressjs.com/images/express-facebook-share.png" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://www.typescriptlang.org/icons/icon-48x48.png?v=8944a05a8b601855de116c8a56d3b3ae" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://reactjs.org/logo-180x180.png" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://camo.githubusercontent.com/9771a2d4a7366d3c6d4793e17104eba9e88f0aec82f7165bfe6871455c26cb2c/68747470733a2f2f6173736574732e76657263656c2e636f6d2f696d6167652f75706c6f61642f76313636323133303535392f6e6578746a732f49636f6e5f6461726b5f6261636b67726f756e642e706e67" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://www.mongodb.com/assets/images/global/favicon.ico" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://nats.io/img/logos/nats-icon-color.png" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://jestjs.io/img/jest.png" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://axios-http.com/assets/favicon.ico" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://redux.js.org/img/redux.svg" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://getbootstrap.com/docs/5.3/assets/brand/bootstrap-logo-shadow.png" height="64">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp
    <img src="https://stripe.com/img/v3/home/twitter.png" height="64">
</div>

- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **Frontend**: [React](https://reactjs.org/), [Next.js](https://nextjs.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose ODM](https://mongoosejs.com/)
- **Message Broker**: [NATS Streaming Server](https://nats.io/)
- **Containerization**: [Docker](https://www.docker.com/)
- **Orchestration**: [Kubernetes](https://kubernetes.io/)
- **Testing**: [Jest](https://jestjs.io/), [Supertest](https://github.com/visionmedia/supertest)
- **API Client**: [Axios](https://axios-http.com/)
- **State Management**: [Redux](https://redux.js.org/) with Redux Thunk middleware
- **Styling**: [Bootstrap](https://getbootstrap.com/)
- **Payment Processing**: [Stripe](https://stripe.com/)

## Architecture

The application follows a microservices architecture, with each service responsible for a specific business domain. This design allows for:

- Independent development and deployment of services
- Improved fault isolation and resilience
- Easier scaling of individual components

Each microservice:
- Is built with Node.js and Express
- Uses its own MongoDB database
- Publishes and subscribes to events via NATS Streaming
- Is containerized using Docker
- Is deployed to a Kubernetes cluster

Inter-service communication is primarily asynchronous, using an event-driven architecture to maintain data consistency across services.

  <img width="691" alt="Screenshot 2024-07-28 at 11 28 24 PM" src="https://github.com/user-attachments/assets/1119d90a-3857-4064-8bc7-4a2239b3bc77">


## Core Functionalities

1. User Authentication:
   - Sign up, sign in, and sign out functionality
   - JWT-based authentication
   - Current user middleware for client-side rendering

2. Ticket Management:
   - Create, update, and view tickets
   - Ticket locking mechanism during purchase process

3. Order Processing:
   - Create and cancel orders
   - Implement 15-minute reservation period for tickets

4. Expiration Service:
   - Manage time-sensitive operations
   - Automate order expiration after 15 minutes

5. Payments:
   - Process payments using Stripe
   - Mark orders as complete upon successful payment

6. Event-Driven Updates:
   - Real-time synchronization across services using NATS Streaming

## Microservices Ecosystem

1. **Auth Service**:
   - Handles user registration, login, and logout
   - Issues and validates JWT tokens
   - Exposes currentUser, signup, signin, and signout routes

2. **Tickets Service**:
   - Manages ticket creation, updating, and retrieval
   - Publishes ticket:created and ticket:updated events
   - Implements optimistic concurrency control

3. **Orders Service**:
   - Handles order creation and cancellation
   - Maintains order status (created, cancelled, awaiting:payment, complete)
   - Publishes order:created, order:cancelled events

4. **Expiration Service**:
   - Listens for order:created events
   - Schedules and publishes expiration:complete events
   - Uses Bull.js for job queueing and scheduling

5. **Payments Service**:
   - Processes payments using Stripe API
   - Updates order status upon successful payment
   - Publishes payment:created events

6. **Client Application**:
   - Next.js based frontend for user interactions
   - Implements server-side rendering for improved SEO and performance
   - Uses Redux for state management

Each service is independently deployable, with its own database and API. Inter-service communication is achieved through event publishing and subscription via NATS Streaming.

### Data Structure

There are 4 custom data types we use in this project.

<img width="604" alt="Screenshot 2024-07-28 at 11 26 11 PM" src="https://github.com/user-attachments/assets/0e2a35b1-7b7f-4215-b3ec-f5453ccb38e9">


## Development Process

1. Test-Driven Development (TDD):
   - Comprehensive unit tests for all services
   - Integration tests for critical workflows
   - Custom test setup for auth and database in each service

2. Code Organization:
   - Consistent project structure across all services
   - Shared library for common code and events

3. Error Handling:
   - Custom error classes (RequestValidationError, DatabaseConnectionError, NotFoundError, BadRequestError)
   - Centralized error handling middleware

4. Typescript Configuration:
   - Strict type checking enabled
   - Consistent tsconfig across services

5. NATS Streaming:
   - Custom abstract class for event publishing
   - Robust error handling and event acknowledgement

6. Mongoose:
   - Custom plugins for optimistic concurrency control
   - Type definitions for all models

## Kubernetes Deployment

1. Kubernetes Resources:
   - Deployments for each microservice
   - ClusterIP services for inter-service communication
   - Ingress-NGINX for routing external traffic

2. Config and Secrets Management:
   - Kubernetes secrets for sensitive data (JWT_KEY, STRIPE_KEY)
   - Environment variables injected into pods

3. Local Development:
   - Skaffold for automating Kubernetes deployments
   - Hot-reloading configured for all services

4. Digital Ocean Deployment:
   - Walkthrough of production deployment on Digital Ocean Kubernetes

## Challenges Overcome

1. Data Consistency:
   - Implemented event-driven architecture
   - Idempotent event handlers to handle duplicate events
   - Optimistic concurrency control using version numbers

2. Distributed Transactions:
   - Saga pattern for multi-service operations
   - Compensating transactions for rollback scenarios

3. Authentication in Microservices:
   - Stateless JWT-based auth
   - Shared auth middleware via npm package

4. Testing Microservices:
   - In-memory MongoDB for unit tests
   - Custom test setup for auth and database mocking

5. TypeScript Integration:
   - Consistent TypeScript configuration across services
   - Type definitions for events and shared libraries

## Local Development Setup

1. Prerequisites:
   - Node.js v16.x
   - Docker v20.x
   - Kubernetes (enabled in Docker Desktop or Minikube)
   - Skaffold v1.35.x

2. Environment Setup:
   ```bash
   # Clone the repository
   git clone https://github.com/your-username/ticketing.git
   cd ticketing

   # Install dependencies
   npm install

   # Create Kubernetes secrets
   kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_jwt_key
   kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=your_stripe_key

   # Start the application
   skaffold dev
   ```
3. Accessing the application:
   - The application will be available at http://ticketing.dev
   - Add ```127.0.0.1 ticketing.dev``` to your ```/etc/hosts``` file




