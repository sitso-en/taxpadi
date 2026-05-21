taxpadi

> **Because GRA doesn't forget.**

TaxPadi is a mobile-first personal tax management platform built for Ghana's self-employed individuals, freelancers, traders, and small business owners. It gives users a complete system for tracking income and expenses, understanding their tax liability in real time, saving toward their tax bill, filing returns, and paying taxes, all from their phone.

---

## Project Structure

```
taxpadi/
├── backend/          Spring Boot API (Java 21 + Maven)
├── mobile/           React Native mobile app (Expo + TypeScript)
├── docs/             Project documentation
├── docker-compose.yml
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo (TypeScript) |
| Backend | Spring Boot 3.x (Java 21) |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| ORM | Spring Data JPA + Hibernate |
| Auth | Spring Security + JWT |
| AI | Anthropic Claude API, Google Speech-to-Text, Google Vision OCR |
| Payments | MTN MoMo API |
| Notifications | Firebase Cloud Messaging |
| Storage | AWS S3 |

---

## Getting Started

### Prerequisites

- Java JDK 21
- Node.js 20 LTS
- Docker Desktop
- Expo Go app on your phone

### 1. Clone the repository

```bash
git clone https://github.com/sitso-en/taxpadi.git
cd taxpadi
```

### 2. Start the database and cache

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5434` and Redis on `localhost:6379`.

### 3. Configure the backend

Copy the environment template and fill in your API keys:

```bash
cp backend/api/src/main/resources/application-example.properties backend/api/src/main/resources/application.properties
```

Then run the backend:

```bash
cd backend/api
./mvnw spring-boot:run
```

API runs at `http://localhost:8080/api/v1`
Swagger UI at `http://localhost:8080/swagger-ui`

### 4. Run the mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## Documentation

All project documentation lives in the `/docs` folder:

| Document | Description |
|---|---|
| `TaxPadi_Proposal.docx` | Project proposal submitted for Codequest |
| `TaxPadi_Schema.md` | Complete PostgreSQL database schema — 26 tables |
| `TaxPadi_API_Contract.md` | Full REST API contract — 134 endpoints |
| `TaxPadi_Architecture.md` | Application architecture for backend and frontend |

---

## Team

**Group 104 — KNUST Department of Computer Science**

| Name | Index | Ref |
|---|---|---|
| HAGAN King Ofosu | 6161324 | 21139487 |
| KASSIM Adnan | 6163724 | 21139582 |
| NKRUMAH Enoch Sitsofe | 6170824 | 21139802 |
| BENIANA Owusu Jeffery | 6148924 | 21140103 |
| ASIEDU-ADDO Kweku Amoako | 6146124 | 21139592 |

---

## Contributing

1. Branch from `develop`: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m "feat: description"`
3. Push and open a pull request to `develop`
4. Never commit directly to `main` or `develop`

---

*Codequest Project — April 2026*
