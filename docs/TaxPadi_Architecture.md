# TaxPadi — Application Architecture
**Version 1.0 | April 2026**
Group 104 | KNUST Department of Computer Science

---

## Overview

This document defines the complete application architecture for TaxPadi Version 1.0. It covers both the Spring Boot backend and the React Native frontend — how each is structured, how they communicate, how the database is accessed, how authentication works, and how the development environment is set up.

This document serves two purposes simultaneously. It is a blueprint — a high-level map of every architectural decision made for TaxPadi. It is also a guide — with enough explanation that a developer picking up Spring Boot or React Native for the first time understands not just what to build but how to approach building it.

**Read this document before writing a single line of code.**

---

## Technology Stack Summary

| Concern | Technology | Purpose |
|---|---|---|
| Mobile Frontend | React Native + Expo (TypeScript) | iOS and Android mobile app |
| Backend API | Spring Boot 3.x (Java 21) | REST API, business logic, scheduled jobs |
| ORM | Spring Data JPA + Hibernate | Database access and entity management |
| Database | PostgreSQL 15 | Primary relational data store |
| Cache | Redis 7 | Response caching and session optimization |
| Authentication | Spring Security + JWT | Token-based auth and role enforcement |
| API Documentation | Swagger / OpenAPI 3 | Interactive API docs at /swagger-ui |
| Build Tool | Maven | Dependency management and build lifecycle |
| Local Infrastructure | Docker + Docker Compose | PostgreSQL and Redis containers locally |
| Push Notifications | Firebase Cloud Messaging | Deadline reminders and penalty alerts |
| SMS | Arkesel | OTP delivery and critical alerts |
| Voice AI | Google Speech-to-Text API | Voice transaction logging |
| Receipt AI | Google Cloud Vision OCR API | Receipt scanning |
| TaxBot AI | Anthropic Claude API | Ghana tax question answering |
| File Storage | AWS S3 | Receipt images, PDFs, exports |
| Hosting (production) | AWS EC2 + RDS + ElastiCache | Cloud deployment when ready |

---

## Part 1 — Development Environment Setup

Before any code is written every team member needs the same tools installed and the same local environment running.

---

### 1.1 Tools to Install

**Every team member needs these regardless of role:**

| Tool | Version | Where to get it |
|---|---|---|
| Git | Latest | git-scm.com |
| Java JDK | 21 (LTS) | adoptium.net |
| IntelliJ IDEA | Community Edition | jetbrains.com/idea |
| Node.js | 20 LTS | nodejs.org |
| Docker Desktop | Latest | docker.com/products/docker-desktop |
| Postman | Latest | postman.com |
| pgAdmin 4 | Latest | pgadmin.org |

**Backend team additionally needs:** IntelliJ IDEA handles Maven, Java, and Spring Boot natively — no additional tools needed.

**Frontend team additionally needs:**
- VS Code — better than IntelliJ for React Native work.
- Expo Go app installed on a physical Android or iOS phone.
- Run `npm install -g expo-cli` once after Node.js is installed.

---

### 1.2 Docker Compose — Local Database and Cache

Rather than installing PostgreSQL and Redis directly on each machine — which behaves differently on Windows, Mac, and Linux — we use Docker to run them as containers. Every team member gets the exact same environment with one command.

**Create `docker-compose.yml` in the project root:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: taxpadi_postgres
    environment:
      POSTGRES_DB: taxpadi_db
      POSTGRES_USER: taxpadi_user
      POSTGRES_PASSWORD: taxpadi_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: taxpadi_redis
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

```bash
# Start both containers
docker compose up -d

# Stop them
docker compose down

# Check they are running
docker compose ps
```

PostgreSQL runs on `localhost:5432`. Redis runs on `localhost:6379`.

---

### 1.3 GitHub Repository Structure

```
github.com/taxpadi/
├── taxpadi-backend/       Spring Boot API
└── taxpadi-mobile/        React Native Expo app
```

**Branching strategy:**

```
main          — production-ready code only. Never commit directly here.
develop       — integration branch. All features merge here first.
feature/xxx   — individual feature branches. One per feature or task.
```

**Workflow:**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/user-registration

# Work, commit regularly
git add .
git commit -m "feat: add user registration endpoint"

# Push and open pull request to develop
git push origin feature/user-registration
```

Never commit directly to `main` or `develop`.

---

## Part 2 — Backend Architecture

### 2.1 What Spring Boot Is — For First-Time Users

If you have never used Spring Boot before, here is the mental model that makes everything click. In Django you define models, views, URLs, and serializers. Spring Boot works the same way with different names:

| Django concept | Spring Boot equivalent | What it does |
|---|---|---|
| Model | Entity | Defines a database table as a Java class |
| Serializer | DTO (Data Transfer Object) | Defines what data goes in and out of the API |
| View | Controller | Handles HTTP requests and returns responses |
| urls.py | @RequestMapping annotations | Maps a URL path to a method |
| settings.py | application.yml | Configuration — database, secrets, etc. |
| Migrations | JPA DDL auto | Creates and updates database tables |
| Django ORM | Spring Data JPA + Hibernate | Talks to the database without raw SQL |
| manage.py | mvnw (Maven wrapper) | Command line tool for the project |

Spring Boot uses **annotations** — the `@` symbols you will see everywhere. They tell Spring what something is and how to treat it. `@RestController` means a class handles HTTP requests. `@GetMapping("/users")` means a method responds to `GET /users`. You will learn these as you go — they are simple in context.

---

### 2.2 Project Creation

Go to **start.spring.io** and configure:

| Setting | Value |
|---|---|
| Project | Maven |
| Language | Java |
| Spring Boot | 3.2.x (latest stable) |
| Group | com.taxpadi |
| Artifact | api |
| Package name | com.taxpadi.api |
| Packaging | Jar |
| Java | 21 |

**Add these dependencies on start.spring.io:**

| Dependency | Why |
|---|---|
| Spring Web | Enables REST API endpoints |
| Spring Data JPA | Database access via JPA and Hibernate |
| PostgreSQL Driver | Connects to PostgreSQL |
| Spring Security | Authentication and authorization |
| Spring Boot DevTools | Auto-restart on code changes |
| Validation | Request body validation |
| Lombok | Reduces boilerplate Java code |
| Spring Cache | Caching abstraction |
| Spring Data Redis | Redis integration |

Click **Generate**, extract the zip, open in IntelliJ IDEA.

**Then add these to `pom.xml` manually:**

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- Swagger / OpenAPI -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>

<!-- AWS S3 -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.24.0</version>
</dependency>
```

---

### 2.3 Package Structure

Every file the team creates lives in one of these packages. Understanding this structure before writing code is the most important preparation a new Spring Boot developer can do.

```
com.taxpadi.api/
│
├── TaxPadiApplication.java          ← Main entry point. Do not touch.
│
├── config/                          ← Configuration classes
│   ├── SecurityConfig.java          ← Spring Security and JWT setup
│   ├── RedisConfig.java             ← Redis cache configuration
│   ├── SwaggerConfig.java           ← API documentation setup
│   ├── S3Config.java                ← AWS S3 client setup
│   └── SchedulerConfig.java         ← Enables Spring scheduled jobs
│
├── controller/                      ← HTTP request handlers (like Django views)
│   ├── AuthController.java
│   ├── UserController.java
│   ├── TaxProfileController.java
│   ├── ProfileController.java
│   ├── TransactionController.java
│   ├── TaxCalculationController.java
│   ├── VatController.java
│   ├── PayeController.java
│   ├── WithholdingController.java
│   ├── TaxReturnController.java
│   ├── TaxDeadlineController.java
│   ├── PenaltyController.java
│   ├── PaymentController.java
│   ├── CertificateController.java
│   ├── VaultController.java
│   ├── InvoiceController.java
│   ├── TaxBotController.java
│   ├── ReportController.java
│   ├── ReferralController.java
│   ├── NotificationController.java
│   ├── AuditLogController.java
│   ├── SubscriptionController.java
│   └── AdminController.java
│
├── service/                         ← Business logic (the brain of the app)
│   ├── AuthService.java
│   ├── UserService.java
│   ├── TaxProfileService.java
│   ├── ProfileService.java
│   ├── TransactionService.java
│   ├── TaxCalculationService.java
│   ├── VatService.java
│   ├── PayeService.java
│   ├── WithholdingService.java
│   ├── TaxReturnService.java
│   ├── TaxDeadlineService.java
│   ├── PenaltyService.java
│   ├── PaymentService.java
│   ├── CertificateService.java
│   ├── VaultService.java
│   ├── InvoiceService.java
│   ├── TaxBotService.java
│   ├── ReportService.java
│   ├── ReferralService.java
│   ├── NotificationService.java
│   ├── AuditLogService.java
│   ├── SubscriptionService.java
│   ├── OtpService.java
│   ├── JwtService.java
│   ├── S3Service.java
│   └── EmailService.java
│
├── repository/                      ← Database access (like Django ORM queries)
│   ├── UserRepository.java
│   ├── UserTaxProfileRepository.java
│   ├── OtpVerificationRepository.java
│   ├── RefreshTokenRepository.java
│   ├── TransactionRepository.java
│   ├── InvoiceRepository.java
│   ├── TaxCalculationRepository.java
│   ├── TaxReturnRepository.java
│   ├── VatRecordRepository.java
│   ├── EmployeeRepository.java
│   ├── PayeRecordRepository.java
│   ├── PenaltyRepository.java
│   ├── TaxDeadlineRepository.java
│   ├── PaymentRepository.java
│   ├── ComplianceCertificateRepository.java
│   ├── SavingsVaultRepository.java
│   ├── VaultTransactionRepository.java
│   ├── AuditLogRepository.java
│   ├── ReferralOfferRepository.java
│   ├── TaxbotConversationRepository.java
│   ├── SubscriptionRepository.java
│   ├── ImportHistoryRepository.java
│   ├── DeviceTokenRepository.java
│   ├── NotificationRepository.java
│   ├── PartnerRepository.java
│   └── TaxRateConfigRepository.java
│
├── entity/                          ← Database table definitions (like Django models)
│   ├── User.java
│   ├── UserTaxProfile.java
│   ├── OtpVerification.java
│   ├── RefreshToken.java
│   ├── Transaction.java
│   ├── Invoice.java
│   ├── TaxCalculation.java
│   ├── TaxReturn.java
│   ├── VatRecord.java
│   ├── Employee.java
│   ├── PayeRecord.java
│   ├── Penalty.java
│   ├── TaxDeadline.java
│   ├── Payment.java
│   ├── ComplianceCertificate.java
│   ├── SavingsVault.java
│   ├── VaultTransaction.java
│   ├── AuditLog.java
│   ├── ReferralOffer.java
│   ├── TaxbotConversation.java
│   ├── Subscription.java
│   ├── ImportHistory.java
│   ├── DeviceToken.java
│   ├── Notification.java
│   ├── Partner.java
│   └── TaxRateConfig.java
│
├── dto/                             ← Request and response shapes
│   ├── request/                     ← What comes IN from the frontend
│   │   ├── auth/
│   │   │   ├── RegisterRequest.java
│   │   │   ├── LoginRequest.java
│   │   │   ├── VerifyOtpRequest.java
│   │   │   ├── RefreshTokenRequest.java
│   │   │   ├── ForgotPasswordRequest.java
│   │   │   └── ResetPasswordRequest.java
│   │   ├── transaction/
│   │   │   ├── CreateTransactionRequest.java
│   │   │   └── UpdateTransactionRequest.java
│   │   └── ... (one folder per feature group)
│   │
│   └── response/                    ← What goes OUT to the frontend
│       ├── ApiResponse.java         ← The standard envelope wrapper
│       ├── auth/
│       │   ├── LoginResponse.java
│       │   └── TokenResponse.java
│       ├── user/
│       │   └── UserResponse.java
│       └── ... (one folder per feature group)
│
├── security/                        ← JWT and Spring Security internals
│   ├── JwtAuthenticationFilter.java ← Intercepts every request and checks JWT
│   ├── JwtService.java              ← Creates and validates JWT tokens
│   ├── UserDetailsServiceImpl.java  ← Loads user from DB for Spring Security
│   └── CustomUserDetails.java       ← Wraps User entity for Spring Security
│
├── scheduler/                       ← Background jobs that run on a schedule
│   ├── PenaltyScheduler.java        ← Nightly penalty calculation
│   ├── DeadlineReminderScheduler.java
│   ├── ReferralScheduler.java       ← Weekly eligibility check
│   ├── SubscriptionScheduler.java   ← Nightly expired subscription downgrade
│   └── TokenCleanupScheduler.java   ← Nightly expired token cleanup
│
├── engine/                          ← Core calculation engines
│   ├── TaxCalculationEngine.java    ← Income tax, VAT, PAYE, withholding
│   ├── PenaltyEngine.java           ← GRA penalty computation
│   ├── VaultSuggestionEngine.java   ← Tax provision suggestion
│   ├── HealthScoreEngine.java       ← Business Health Score
│   └── ReferralEligibilityEngine.java
│
├── constants/                       ← Hardcoded Ghana tax rates and rules
│   ├── GhanaTaxRates.java           ← Income tax brackets, VAT rates
│   ├── GhanaPenaltyRates.java       ← GRA penalty structure
│   ├── WithholdingRates.java        ← Withholding rates by category
│   └── TaxDeadlines.java            ← Filing deadlines by tax type
│
├── enums/                           ← Controlled value lists
│   ├── TaxpayerCategory.java        ← INDIVIDUAL, SOLE_TRADER, SMALL_BUSINESS
│   ├── TaxType.java                 ← INCOME_TAX, VAT, PAYE, WITHHOLDING
│   ├── TransactionType.java         ← INCOME, EXPENSE
│   ├── EntryMethod.java             ← MANUAL, VOICE, SCAN, IMPORT, INVOICE
│   ├── ReturnStatus.java            ← DRAFT, SUBMITTED, ACCEPTED, REJECTED
│   ├── PaymentMethod.java           ← MOMO, BANK_CARD, USSD, VAULT
│   ├── PaymentStatus.java           ← PENDING, SUCCESSFUL, FAILED
│   ├── OfferType.java               ← LOAN, INSURANCE
│   └── SubscriptionPlan.java        ← MONTHLY, ANNUAL
│
├── exception/                       ← Custom error handling
│   ├── GlobalExceptionHandler.java  ← Catches all exceptions, formats responses
│   ├── ResourceNotFoundException.java
│   ├── UnauthorizedException.java
│   ├── ValidationException.java
│   ├── BusinessException.java       ← TaxPadi-specific business rule violations
│   └── ExternalServiceException.java
│
└── integration/                     ← External API clients
    ├── anthropic/
    │   └── AnthropicClient.java     ← TaxBot calls to Claude API
    ├── google/
    │   ├── SpeechToTextClient.java
    │   └── VisionOcrClient.java
    ├── momo/
    │   └── MomoClient.java
    ├── fcm/
    │   └── FcmClient.java
    └── arkesel/
        └── ArkeselClient.java
```

---

### 2.4 The Three-Layer Architecture

Every feature follows the same pattern. Understanding this is the key to Spring Boot.

```
HTTP Request
     ↓
Controller      ← Receives the request. Validates input. Calls the service.
     ↓              Does NOT contain business logic.
Service         ← Contains ALL business logic. Talks to repositories.
     ↓              Does NOT know about HTTP.
Repository      ← Talks to the database. Returns data.
     ↓              Does NOT contain business logic.
Database
```

**A concrete example — logging a transaction:**

1. Frontend sends `POST /api/v1/transactions`.
2. `TransactionController` receives it, validates the body, calls `transactionService.createTransaction(request, userId)`.
3. `TransactionService` creates a `Transaction` entity, saves it via `transactionRepository.save(transaction)`, calls `taxCalculationEngine.recalculate(userId)`, builds and returns a `TransactionResponse` DTO.
4. `TransactionRepository` executes the SQL INSERT against PostgreSQL.
5. `TransactionController` wraps the result in `ApiResponse.success(...)` and returns JSON.

Each layer knows only about the layer directly below it. This separation is what makes the code maintainable.

---

### 2.5 The Standard API Response — ApiResponse.java

Every endpoint returns this wrapper. Define it once and use it everywhere.

```java
package com.taxpadi.api.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.Instant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;
    private ErrorDetails error;
    private Instant timestamp;

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(new ErrorDetails(code, message))
                .timestamp(Instant.now())
                .build();
    }

    @Data
    @AllArgsConstructor
    public static class ErrorDetails {
        private String code;
        private String message;
    }
}
```

**Usage in a controller:**

```java
@PostMapping("/transactions")
public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
        @Valid @RequestBody CreateTransactionRequest request,
        @AuthenticationPrincipal CustomUserDetails userDetails) {

    TransactionResponse response = transactionService.createTransaction(
        request, userDetails.getUserId()
    );
    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(ApiResponse.success(response, "Transaction logged successfully."));
}
```

---

### 2.6 Entity Example — User.java

This is how a database table is defined. Compare it to a Django model — the concept is identical.

```java
package com.taxpadi.api.entity;

import com.taxpadi.api.enums.TaxpayerCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", updatable = false, nullable = false)
    private UUID userId;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "email", unique = true, length = 150)
    private String email;

    @Column(name = "phone", nullable = false, unique = true, length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "tin", unique = true, length = 20)
    private String tin;

    @Column(name = "region", length = 100)
    private String region;

    @Enumerated(EnumType.STRING)
    @Column(name = "taxpayer_category", nullable = false, length = 30)
    private TaxpayerCategory taxpayerCategory;

    @Column(name = "subscription_tier", nullable = false, length = 20)
    @Builder.Default
    private String subscriptionTier = "free";

    @Column(name = "role", nullable = false, length = 20)
    @Builder.Default
    private String role = "user";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
```

**Annotation guide:**
- `@Entity` — this class maps to a database table
- `@Table(name = "users")` — the PostgreSQL table name
- `@Id` + `@GeneratedValue(UUID)` — auto-generated UUID primary key
- `@Column` — column constraints and mapping
- `@Enumerated(EnumType.STRING)` — stores enum name as string in DB
- `@CreationTimestamp` / `@UpdateTimestamp` — Hibernate sets these automatically
- `@Data` (Lombok) — generates getters, setters, equals, hashCode, toString
- `@Builder` (Lombok) — enables `User.builder().fullName("John").build()`

---

### 2.7 Repository Example — UserRepository.java

Repositories are interfaces. Spring Data JPA generates the SQL from method signatures automatically.

```java
package com.taxpadi.api.repository;

import com.taxpadi.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Generates: SELECT * FROM users WHERE phone = ?
    Optional<User> findByPhone(String phone);

    // Generates: SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // Generates: SELECT COUNT(*) > 0 FROM users WHERE phone = ?
    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
}
```

`JpaRepository<User, UUID>` gives you `save()`, `findById()`, `findAll()`, `deleteById()`, and many more methods free without writing any code.

---

### 2.8 Service Example — AuthService.java (Partial)

```java
package com.taxpadi.api.service;

import com.taxpadi.api.dto.request.auth.RegisterRequest;
import com.taxpadi.api.dto.response.auth.RegisterResponse;
import com.taxpadi.api.entity.*;
import com.taxpadi.api.exception.BusinessException;
import com.taxpadi.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserTaxProfileRepository taxProfileRepository;
    private final SavingsVaultRepository vaultRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("PHONE_ALREADY_EXISTS",
                "An account with this phone number already exists");
        }

        if (request.getEmail() != null &&
            userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("EMAIL_ALREADY_EXISTS",
                "An account with this email already exists");
        }

        // Hash the password — never store raw
        User user = User.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .region(request.getRegion())
                .taxpayerCategory(request.getTaxpayerCategory())
                .build();

        userRepository.save(user);

        // Create linked tax profile and vault automatically
        taxProfileRepository.save(UserTaxProfile.builder().user(user).build());
        vaultRepository.save(SavingsVault.builder().user(user).build());

        otpService.sendOtp(user.getPhone(), "register");

        return RegisterResponse.builder()
                .userId(user.getUserId())
                .phone(user.getPhone())
                .message("OTP sent to your phone number")
                .build();
    }
}
```

**Key concepts:**
- `@Service` — Spring manages this class
- `@RequiredArgsConstructor` (Lombok) — generates constructor for dependency injection
- `@Transactional` — if any save fails, all saves are rolled back atomically
- `throw new BusinessException(...)` — caught by `GlobalExceptionHandler` and formatted as error response

---

### 2.9 application.yml — Full Configuration Template

Lives at `src/main/resources/application.yml`.

```yaml
spring:
  application:
    name: taxpadi-api

  datasource:
    url: jdbc:postgresql://localhost:5432/taxpadi_db
    username: taxpadi_user
    password: taxpadi_password
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update        # Use 'validate' in production
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

  data:
    redis:
      host: localhost
      port: 6379
      timeout: 60000

  cache:
    type: redis
    redis:
      time-to-live: 86400000  # 24 hours in milliseconds

  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

server:
  port: 8080
  servlet:
    context-path: /api/v1     # All endpoints automatically prefixed with /api/v1

jwt:
  secret: your-very-long-and-secure-jwt-secret-key-at-least-256-bits
  access-token-expiry: 900000       # 15 minutes
  refresh-token-expiry: 7776000000  # 90 days
  reset-token-expiry: 900000        # 15 minutes

anthropic:
  api-key: your-anthropic-api-key
  model: claude-sonnet-4-20250514
  system-prompt: "You are TaxBot, a Ghana tax assistant. Answer questions only about Ghana tax law, GRA regulations, and financial compliance in Ghana. Be clear, concise, and use plain language."

google:
  speech-to-text:
    api-key: your-google-api-key
  vision:
    api-key: your-google-api-key

aws:
  access-key: your-aws-access-key
  secret-key: your-aws-secret-key
  region: af-south-1
  s3:
    bucket-name: taxpadi-files

momo:
  base-url: https://sandbox.momodeveloper.mtn.com
  subscription-key: your-momo-subscription-key
  api-user: your-momo-api-user
  api-key: your-momo-api-key
  environment: sandbox

arkesel:
  api-key: your-arkesel-api-key
  sender-id: TaxPadi

firebase:
  credentials-file: classpath:firebase-service-account.json

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui
    operations-sorter: method

logging:
  level:
    com.taxpadi: DEBUG
    org.springframework.security: INFO
```

**Create `.env.example` at the project root** — shows teammates what values are needed without exposing secrets:

```
JWT_SECRET=replace-with-256-bit-secret
ANTHROPIC_API_KEY=replace-with-key
GOOGLE_API_KEY=replace-with-key
AWS_ACCESS_KEY=replace-with-key
AWS_SECRET_KEY=replace-with-key
MOMO_SUBSCRIPTION_KEY=replace-with-key
ARKESEL_API_KEY=replace-with-key
```

Add `.env` to `.gitignore`. Never push secrets to GitHub.

---

### 2.10 JWT Authentication Flow

```
1. User calls POST /auth/login with phone and password
2. AuthService verifies password against BCrypt hash
3. JwtService generates access token (15 min) and refresh token (90 days)
4. Both tokens returned to frontend

5. Frontend stores tokens securely on device
6. Every subsequent request includes: Authorization: Bearer <access_token>

7. JwtAuthenticationFilter intercepts EVERY request
8. Extracts and validates the token, loads user from database
9. Sets the authenticated user in Spring Security's context
10. Request proceeds to the controller

11. When access token expires frontend calls POST /auth/refresh
12. Backend validates refresh token, issues a new access token
13. If refresh token expired or revoked, user must log in again
```

**JwtAuthenticationFilter.java:**

```java
package com.taxpadi.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String userPhone = jwtService.extractUsername(token);

        if (userPhone != null &&
            SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(userPhone);

            if (jwtService.isTokenValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

---

### 2.11 Global Exception Handler

```java
package com.taxpadi.api.exception;

import com.taxpadi.api.dto.response.ApiResponse;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(
            MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .findFirst()
            .orElse("Validation failed");
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("VALIDATION_ERROR", message));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(ex.getHttpStatus())
            .body(ApiResponse.error(ex.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGeneral(Exception ex) {
        return ResponseEntity.internalServerError()
            .body(ApiResponse.error("SERVER_ERROR", "An unexpected error occurred"));
    }
}
```

---

### 2.12 Swagger Setup

```java
package com.taxpadi.api.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI taxPadiOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("TaxPadi API")
                .description("TaxPadi REST API — Ghana Tax Management Platform")
                .version("1.0"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer"))
            .components(new Components()
                .addSecuritySchemes("Bearer", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}
```

Once running, navigate to `http://localhost:8080/swagger-ui` for interactive API docs where every endpoint can be tested from the browser.

---

### 2.13 Scheduled Jobs

```java
package com.taxpadi.api.scheduler;

import com.taxpadi.api.engine.PenaltyEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PenaltyScheduler {

    private final PenaltyEngine penaltyEngine;

    @Scheduled(cron = "0 0 0 * * *")  // Every night at midnight
    public void calculatePenalties() {
        log.info("Starting nightly penalty calculation");
        penaltyEngine.calculateAllPenalties();
        log.info("Nightly penalty calculation complete");
    }
}
```

Enable scheduling in the main class:

```java
@SpringBootApplication
@EnableScheduling
public class TaxPadiApplication {
    public static void main(String[] args) {
        SpringApplication.run(TaxPadiApplication.class, args);
    }
}
```

**Job schedule summary:**

| Job | Schedule | What it does |
|---|---|---|
| PenaltyScheduler | Midnight daily | Calculates and updates all active penalties |
| DeadlineReminderScheduler | 8am daily | Sends FCM notifications for upcoming deadlines |
| ReferralScheduler | 9am every Monday | Checks eligibility and generates referral offers |
| SubscriptionScheduler | 1am daily | Downgrades expired paid subscriptions to free |
| TokenCleanupScheduler | 2am daily | Deletes expired and revoked refresh tokens |

---

### 2.14 Tax Calculation Engine

The most critical business logic in the application.

```java
package com.taxpadi.api.constants;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class GhanaTaxRates {

    public static BigDecimal calculateIncomeTax(BigDecimal taxableIncome) {
        if (taxableIncome.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;

        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal remaining = taxableIncome;

        // 0% on first GHS 4,380
        BigDecimal b1 = new BigDecimal("4380");
        if (remaining.compareTo(b1) <= 0) return tax;
        remaining = remaining.subtract(b1);

        // 5% on next GHS 1,320
        BigDecimal b2 = new BigDecimal("1320");
        tax = tax.add(remaining.min(b2).multiply(new BigDecimal("0.05")));
        if (remaining.compareTo(b2) <= 0) return tax.setScale(2, RoundingMode.HALF_UP);
        remaining = remaining.subtract(b2);

        // 10% on next GHS 2,280
        BigDecimal b3 = new BigDecimal("2280");
        tax = tax.add(remaining.min(b3).multiply(new BigDecimal("0.10")));
        if (remaining.compareTo(b3) <= 0) return tax.setScale(2, RoundingMode.HALF_UP);
        remaining = remaining.subtract(b3);

        // 17.5% on next GHS 42,000
        BigDecimal b4 = new BigDecimal("42000");
        tax = tax.add(remaining.min(b4).multiply(new BigDecimal("0.175")));
        if (remaining.compareTo(b4) <= 0) return tax.setScale(2, RoundingMode.HALF_UP);
        remaining = remaining.subtract(b4);

        // 25% on next GHS 190,020
        BigDecimal b5 = new BigDecimal("190020");
        tax = tax.add(remaining.min(b5).multiply(new BigDecimal("0.25")));
        if (remaining.compareTo(b5) <= 0) return tax.setScale(2, RoundingMode.HALF_UP);
        remaining = remaining.subtract(b5);

        // 35% on everything above GHS 240,000
        tax = tax.add(remaining.multiply(new BigDecimal("0.35")));
        return tax.setScale(2, RoundingMode.HALF_UP);
    }

    public static final BigDecimal VAT_EFFECTIVE_RATE = new BigDecimal("0.21");
    public static final BigDecimal VAT_REGISTRATION_THRESHOLD = new BigDecimal("200000");
}
```

**Important:** Always use `BigDecimal` for money calculations in Java. Never use `double` or `float`. Floating point arithmetic produces rounding errors that are unacceptable in financial calculations.

---

### 2.15 Running the Backend

```bash
# Start PostgreSQL and Redis
docker compose up -d

# Run the Spring Boot application
./mvnw spring-boot:run

# API running at:
http://localhost:8080/api/v1

# Swagger UI at:
http://localhost:8080/swagger-ui
```

---

## Part 3 — Frontend Architecture

### 3.1 What Expo Is

React Native lets you write one TypeScript codebase that runs on both Android and iOS. Expo is a toolchain built on top of React Native that removes complex native setup — you do not need Android Studio or Xcode configured. You write code, scan a QR code with the Expo Go app on your phone, and see it live instantly.

---

### 3.2 Project Creation

```bash
npx create-expo-app taxpadi-mobile --template

# Select: Blank (TypeScript)

cd taxpadi-mobile

# Install core dependencies
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install axios
npm install @react-native-async-storage/async-storage
npm install expo-secure-store
npm install expo-local-authentication
npm install expo-camera
npm install expo-audio
npm install expo-document-picker
npm install expo-file-system
npm install expo-notifications
npm install expo-sqlite
npm install zustand
npm install react-native-reanimated
npm install react-native-gesture-handler
```

---

### 3.3 Project Structure

```
taxpadi-mobile/
│
├── app/                             ← Expo Router screens (file-based routing)
│   ├── (auth)/                      ← Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── verify-otp.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   │
│   ├── (onboarding)/
│   │   ├── tax-profile.tsx
│   │   └── complete.tsx
│   │
│   ├── (tabs)/                      ← Main app tabs after login
│   │   ├── _layout.tsx              ← Tab bar configuration
│   │   ├── dashboard.tsx            ← Live tax meter, health score, deadlines
│   │   ├── transactions.tsx         ← Transaction list and logging
│   │   ├── filing.tsx               ← Tax returns and deadlines
│   │   ├── vault.tsx                ← Tax savings vault
│   │   └── more.tsx                 ← Invoices, TaxBot, reports, settings
│   │
│   ├── transactions/
│   │   ├── [id].tsx
│   │   ├── scan.tsx                 ← Receipt scanner
│   │   ├── voice.tsx                ← Voice entry
│   │   └── import.tsx               ← MoMo statement import
│   │
│   ├── invoices/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── create.tsx
│   │
│   ├── tax/
│   │   ├── returns/
│   │   ├── paye/
│   │   └── vat/
│   │
│   ├── payments/
│   ├── certificates/
│   ├── taxbot.tsx
│   ├── referrals.tsx
│   ├── notifications.tsx
│   ├── settings.tsx
│   ├── profile.tsx
│   └── _layout.tsx                  ← Root layout — auth guard lives here
│
├── components/                      ← Reusable UI components
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   │
│   ├── dashboard/
│   │   ├── TaxMeter.tsx             ← The live tax liability gauge
│   │   ├── HealthScore.tsx
│   │   ├── DeadlineCard.tsx
│   │   └── VaultProgress.tsx
│   │
│   ├── transactions/
│   │   ├── TransactionCard.tsx
│   │   ├── TransactionForm.tsx
│   │   └── WithholdingBadge.tsx
│   │
│   └── penalties/
│       ├── PenaltyCounter.tsx       ← Live growing penalty display
│       └── PenaltyGuidance.tsx
│
├── services/                        ← API call functions
│   ├── api.ts                       ← Axios instance — base URL, interceptors
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── transaction.service.ts
│   ├── tax.service.ts
│   ├── invoice.service.ts
│   ├── payment.service.ts
│   ├── vault.service.ts
│   ├── taxbot.service.ts
│   ├── referral.service.ts
│   └── notification.service.ts
│
├── store/                           ← Global state (Zustand)
│   ├── auth.store.ts                ← User, tokens, login state
│   ├── tax.store.ts                 ← Live tax liability
│   ├── vault.store.ts               ← Vault balance
│   └── notification.store.ts        ← Unread count
│
├── hooks/                           ← Custom React hooks
│   ├── useAuth.ts
│   ├── useTaxLiability.ts
│   ├── useOfflineSync.ts
│   └── useBiometric.ts
│
├── utils/
│   ├── currency.ts                  ← formatGHS(1234.56) → "GHS 1,234.56"
│   ├── date.ts
│   ├── validation.ts
│   └── storage.ts                   ← SecureStore wrapper for tokens
│
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   └── api.ts                       ← API base URL and endpoint paths
│
├── database/                        ← SQLite offline database
│   ├── schema.ts                    ← Local table definitions
│   ├── sync.ts                      ← Offline sync engine
│   └── migrations.ts
│
└── types/                           ← TypeScript type definitions
    ├── api.types.ts
    ├── entity.types.ts
    └── navigation.types.ts
```

---

### 3.4 The API Service Layer

Every API call goes through the service layer. Never call axios directly from a screen component.

**api.ts — the Axios instance with auto token refresh:**

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/auth.store';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token expiry automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newToken = response.data.data.access_token;
        await SecureStore.setItemAsync('access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);
```

**Example service — auth.service.ts:**

```typescript
import { api } from './api';

export const authService = {

  register: async (data: {
    full_name: string;
    phone: string;
    email?: string;
    password: string;
    region: string;
    taxpayer_category: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { phone: string; password: string; device_info?: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  verifyOtp: async (phone: string, otp_code: string, purpose: string) => {
    const response = await api.post('/auth/verify-otp', { phone, otp_code, purpose });
    return response.data;
  },

  logout: async (refresh_token: string) => {
    const response = await api.post('/auth/logout', { refresh_token });
    return response.data;
  },
};
```

**Using a service in a screen:**

```typescript
const handleLogin = async () => {
  try {
    setLoading(true);
    const response = await authService.login({ phone, password });

    await SecureStore.setItemAsync('access_token', response.data.access_token);
    await SecureStore.setItemAsync('refresh_token', response.data.refresh_token);

    useAuthStore.getState().setUser(response.data.user);

    if (response.data.user.onboarding_complete) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/(onboarding)/tax-profile');
    }
  } catch (error) {
    const message = error.response?.data?.error?.message || 'Login failed';
    setError(message);
  } finally {
    setLoading(false);
  }
};
```

---

### 3.5 Global State — Zustand

```typescript
// store/auth.store.ts
import { create } from 'zustand';

interface User {
  user_id: string;
  full_name: string;
  phone: string;
  subscription_tier: 'free' | 'paid';
  onboarding_complete: boolean;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

```typescript
// store/tax.store.ts
import { create } from 'zustand';

interface TaxStore {
  totalLiability: number;
  breakdown: Array<{ tax_type: string; tax_liability: number }>;
  lastUpdated: string | null;
  setLiability: (data: any) => void;
}

export const useTaxStore = create<TaxStore>((set) => ({
  totalLiability: 0,
  breakdown: [],
  lastUpdated: null,
  setLiability: (data) => set({
    totalLiability: data.total_liability,
    breakdown: data.breakdown,
    lastUpdated: data.last_updated,
  }),
}));
```

---

### 3.6 Offline Mode — SQLite

```typescript
// database/schema.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('taxpadi.db');

export const initializeDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS offline_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      tax_deductible INTEGER DEFAULT 0,
      transaction_date TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      queue_id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      attempts INTEGER DEFAULT 0
    );
  `);
};

export const queueOfflineAction = (
  action: string,
  endpoint: string,
  payload: object
) => {
  db.runSync(
    `INSERT INTO sync_queue (queue_id, action, endpoint, payload) VALUES (?, ?, ?, ?)`,
    [crypto.randomUUID(), action, endpoint, JSON.stringify(payload)]
  );
};
```

```typescript
// database/sync.ts
import { api } from '../services/api';
import * as SQLite from 'expo-sqlite';

export const syncOfflineQueue = async () => {
  const db = SQLite.openDatabaseSync('taxpadi.db');
  const queue = db.getAllSync<any>(
    'SELECT * FROM sync_queue ORDER BY created_at ASC'
  );

  for (const item of queue) {
    try {
      await api.request({
        method: item.action,
        url: item.endpoint,
        data: JSON.parse(item.payload),
      });
      db.runSync('DELETE FROM sync_queue WHERE queue_id = ?', [item.queue_id]);
    } catch {
      db.runSync(
        'UPDATE sync_queue SET attempts = attempts + 1 WHERE queue_id = ?',
        [item.queue_id]
      );
      if (item.attempts >= 4) {
        db.runSync('DELETE FROM sync_queue WHERE queue_id = ?', [item.queue_id]);
      }
    }
  }
};
```

---

### 3.7 Running the Frontend

```bash
cd taxpadi-mobile
npx expo start
```

This opens a QR code in the terminal. Scan it with the Expo Go app on your phone. The app loads live on your device and any code change triggers an instant reload.

**For the whole team:** install Expo Go, connect to the same WiFi as the development machine, scan the QR code.

---

## Part 4 — How Frontend and Backend Work Together

### 4.1 Recommended Development Order

| Week | Backend builds | Frontend builds |
|---|---|---|
| 1 | Auth, User, Docker setup | Login, Register, OTP screens, navigation |
| 2 | Tax Profile, Transactions | Onboarding, Dashboard, Transaction logging |
| 3 | Tax Calculation engine, VAT, PAYE | Live tax meter, VAT status, PAYE management |
| 4 | Tax Returns, Deadlines, Penalties | Filing screens, deadline calendar, penalty counter |
| 5 | Payments, Vault, Certificates | Payment flow, vault screens, certificate display |
| 6 | Invoices, TaxBot, Reports | Invoice creation, TaxBot chat, export screens |
| 7 | Referrals, Notifications, Admin | Referral offers, notification center, polish |
| 8 | Integration testing, bug fixes | Integration testing, offline mode, final polish |

---

### 4.2 Environment URLs

| Environment | Backend URL |
|---|---|
| Local (same machine) | `http://localhost:8080/api/v1` |
| Local (different machines on same WiFi) | `http://192.168.x.x:8080/api/v1` |
| Production | `https://api.taxpadi.com/api/v1` |

Change `API_BASE_URL` in `services/api.ts` to match.

---

### 4.3 Error Handling Convention

The backend always returns:
```json
{
  "success": false,
  "error": { "code": "PHONE_ALREADY_EXISTS", "message": "..." }
}
```

The frontend always reads:
```typescript
} catch (error) {
  const code = error.response?.data?.error?.code;
  const message = error.response?.data?.error?.message || 'Something went wrong';
  Alert.alert('Error', message);
}
```

---

## Part 5 — Full Data Flow

```
User taps "Log Transaction"
          ↓
React Native screen calls transactionService.createTransaction(data)
          ↓
api.ts attaches JWT header automatically
          ↓
POST /api/v1/transactions → Spring Boot (localhost:8080)
          ↓
JwtAuthenticationFilter validates token
          ↓
TransactionController validates @RequestBody
          ↓
TransactionService executes:
    → Creates Transaction entity
    → Saves to PostgreSQL via TransactionRepository
    → Calls TaxCalculationEngine.recalculate(userId)
    → Updates tax_calculations in PostgreSQL
    → Checks VAT threshold
    → Computes vault suggestion
    → Writes to audit_logs
          ↓
ApiResponse.success(...) returned as JSON
          ↓
Screen updates local state
Zustand tax store updated
Live tax meter re-renders on dashboard
Vault suggestion prompt shown
```

---

## Part 6 — Production Checklist

When ready to deploy:

- [ ] Change `spring.jpa.hibernate.ddl-auto` from `update` to `validate`
- [ ] Move all secrets from `application.yml` to environment variables
- [ ] Change `momo.environment` from `sandbox` to `production`
- [ ] Set up AWS RDS PostgreSQL instance
- [ ] Set up AWS ElastiCache Redis instance
- [ ] Deploy Spring Boot JAR to AWS EC2
- [ ] Configure domain and SSL certificate
- [ ] Register with Ghana Data Protection Commission
- [ ] Enable AWS RDS automated backups
- [ ] Build production Expo app: `eas build --platform all`
- [ ] Submit to Google Play Store and Apple App Store

---

*TaxPadi — Application Architecture v1.0 | Group 104 | KNUST Department of Computer Science | April 2026*
