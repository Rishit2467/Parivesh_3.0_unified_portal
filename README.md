# PARIVESH 3.0 — Unified Environmental Clearance Portal

A production-ready web portal that manages the complete lifecycle of Environmental Clearance (EC) applications — from submission by project proponents to publication of the Minutes of the Meeting (MoM).

## Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Frontend       | React + Next.js + TailwindCSS     |
| Backend        | Node.js + Express                 |
| Database       | PostgreSQL                        |
| Authentication | JWT + Role-Based Access Control   |
| File Storage   | AWS S3 / Local Storage            |
| Payments       | UPI / QR Code (mock API)          |
| Deployment     | Docker + Docker Compose           |

## Project Structure

```
├── backend/           # Express API server
│   ├── src/
│   │   ├── config/    # Database, env, storage config
│   │   ├── middleware/ # Auth, RBAC, validation, upload
│   │   ├── models/    # Sequelize models
│   │   ├── routes/    # Express route handlers
│   │   ├── services/  # Business logic layer
│   │   ├── utils/     # Helpers and utilities
│   │   └── app.js     # Express app entry
│   ├── migrations/    # Database migrations
│   └── seeders/       # Seed data
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # Next.js App Router pages
│   │   ├── components/ # Reusable UI components
│   │   ├── contexts/  # React context providers
│   │   ├── hooks/     # Custom hooks
│   │   ├── lib/       # API client, utilities
│   │   └── styles/    # Global styles
│   └── public/        # Static assets
├── docker-compose.yml
└── README.md
```

## Roles

| Role                | Description                              |
| ------------------- | ---------------------------------------- |
| Admin               | System administration and configuration  |
| Project Proponent   | Submit and track EC applications         |
| Scrutiny Team       | Review applications and raise queries    |
| MoM Team            | Prepare and publish meeting minutes      |

## Application Workflow

```
Draft → Submitted → Under Scrutiny → Query Raised → Approved for Meeting → MoM Preparation → Final Publication
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 16 (or use Docker)

### Run with Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- PostgreSQL: localhost:5432

### Local Development

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Environment Variables

Copy `.env.example` files in both `backend/` and `frontend/` directories and configure as needed.

## License

Built for the PARIVESH 3.0 Government Hackathon.
