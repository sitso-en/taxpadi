# TaxPadi — API Contract
**Version 1.0 | April 2026**`

---

## Overview

This document defines the complete REST API contract for TaxPadi Version 1.0. It covers all 134 endpoints across 26 groups — request bodies, response bodies, authentication requirements, error codes, rate limits, and behavioral notes.

**Base URL:** `/api/v1`
**Format:** All requests and responses use `application/json` unless otherwise stated.
**Authentication:** Protected endpoints require a JWT Bearer token in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

---

## Standard Response Envelope

All endpoints return responses in this format:

**Success:**
```json
{
  "success": true,
  "data": {},
  "message": "string",
  "timestamp": "ISO 8601 timestamp"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  },
  "timestamp": "ISO 8601 timestamp"
}
```

---

## Authentication Types

| Type | Description |
|---|---|
| `Public` | No token required |
| `Bearer Token` | Valid JWT access token required in Authorization header |
| `Bearer Token + Admin` | Valid JWT required and `users.role` must be `admin` |

---

## Endpoint Groups

| # | Group | Endpoints |
|---|---|---|
| 1 | Auth | 8 |
| 2 | Password | 3 |
| 3 | User | 6 |
| 4 | Sessions | 2 |
| 5 | Subscriptions | 3 |
| 6 | Tax Profile | 3 |
| 7 | Multi-Profile | 5 |
| 8 | Transactions | 9 |
| 9 | Tax Calculations | 4 |
| 10 | Tax Brackets and Rates | 2 |
| 11 | VAT | 4 |
| 12 | PAYE | 9 |
| 13 | Withholding Tax | 2 |
| 14 | Tax Returns | 6 |
| 15 | Tax Deadlines | 3 |
| 16 | Penalties | 4 |
| 17 | Payments | 6 |
| 18 | Compliance Certificates | 3 |
| 19 | Savings Vault | 5 |
| 20 | Invoices | 8 |
| 21 | TaxBot | 2 |
| 22 | Reports and Export | 4 |
| 23 | Referral Offers | 5 |
| 24 | Notifications | 6 |
| 25 | Audit Log | 1 |
| 26 | Admin | 7 |
| **Total** | | **134** |

---

## Group 1 — Auth

### POST /api/v1/auth/register
**Description:** Create a new TaxPadi user account. Triggers an SMS OTP to the provided phone number for verification.
**Auth:** Public
**Rate limit:** 5 requests per phone number per hour

**Request body:**
```json
{
  "full_name": "string, required",
  "phone": "string, required, valid Ghana phone number",
  "email": "string, optional",
  "password": "string, required, minimum 8 characters",
  "region": "string, required",
  "taxpayer_category": "string, required, one of: individual | sole_trader | small_business"
}
```

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "phone": "+233XXXXXXXXX",
    "message": "OTP sent to your phone number"
  },
  "message": "Registration successful. Please verify your phone number.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 409 | PHONE_ALREADY_EXISTS | An account with this phone number already exists |
| 409 | EMAIL_ALREADY_EXISTS | An account with this email already exists |
| 429 | RATE_LIMIT_EXCEEDED | Too many registration attempts. Try again later |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Password hashed with BCrypt. Raw password never stored.
- OTP expires in 10 minutes.
- Account created with `is_verified = false`. User cannot log in until OTP verified.
- `user_tax_profiles` and `savings_vault` records created automatically alongside the user.

---

### POST /api/v1/auth/verify-otp
**Description:** Verify the OTP sent to the user's phone number.
**Auth:** Public
**Rate limit:** 5 attempts per OTP per phone number

**Request body:**
```json
{
  "phone": "string, required",
  "otp_code": "string, required",
  "purpose": "string, required, one of: login | register | password_reset"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "purpose": "register"
  },
  "message": "Phone number verified successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVALID_OTP | The OTP entered is incorrect |
| 400 | OTP_EXPIRED | This OTP has expired. Please request a new one |
| 400 | OTP_ALREADY_USED | This OTP has already been used |
| 404 | USER_NOT_FOUND | No account found with this phone number |
| 429 | RATE_LIMIT_EXCEEDED | Too many verification attempts |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- After successful verification with purpose `register`, `users.is_verified` is set to true.
- OTP `used` flag is set to true immediately. Cannot be reused.

---

### POST /api/v1/auth/resend-otp
**Description:** Resend an OTP to the user's phone number. Invalidates the previous OTP for the same purpose.
**Auth:** Public
**Rate limit:** 3 requests per phone number per 15 minutes

**Request body:**
```json
{
  "phone": "string, required",
  "purpose": "string, required, one of: login | register | password_reset"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "phone": "+233XXXXXXXXX",
    "expires_in_minutes": 10
  },
  "message": "A new OTP has been sent to your phone number.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 404 | USER_NOT_FOUND | No account found with this phone number |
| 429 | RATE_LIMIT_EXCEEDED | Too many OTP requests. Please wait before trying again |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Previous OTP for same purpose and phone is marked `used = true` before new one is created.
- Always returns success to prevent user enumeration attacks.

---

### POST /api/v1/auth/login
**Description:** Authenticate a user with phone and password. Returns JWT access token and refresh token.
**Auth:** Public
**Rate limit:** 10 attempts per phone number per 15 minutes. Account locked 30 minutes after 10 consecutive failures.

**Request body:**
```json
{
  "phone": "string, required",
  "password": "string, required",
  "device_info": "string, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "access_token": "string, JWT",
    "refresh_token": "string",
    "token_type": "Bearer",
    "expires_in": 900,
    "requires_otp": false,
    "user": {
      "user_id": "uuid",
      "full_name": "string",
      "phone": "string",
      "subscription_tier": "free | paid",
      "onboarding_complete": false
    }
  },
  "message": "Login successful.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | INVALID_CREDENTIALS | Phone number or password is incorrect |
| 403 | ACCOUNT_NOT_VERIFIED | Please verify your phone number before logging in |
| 403 | ACCOUNT_DEACTIVATED | This account has been deactivated |
| 429 | RATE_LIMIT_EXCEEDED | Too many login attempts. Try again in 30 minutes |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `expires_in` is in seconds. Access token valid for 15 minutes (900 seconds).
- New `refresh_tokens` record created on every successful login.
- Login from a new device triggers FCM notification to all other active devices.
- `onboarding_complete` included so frontend knows whether to redirect to onboarding or dashboard.

---

### POST /api/v1/auth/refresh
**Description:** Get a new access token using a valid refresh token.
**Auth:** Public
**Rate limit:** 30 requests per refresh token per hour

**Request body:**
```json
{
  "refresh_token": "string, required"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "access_token": "string, JWT",
    "token_type": "Bearer",
    "expires_in": 900
  },
  "message": "Token refreshed successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | INVALID_REFRESH_TOKEN | The refresh token is invalid or does not exist |
| 401 | REFRESH_TOKEN_EXPIRED | The refresh token has expired. Please log in again |
| 401 | REFRESH_TOKEN_REVOKED | This session has been revoked. Please log in again |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/auth/logout
**Description:** Log out the current session by revoking the current refresh token.
**Auth:** Bearer Token

**Request body:**
```json
{
  "refresh_token": "string, required"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | TOKEN_NOT_FOUND | Refresh token not found |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Sets `revoked = true` and `revoked_at = NOW()` on matching `refresh_tokens` record.
- Does not affect other active sessions on other devices.

---

### POST /api/v1/auth/biometric/register
**Description:** Register the current device for biometric login.
**Auth:** Bearer Token

**Request body:**
```json
{
  "biometric_token": "string, required, device-generated token from Expo LocalAuthentication",
  "device_info": "string, required"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "biometric_enabled": true,
    "device_info": "string"
  },
  "message": "Biometric login enabled for this device.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | BIOMETRIC_TOKEN_INVALID | The biometric token provided is not valid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 409 | BIOMETRIC_ALREADY_REGISTERED | Biometric login is already registered for this device |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Biometric token stored as hash. Raw token never stored.
- Biometric data itself never leaves the device.

---

### POST /api/v1/auth/biometric/login
**Description:** Authenticate using a device biometric token.
**Auth:** Public
**Rate limit:** 10 attempts per device per 15 minutes

**Request body:**
```json
{
  "biometric_token": "string, required",
  "device_info": "string, required"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "access_token": "string, JWT",
    "refresh_token": "string",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "user_id": "uuid",
      "full_name": "string",
      "phone": "string",
      "subscription_tier": "free | paid",
      "onboarding_complete": true
    }
  },
  "message": "Biometric login successful.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | BIOMETRIC_TOKEN_INVALID | Biometric authentication failed |
| 401 | BIOMETRIC_NOT_REGISTERED | Biometric login is not registered for this device |
| 403 | ACCOUNT_DEACTIVATED | This account has been deactivated |
| 429 | RATE_LIMIT_EXCEEDED | Too many biometric login attempts |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

## Group 2 — Password

### POST /api/v1/auth/forgot-password
**Description:** Initiate a password reset by sending an OTP to the user's phone number.
**Auth:** Public
**Rate limit:** 3 requests per phone number per hour

**Request body:**
```json
{
  "phone": "string, required"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "phone": "+233XXXXXXXXX",
    "expires_in_minutes": 10
  },
  "message": "If an account exists with this phone number, an OTP has been sent.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | Phone number is required |
| 429 | RATE_LIMIT_EXCEEDED | Too many reset attempts. Please wait before trying again |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Response message is vague to prevent user enumeration attacks.
- Previous unused password reset OTP is invalidated before a new one is created.

---

### POST /api/v1/auth/verify-reset-otp
**Description:** Verify password reset OTP. Returns a short-lived reset token.
**Auth:** Public
**Rate limit:** 5 attempts per OTP per phone number

**Request body:**
```json
{
  "phone": "string, required",
  "otp_code": "string, required"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "reset_token": "string, short-lived token valid for 15 minutes",
    "expires_in_minutes": 15
  },
  "message": "OTP verified. You may now reset your password.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVALID_OTP | The OTP entered is incorrect |
| 400 | OTP_EXPIRED | This OTP has expired. Please request a new one |
| 400 | OTP_ALREADY_USED | This OTP has already been used |
| 404 | USER_NOT_FOUND | No account found with this phone number |
| 429 | RATE_LIMIT_EXCEEDED | Too many verification attempts |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `reset_token` is a separate short-lived JWT signed with a different secret. Can only be used for password reset.
- Expires in 15 minutes. After expiry user must restart the forgot password flow.

---

### POST /api/v1/auth/reset-password
**Description:** Set a new password using the reset token.
**Auth:** Public — reset token in request body

**Request body:**
```json
{
  "reset_token": "string, required",
  "new_password": "string, required, minimum 8 characters",
  "confirm_password": "string, required, must match new_password"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": null,
  "message": "Password reset successfully. Please log in with your new password.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 400 | PASSWORDS_DO_NOT_MATCH | New password and confirm password do not match |
| 400 | PASSWORD_TOO_SHORT | Password must be at least 8 characters |
| 401 | INVALID_RESET_TOKEN | The reset token is invalid or has expired |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- All existing `refresh_tokens` for this user are revoked immediately — forces logout on all devices.
- Reset token is single-use.

---

## Group 3 — User

### GET /api/v1/users/me
**Description:** Retrieve the authenticated user's full profile.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "full_name": "string",
    "email": "string | null",
    "phone": "string",
    "tin": "string | null",
    "region": "string",
    "taxpayer_category": "individual | sole_trader | small_business",
    "subscription_tier": "free | paid",
    "role": "user | admin",
    "is_active": true,
    "is_verified": true,
    "created_at": "timestamp"
  },
  "message": "User profile retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | USER_NOT_FOUND | User account not found |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `password_hash` never returned in any user response.
- Frontend should prompt user to add TIN if null and onboarding is complete.

---

### PUT /api/v1/users/me
**Description:** Update the authenticated user's profile details.
**Auth:** Bearer Token

**Request body:**
```json
{
  "full_name": "string, optional",
  "email": "string, optional",
  "region": "string, optional",
  "tin": "string, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "full_name": "string",
    "email": "string | null",
    "tin": "string | null",
    "region": "string",
    "updated_at": "timestamp"
  },
  "message": "Profile updated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | TIN_LOCKED | Your TIN cannot be changed after a tax return has been filed |
| 409 | EMAIL_ALREADY_EXISTS | An account with this email already exists |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `phone`, `taxpayer_category`, and `role` cannot be changed through this endpoint.
- TIN can be set or updated only if no `tax_returns` record exists for this user with status `submitted` or `accepted`.
- TIN is validated for correct GRA format (11 digits) at application layer — format check only, not a live GRA lookup.
- Audit log entry written on every update.

---

### PUT /api/v1/users/me/password
**Description:** Change password while logged in.
**Auth:** Bearer Token

**Request body:**
```json
{
  "current_password": "string, required",
  "new_password": "string, required, minimum 8 characters",
  "confirm_password": "string, required, must match new_password"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully. All other sessions have been logged out.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | PASSWORDS_DO_NOT_MATCH | New password and confirm password do not match |
| 400 | PASSWORD_TOO_SHORT | Password must be at least 8 characters |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 401 | INCORRECT_CURRENT_PASSWORD | Current password is incorrect |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- All `refresh_tokens` except the current session are revoked on success.

---

### DELETE /api/v1/users/me
**Description:** Deactivate the authenticated user's account. Data retained for 6-year audit window.
**Auth:** Bearer Token

**Request body:**
```json
{
  "password": "string, required",
  "reason": "string, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": null,
  "message": "Your account has been deactivated. Your data will be retained for 6 years in compliance with GRA audit requirements.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 401 | INCORRECT_PASSWORD | Password is incorrect |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Sets `users.is_active = false`. Does not delete the record.
- All `refresh_tokens` revoked. All FCM device tokens unregistered.

---

### GET /api/v1/users/me/sessions
**Description:** List all active sessions across all devices.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "token_id": "uuid",
        "device_info": "string",
        "ip_address": "string",
        "created_at": "timestamp",
        "expires_at": "timestamp",
        "is_current": true
      }
    ]
  },
  "message": "Active sessions retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Only returns sessions where `revoked = false` and `expires_at > NOW()`.
- `token_hash` never returned.

---

### GET /api/v1/users/me/health-score
**Description:** Retrieve the user's current Business Health Score with breakdown.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "score": 74,
    "grade": "Good",
    "breakdown": {
      "income_consistency": { "score": 80, "weight": "30%", "note": "string" },
      "expense_discipline": { "score": 70, "weight": "25%", "note": "string" },
      "tax_compliance": { "score": 90, "weight": "30%", "note": "string" },
      "savings_behavior": { "score": 50, "weight": "15%", "note": "string" }
    },
    "last_calculated_at": "timestamp"
  },
  "message": "Business Health Score retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | INSUFFICIENT_DATA | Not enough activity to calculate a score yet |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Score ranges: 0-40 Poor, 41-60 Fair, 61-80 Good, 81-100 Excellent.
- Computed on demand from existing tables. No separate storage.
- Returns 404 if user has fewer than 4 weeks of transaction history.

---

### POST /api/v1/users/me/data-request
**Description:** Request a full export of all personal data held by TaxPadi. Required under Ghana's Data Protection Act 2012 (Act 843).
**Auth:** Bearer Token
**Rate limit:** Once every 30 days

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "request_id": "uuid",
    "status": "processing",
    "estimated_ready_in_minutes": 5,
    "message": "Your data export is being prepared. You will receive a notification when it is ready."
  },
  "message": "Data request submitted.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 429 | RATE_LIMIT_EXCEEDED | You can only request your data once every 30 days |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Export generated asynchronously. Push notification sent when ready with download link valid 24 hours.
- Covers all data across all tables linked to the user.

---

### DELETE /api/v1/users/me/permanent
**Description:** Request permanent deletion of account and all data. Only available after 6-year GRA retention window.
**Auth:** Bearer Token

**Request body:**
```json
{
  "password": "string, required",
  "confirmation": "string, required, must equal: DELETE MY ACCOUNT PERMANENTLY"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": null,
  "message": "Your account and all associated data have been permanently deleted.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | CONFIRMATION_MISMATCH | Please type DELETE MY ACCOUNT PERMANENTLY to confirm |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 401 | INCORRECT_PASSWORD | Password is incorrect |
| 403 | RETENTION_PERIOD_ACTIVE | Your account data must be retained for 6 years from your first filing |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `RETENTION_PERIOD_ACTIVE` when oldest `tax_returns.submitted_at` is less than 6 years ago.
- Hard delete — all records permanently removed. Irreversible.

---

## Group 4 — Sessions

### DELETE /api/v1/users/me/sessions/{token_id}
**Description:** Revoke a specific session by token ID. Remotely logs out a specific device.
**Auth:** Bearer Token

**Path parameter:** `token_id` — UUID of the refresh token record

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "token_id": "uuid",
    "device_info": "string",
    "revoked_at": "timestamp"
  },
  "message": "Session revoked successfully. The device has been logged out.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | CANNOT_REVOKE_CURRENT_SESSION | Use the logout endpoint to end your current session |
| 404 | SESSION_NOT_FOUND | No active session found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- User can only revoke sessions belonging to their own account.

---

### DELETE /api/v1/users/me/sessions
**Description:** Revoke all active sessions except the current one.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "sessions_revoked": 3
  },
  "message": "All other sessions have been revoked. Only your current session remains active.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

## Group 5 — Subscriptions

### GET /api/v1/subscriptions/status
**Description:** Retrieve current subscription status and feature access.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "subscription_tier": "free | paid",
    "status": "active | cancelled | expired",
    "started_at": "timestamp | null",
    "expires_at": "timestamp | null",
    "auto_renew": true,
    "features": {
      "vat_management": true,
      "paye_management": true,
      "auto_filing": true,
      "tax_savings_vault": true,
      "advanced_reports": true,
      "invoice_generator": true,
      "referral_offers": true
    }
  },
  "message": "Subscription status retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- For free tier users `started_at`, `expires_at`, and `auto_renew` are null.
- Frontend uses `features` object to gate access to paid features.

---

### POST /api/v1/subscriptions/subscribe
**Description:** Initiate a subscription upgrade from free to paid tier.
**Auth:** Bearer Token

**Request body:**
```json
{
  "plan": "string, required, one of: monthly | annual",
  "payment_method": "string, required, one of: momo | bank_card",
  "momo_number": "string, required if payment_method is momo"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "uuid",
    "plan": "monthly | annual",
    "amount": 0.00,
    "currency": "GHS",
    "payment_reference": "string",
    "status": "pending",
    "expires_at": "timestamp"
  },
  "message": "Subscription payment initiated. Please approve the payment on your phone.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 400 | ALREADY_SUBSCRIBED | You already have an active paid subscription |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 402 | PAYMENT_FAILED | Subscription payment could not be initiated |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Pricing configured server-side by admin.
- On payment confirmation `users.subscription_tier` updated to `paid`.

---

### POST /api/v1/subscriptions/cancel
**Description:** Cancel active paid subscription. Access continues until period expires.
**Auth:** Bearer Token

**Request body:**
```json
{
  "reason": "string, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "subscription_tier": "paid",
    "status": "cancelled",
    "access_until": "timestamp"
  },
  "message": "Subscription cancelled. You will retain paid access until your current period ends.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | NO_ACTIVE_SUBSCRIPTION | You do not have an active paid subscription to cancel |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `subscription_tier` stays `paid` until `expires_at` passes. Nightly job handles downgrade.
- `auto_renew` set to false on cancellation.

---

## Group 6 — Tax Profile

### GET /api/v1/tax-profile
**Description:** Retrieve the authenticated user's tax profile.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "profile_id": "uuid",
    "user_id": "uuid",
    "vat_registered": false,
    "vat_registration_no": "string | null",
    "paye_registered": false,
    "nhil_registered": false,
    "tax_year_start": "2024-01-01",
    "onboarding_complete": true,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "message": "Tax profile retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | TAX_PROFILE_NOT_FOUND | Tax profile not found for this user |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/tax-profile
**Description:** Update the authenticated user's tax profile.
**Auth:** Bearer Token

**Request body:**
```json
{
  "vat_registration_no": "string, optional",
  "nhil_registered": "boolean, optional",
  "tax_year_start": "date, optional, format: YYYY-MM-DD"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "profile_id": "uuid",
    "vat_registration_no": "string | null",
    "nhil_registered": false,
    "tax_year_start": "2024-01-01",
    "updated_at": "timestamp"
  },
  "message": "Tax profile updated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | TAX_PROFILE_NOT_FOUND | Tax profile not found for this user |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `vat_registered` set via `POST /tax/vat/register`. `paye_registered` set automatically when first employee added.
- `tax_year_start` locked after first tax return is filed.

---

### POST /api/v1/tax-profile/complete-onboarding
**Description:** Mark onboarding as complete. Triggers generation of personalized tax deadlines.
**Auth:** Bearer Token

**Request body:**
```json
{
  "tax_year_start": "date, required, format: YYYY-MM-DD",
  "tin": "string, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "onboarding_complete": true,
    "tax_year_start": "2024-01-01",
    "deadlines_generated": 4,
    "tin_saved": true
  },
  "message": "Onboarding complete. Your tax deadlines have been generated.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 400 | ALREADY_ONBOARDED | Onboarding has already been completed for this account |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Automatically generates `tax_deadlines` for all applicable tax types.
- If `tin` provided it is saved to `users.tin`.

---

## Group 7 — Multi-Profile

### GET /api/v1/profiles
**Description:** Retrieve all tax profiles associated with the authenticated user's account.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "profile_id": "uuid",
        "label": "string",
        "taxpayer_category": "string",
        "tin": "string | null",
        "is_active_profile": true,
        "created_at": "timestamp"
      }
    ],
    "total": 2
  },
  "message": "Profiles retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/profiles
**Description:** Create an additional tax profile.
**Auth:** Bearer Token

**Request body:**
```json
{
  "label": "string, required",
  "taxpayer_category": "string, required, one of: individual | sole_trader | small_business",
  "tin": "string, optional",
  "tax_year_start": "date, optional, format: YYYY-MM-DD"
}
```

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "profile_id": "uuid",
    "label": "string",
    "taxpayer_category": "string",
    "tin": "string | null",
    "tax_year_start": "2024-01-01",
    "is_active_profile": false,
    "created_at": "timestamp"
  },
  "message": "New profile created successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 400 | MAX_PROFILES_REACHED | You have reached the maximum number of profiles allowed on your plan |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Free tier: max 1 profile. Paid tier: max 5 profiles.
- New profile not automatically set as active.
- Creates linked `user_tax_profiles`, `savings_vault` records and generates tax deadlines.

---

### PUT /api/v1/profiles/{id}
**Description:** Update a specific profile's label or tax year start.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the profile

**Request body:**
```json
{
  "label": "string, optional",
  "tax_year_start": "date, optional, format: YYYY-MM-DD"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "profile_id": "uuid",
    "label": "string",
    "tax_year_start": "2024-01-01",
    "updated_at": "timestamp"
  },
  "message": "Profile updated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | TAX_YEAR_LOCKED | Tax year start cannot be changed after a return has been filed |
| 404 | PROFILE_NOT_FOUND | No profile found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### DELETE /api/v1/profiles/{id}
**Description:** Delete a profile. Only allowed if no tax returns have been filed on it.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the profile

**Success — 200 OK:**
```json
{
  "success": true,
  "data": null,
  "message": "Profile deleted successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | CANNOT_DELETE_PRIMARY_PROFILE | Your primary profile cannot be deleted |
| 403 | PROFILE_HAS_FILED_RETURNS | This profile cannot be deleted because it has filed tax returns |
| 404 | PROFILE_NOT_FOUND | No profile found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- If active profile is deleted, system switches back to primary profile automatically.

---

### PUT /api/v1/profiles/{id}/switch
**Description:** Switch the active profile. All subsequent data is attributed to the newly selected profile.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the profile to switch to

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "active_profile": {
      "profile_id": "uuid",
      "label": "string",
      "taxpayer_category": "string",
      "tin": "string | null"
    }
  },
  "message": "Active profile switched successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | ALREADY_ACTIVE | This profile is already the active profile |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | PROFILE_NOT_FOUND | No profile found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Updates `users.active_profile_id`.
- Frontend should refresh dashboard and all profile-specific data after switching.

---

## Group 8 — Transactions

### GET /api/v1/transactions
**Description:** Retrieve a paginated list of transactions with optional filters.
**Auth:** Bearer Token

**Query parameters:**
- `type` — optional, one of: `income | expense`
- `category` — optional, string
- `entry_method` — optional, one of: `manual | voice | scan | import | invoice`
- `tax_deductible` — optional, boolean
- `withholding_applicable` — optional, boolean
- `date_from` — optional, `YYYY-MM-DD`
- `date_to` — optional, `YYYY-MM-DD`
- `page` — optional, default: 1
- `limit` — optional, default: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transaction_id": "uuid",
        "type": "income | expense",
        "amount": 500.00,
        "category": "string",
        "description": "string | null",
        "entry_method": "string",
        "receipt_url": "string | null",
        "tax_deductible": false,
        "withholding_applicable": false,
        "withholding_amount": 0.00,
        "withholding_remitted": false,
        "transaction_date": "2024-04-30",
        "created_at": "timestamp"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 20,
      "total_pages": 6
    }
  },
  "message": "Transactions retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more query parameters are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Results sorted by `transaction_date` descending.
- Only returns transactions for the user's currently active profile.

---

### POST /api/v1/transactions
**Description:** Manually log a new income or expense transaction.
**Auth:** Bearer Token

**Request body:**
```json
{
  "type": "string, required, one of: income | expense",
  "amount": "number, required, greater than 0",
  "category": "string, required",
  "description": "string, optional",
  "tax_deductible": "boolean, optional, default: false",
  "withholding_applicable": "boolean, optional, default: false",
  "transaction_date": "date, required, format: YYYY-MM-DD"
}
```

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "type": "string",
    "amount": 500.00,
    "category": "string",
    "entry_method": "manual",
    "tax_deductible": false,
    "withholding": {
      "applicable": false,
      "rate": null,
      "amount": 0.00,
      "message": null
    },
    "transaction_date": "2024-04-30",
    "tax_liability_updated": true,
    "vault_suggestion": {
      "suggested": true,
      "suggested_amount": 75.00,
      "message": "Consider saving GHS 75.00 for taxes on this income"
    }
  },
  "message": "Transaction logged successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 400 | INVALID_CATEGORY | The category provided is not valid for your taxpayer type |
| 400 | FUTURE_DATE_NOT_ALLOWED | Transaction date cannot be in the future |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `entry_method` auto-set to `manual` by backend.
- Tax calculation engine triggered immediately after save.
- `vault_suggestion` omitted for expense transactions.
- If `withholding_applicable = true`, `withholding.rate` and `withholding.amount` are computed from category and amount using rates from `GET /tax/rates`.

---

### GET /api/v1/transactions/{id}
**Description:** Retrieve a single transaction by ID.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the transaction

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "type": "income | expense",
    "amount": 500.00,
    "category": "string",
    "description": "string | null",
    "entry_method": "string",
    "receipt_url": "string | null",
    "tax_deductible": false,
    "withholding_applicable": false,
    "withholding_amount": 0.00,
    "withholding_remitted": false,
    "withholding_remitted_at": "timestamp | null",
    "transaction_date": "2024-04-30",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "message": "Transaction retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this transaction |
| 404 | TRANSACTION_NOT_FOUND | No transaction found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/transactions/{id}
**Description:** Update an existing transaction. Triggers tax recalculation.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the transaction

**Request body:**
```json
{
  "amount": "number, optional, greater than 0",
  "category": "string, optional",
  "description": "string, optional",
  "tax_deductible": "boolean, optional",
  "withholding_applicable": "boolean, optional",
  "transaction_date": "date, optional, format: YYYY-MM-DD"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "amount": 600.00,
    "category": "string",
    "tax_deductible": true,
    "withholding": {
      "applicable": true,
      "rate": "5%",
      "amount": 30.00
    },
    "transaction_date": "2024-04-30",
    "updated_at": "timestamp",
    "tax_liability_updated": true
  },
  "message": "Transaction updated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 400 | INVOICE_TRANSACTION_LOCKED | Transactions created from invoices cannot be edited directly |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this transaction |
| 403 | RETURN_FILED | Transactions in a filed tax period cannot be edited |
| 404 | TRANSACTION_NOT_FOUND | No transaction found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `type` and `entry_method` cannot be changed after creation.
- Previous and new values written to `audit_logs`.

---

### DELETE /api/v1/transactions/{id}
**Description:** Delete a transaction. Triggers tax recalculation.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the transaction

**Success — 200 OK:**
```json
{
  "success": true,
  "data": null,
  "message": "Transaction deleted successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this transaction |
| 403 | INVOICE_TRANSACTION_LOCKED | Transactions created from invoices cannot be deleted directly |
| 403 | RETURN_FILED | Transactions in a filed tax period cannot be deleted |
| 404 | TRANSACTION_NOT_FOUND | No transaction found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Hard delete. Full record written to `audit_logs` before deletion.

---

### POST /api/v1/transactions/import
**Description:** Import and parse a MoMo or bank statement file.
**Auth:** Bearer Token
**Rate limit:** 10 imports per user per day
**Content-Type:** multipart/form-data

**Request body:**
```
file: required, PDF or CSV, max 10MB
provider: required, one of: mtn_momo | telecel_cash | gcb | absa | ecobank | fidelity | other
statement_from: required, YYYY-MM-DD
statement_to: required, YYYY-MM-DD
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "import_id": "uuid",
    "provider": "mtn_momo",
    "statement_from": "2024-03-01",
    "statement_to": "2024-03-31",
    "total_transactions_found": 45,
    "transactions_imported": 42,
    "transactions_skipped": 3,
    "ambiguous_transactions": [
      {
        "transaction_id": "uuid",
        "amount": 200.00,
        "description": "Transfer from Kwame",
        "suggested_category": "other_income",
        "transaction_date": "2024-03-15",
        "needs_review": true
      }
    ],
    "tax_liability_updated": true
  },
  "message": "Statement imported successfully. Please review flagged transactions.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | UNSUPPORTED_FILE_FORMAT | Only PDF and CSV files are supported |
| 400 | FILE_TOO_LARGE | File size exceeds the 10MB limit |
| 400 | UNREADABLE_FILE | The file could not be parsed |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 409 | PERIOD_ALREADY_IMPORTED | Transactions for this period have already been imported |
| 429 | RATE_LIMIT_EXCEEDED | Import limit reached for today |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/transactions/import/history
**Description:** Retrieve history of all previous statement imports.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "imports": [
      {
        "import_id": "uuid",
        "provider": "mtn_momo",
        "statement_from": "2024-03-01",
        "statement_to": "2024-03-31",
        "total_imported": 42,
        "imported_at": "timestamp"
      }
    ],
    "total": 5
  },
  "message": "Import history retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/transactions/import/validate
**Description:** Validate a statement file before importing. Detects date range and overlap with previous imports.
**Auth:** Bearer Token
**Content-Type:** multipart/form-data

**Request body:**
```
file: required, PDF or CSV, max 10MB
provider: required
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "detected_from": "2024-03-01",
    "detected_to": "2024-03-31",
    "total_transactions_detected": 45,
    "overlap_detected": false,
    "overlapping_periods": [],
    "safe_to_import": true
  },
  "message": "File validated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | UNSUPPORTED_FILE_FORMAT | Only PDF and CSV files are supported |
| 400 | FILE_TOO_LARGE | File size exceeds the 10MB limit |
| 400 | UNREADABLE_FILE | The file could not be parsed |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Reads and parses file but creates no records. Pure pre-import check.
- Frontend should always call this before calling the actual import endpoint.

---

### POST /api/v1/transactions/scan
**Description:** Submit a receipt image for OCR processing.
**Auth:** Bearer Token
**Rate limit:** 50 scans per user per day
**Content-Type:** multipart/form-data

**Request body:**
```
image: required, JPG or PNG, max 5MB
transaction_type: required, one of: income | expense
```

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "type": "expense",
    "amount": 120.00,
    "category": "supplies",
    "description": "Melcom - Office supplies",
    "entry_method": "scan",
    "receipt_url": "string",
    "tax_deductible": true,
    "transaction_date": "2024-04-29",
    "ocr_confidence": "high | medium | low",
    "needs_review": false,
    "tax_liability_updated": true
  },
  "message": "Receipt scanned and transaction logged successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | UNSUPPORTED_IMAGE_FORMAT | Only JPG and PNG images are supported |
| 400 | IMAGE_TOO_LARGE | Image size exceeds the 5MB limit |
| 400 | OCR_FAILED | The receipt could not be read. Please ensure the image is clear |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 429 | RATE_LIMIT_EXCEEDED | Daily scan limit reached |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Image uploaded to S3 first. URL sent to Google Cloud Vision OCR.
- `needs_review` is true when `ocr_confidence` is `low` or key fields could not be extracted.

---

### POST /api/v1/transactions/voice
**Description:** Submit a voice recording for speech-to-text transaction logging.
**Auth:** Bearer Token
**Rate limit:** 30 voice entries per user per day
**Content-Type:** multipart/form-data

**Request body:**
```
audio: required, MP3/WAV/M4A, max 2MB, max 30 seconds
language: optional, one of: en | tw | ga | ha | ee, default: en
```

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "type": "income",
    "amount": 500.00,
    "category": "sales_income",
    "description": "string",
    "entry_method": "voice",
    "transcription": "I received 500 cedis from a client today",
    "tax_deductible": false,
    "transaction_date": "2024-04-30",
    "confidence": "high | medium | low",
    "needs_review": false,
    "tax_liability_updated": true
  },
  "message": "Voice entry processed and transaction logged successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | UNSUPPORTED_AUDIO_FORMAT | Only MP3, WAV, and M4A formats are supported |
| 400 | AUDIO_TOO_LONG | Audio must be 30 seconds or less |
| 400 | AUDIO_TOO_LARGE | Audio file exceeds the 2MB limit |
| 400 | TRANSCRIPTION_FAILED | Could not understand the audio |
| 400 | AMOUNT_NOT_DETECTED | Could not detect an amount in the audio |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 429 | RATE_LIMIT_EXCEEDED | Daily voice entry limit reached |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `transcription` returned so user can see what was understood.
- If no amount detected, returns `AMOUNT_NOT_DETECTED` and no transaction is created.

---

## Group 9 — Tax Calculations

### GET /api/v1/tax/liability
**Description:** Retrieve current live tax liability across all applicable tax types. Powers the dashboard tax meter.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "tax_year": 2024,
    "period_start": "2024-01-01",
    "period_end": "2024-12-31",
    "total_liability": 2450.00,
    "breakdown": [
      {
        "tax_type": "income_tax",
        "gross_income": 18000.00,
        "total_deductions": 3000.00,
        "taxable_income": 15000.00,
        "tax_liability": 1800.00,
        "calculated_at": "timestamp"
      },
      {
        "tax_type": "vat",
        "tax_liability": 450.00,
        "calculated_at": "timestamp"
      },
      {
        "tax_type": "paye",
        "tax_liability": 200.00,
        "calculated_at": "timestamp"
      },
      {
        "tax_type": "withholding",
        "total_withheld": 50.00,
        "total_remitted": 0.00,
        "outstanding": 50.00,
        "calculated_at": "timestamp"
      }
    ],
    "last_updated": "timestamp"
  },
  "message": "Tax liability retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | NO_CALCULATIONS_FOUND | No tax calculations found. Log your first transaction to get started. |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Only returns tax types applicable to the user's profile and registration flags.
- Reads from `tax_calculations` table — not computed on the fly.

---

### GET /api/v1/tax/liability/{tax_type}
**Description:** Retrieve detailed tax liability breakdown for a specific tax type.
**Auth:** Bearer Token

**Path parameter:** `tax_type` — one of: `income_tax | vat | paye | withholding`

**Query parameters:**
- `year` — optional, defaults to current tax year
- `month` — optional, integer 1-12, required for VAT and PAYE

**Success — 200 OK (income_tax example):**
```json
{
  "success": true,
  "data": {
    "tax_type": "income_tax",
    "period_start": "2024-01-01",
    "period_end": "2024-12-31",
    "gross_income": 18000.00,
    "total_deductions": 3000.00,
    "taxable_income": 15000.00,
    "tax_liability": 1800.00,
    "bracket_breakdown": [
      { "bracket": "GHS 0 - GHS 4,380", "rate": "0%", "tax": 0.00 },
      { "bracket": "GHS 4,381 - GHS 5,700", "rate": "5%", "tax": 66.00 }
    ],
    "calculated_at": "timestamp"
  },
  "message": "Tax liability breakdown retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Success — 200 OK (withholding example):**
```json
{
  "success": true,
  "data": {
    "tax_type": "withholding",
    "period_start": "2024-01-01",
    "period_end": "2024-12-31",
    "transactions": [
      {
        "transaction_id": "uuid",
        "description": "Payment to contractor",
        "amount": 1000.00,
        "withholding_rate": "5%",
        "withholding_amount": 50.00,
        "transaction_date": "2024-04-15",
        "remitted": false
      }
    ],
    "total_withheld": 50.00,
    "total_remitted": 0.00,
    "outstanding": 50.00,
    "calculated_at": "timestamp"
  },
  "message": "Withholding tax breakdown retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVALID_TAX_TYPE | Tax type must be one of: income_tax, vat, paye, withholding |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | TAX_TYPE_NOT_APPLICABLE | This tax type does not apply to your account |
| 404 | NO_CALCULATIONS_FOUND | No calculations found for this tax type and period |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/tax/liability/history
**Description:** Retrieve tax liability history across previous periods.
**Auth:** Bearer Token

**Query parameters:**
- `tax_type` — optional
- `year` — optional
- `page` — optional, default: 1
- `limit` — optional, default: 12, max: 60

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "calculation_id": "uuid",
        "tax_type": "income_tax",
        "period_start": "2023-01-01",
        "period_end": "2023-12-31",
        "gross_income": 15000.00,
        "total_deductions": 2000.00,
        "taxable_income": 13000.00,
        "tax_liability": 1450.00,
        "calculated_at": "timestamp"
      }
    ],
    "pagination": { "total": 24, "page": 1, "limit": 12, "total_pages": 2 }
  },
  "message": "Tax liability history retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/tax/liability/recalculate
**Description:** Manually trigger a full tax liability recalculation for the current period.
**Auth:** Bearer Token
**Rate limit:** 10 requests per user per hour

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "recalculated": true,
    "tax_types_updated": ["income_tax", "vat"],
    "new_total_liability": 2450.00,
    "calculated_at": "timestamp"
  },
  "message": "Tax liability recalculated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 429 | RATE_LIMIT_EXCEEDED | Too many recalculation requests |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

## Group 10 — Tax Brackets and Rates

### GET /api/v1/tax/brackets
**Description:** Retrieve current Ghana income tax brackets and rates.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "tax_year": 2024,
    "currency": "GHS",
    "income_tax_brackets": [
      { "bracket": 1, "from": 0.00, "to": 4380.00, "rate": "0%", "description": "First GHS 4,380 annually" },
      { "bracket": 2, "from": 4381.00, "to": 5700.00, "rate": "5%", "description": "Next GHS 1,320" },
      { "bracket": 3, "from": 5701.00, "to": 7980.00, "rate": "10%", "description": "Next GHS 2,280" },
      { "bracket": 4, "from": 7981.00, "to": 49980.00, "rate": "17.5%", "description": "Next GHS 42,000" },
      { "bracket": 5, "from": 49981.00, "to": 240000.00, "rate": "25%", "description": "Next GHS 190,020" },
      { "bracket": 6, "from": 240001.00, "to": null, "rate": "35%", "description": "Exceeding GHS 240,000" }
    ],
    "last_updated": "timestamp"
  },
  "message": "Tax brackets retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Response heavily cacheable. Redis TTL 24 hours.
- Updated annually after Ghana's national budget.

---

### GET /api/v1/tax/rates
**Description:** Retrieve all current Ghana tax rates, thresholds, and constants across all tax types.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "tax_year": 2024,
    "currency": "GHS",
    "income_tax": {
      "brackets": "see GET /tax/brackets",
      "filing_deadline": "April 30"
    },
    "vat": {
      "standard_rate": "15%",
      "nhil_levy": "2.5%",
      "getfund_levy": "2.5%",
      "covid_levy": "1%",
      "effective_rate": "21%",
      "registration_threshold": 200000.00,
      "filing_frequency": "monthly",
      "filing_deadline": "Last working day of the following month"
    },
    "paye": {
      "brackets": "same as income tax brackets",
      "remittance_deadline": "15th of the following month",
      "annual_return_deadline": "March 31"
    },
    "withholding": {
      "rates": [
        { "category": "contractor_payment", "rate": "5%", "description": "Payments to resident contractors" },
        { "category": "rent", "rate": "8%", "description": "Rent paid to resident individuals" },
        { "category": "dividend", "rate": "8%", "description": "Dividends paid to residents" },
        { "category": "interest", "rate": "8%", "description": "Interest paid to residents" },
        { "category": "royalty", "rate": "10%", "description": "Royalties paid to residents" },
        { "category": "non_resident_contractor", "rate": "15%", "description": "Payments to non-resident contractors" }
      ]
    },
    "penalties": {
      "income_tax_late_filing": { "base_penalty": 200.00, "daily_penalty": 20.00 },
      "late_payment_rate": "10%",
      "late_payment_monthly_interest": "2%",
      "paye_late_remittance": "10%",
      "vat_late_filing": { "base_penalty": 500.00, "daily_penalty": 50.00 }
    },
    "last_updated": "timestamp"
  },
  "message": "Tax rates retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Single source of truth for all rate information displayed in the app.
- `withholding.rates[].category` maps directly to transaction `category` field for withholding-applicable transactions.
- Response heavily cacheable. Redis TTL 24 hours.

---

## Group 11 — VAT

### GET /api/v1/tax/vat/status
**Description:** Retrieve VAT registration status, threshold progress, and current month position.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "vat_registered": false,
    "vat_registration_no": null,
    "threshold": {
      "limit": 200000.00,
      "current_revenue": 145000.00,
      "percentage": 72.5,
      "estimated_months_to_threshold": 2,
      "warning": true,
      "warning_message": "string"
    },
    "current_month": {
      "month": 4, "year": 2024,
      "total_sales": 0.00, "output_vat": 0.00,
      "total_purchases": 0.00, "input_vat": 0.00,
      "net_vat_liability": 0.00,
      "due_date": null, "return_status": null
    }
  },
  "message": "VAT status retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `warning` is true when `current_revenue` exceeds 80% of threshold (GHS 160,000).
- `threshold` section hidden for VAT registered users. `current_month` null for non-registered users.

---

### POST /api/v1/tax/vat/register
**Description:** Confirm VAT registration and activate VAT mode. Called after registering with GRA externally.
**Auth:** Bearer Token

**Request body:**
```json
{
  "vat_registration_no": "string, required",
  "registration_date": "date, required, format: YYYY-MM-DD"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "vat_registered": true,
    "vat_registration_no": "string",
    "registration_date": "2024-04-30",
    "vat_mode_activated": true,
    "first_return_due": "2024-05-31",
    "deadlines_generated": 12,
    "effective_rate": "21%"
  },
  "message": "VAT registration confirmed. VAT mode is now active.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 400 | ALREADY_VAT_REGISTERED | Your account is already VAT registered |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Sets `user_tax_profiles.vat_registered = true`.
- 12 monthly VAT deadline records generated immediately.
- `vat_records` row created for current month.

---

### GET /api/v1/tax/vat/records
**Description:** Retrieve paginated list of all monthly VAT records.
**Auth:** Bearer Token

**Query parameters:**
- `year` — optional, defaults to current tax year
- `status` — optional, one of: `pending | submitted | accepted | rejected`
- `page` — optional, default: 1, limit: 12, max: 24

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "vat_id": "uuid",
        "month": 4, "year": 2024,
        "total_sales": 12000.00, "output_vat": 2520.00,
        "total_purchases": 4000.00, "input_vat": 840.00,
        "net_vat_liability": 1680.00,
        "return_status": "pending",
        "due_date": "2024-05-31",
        "submitted_at": null
      }
    ],
    "pagination": { "total": 4, "page": 1, "limit": 12, "total_pages": 1 }
  },
  "message": "VAT records retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | VAT_NOT_REGISTERED | You must be VAT registered to access VAT records |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/tax/vat/records/{month}/{year}
**Description:** Retrieve detailed VAT record for a specific month and year.
**Auth:** Bearer Token

**Path parameters:** `month` (1-12), `year`

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "vat_id": "uuid",
    "month": 4, "year": 2024,
    "total_sales": 12000.00, "output_vat": 2520.00,
    "total_purchases": 4000.00, "input_vat": 840.00,
    "net_vat_liability": 1680.00,
    "return_status": "pending",
    "due_date": "2024-05-31",
    "submitted_at": null,
    "contributing_transactions": { "sales_count": 18, "purchases_count": 7 }
  },
  "message": "VAT record retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVALID_MONTH | Month must be between 1 and 12 |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | VAT_NOT_REGISTERED | You must be VAT registered to access VAT records |
| 404 | VAT_RECORD_NOT_FOUND | No VAT record found for this month and year |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

## Group 12 — PAYE

### GET /api/v1/tax/paye/employees
**Description:** Retrieve all employees in the PAYE register.
**Auth:** Bearer Token

**Query parameters:**
- `status` — optional, one of: `active | inactive | all`, default: `active`
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "employee_id": "uuid",
        "full_name": "string",
        "position": "string | null",
        "gross_salary": 2500.00,
        "transport_allowance": 200.00,
        "housing_allowance": 300.00,
        "other_allowances": 0.00,
        "social_security_no": "string | null",
        "start_date": "2024-01-15",
        "is_active": true,
        "monthly_paye": 185.00,
        "created_at": "timestamp"
      }
    ],
    "pagination": { "total": 5, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "Employees retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | PAYE_NOT_APPLICABLE | PAYE management is not available on your current plan |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/tax/paye/employees
**Description:** Add a new employee to the PAYE register.
**Auth:** Bearer Token

**Request body:**
```json
{
  "full_name": "string, required",
  "position": "string, optional",
  "gross_salary": "number, required, greater than 0",
  "transport_allowance": "number, optional, default: 0",
  "housing_allowance": "number, optional, default: 0",
  "other_allowances": "number, optional, default: 0",
  "social_security_no": "string, optional",
  "start_date": "date, required, YYYY-MM-DD"
}
```

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "employee_id": "uuid",
    "full_name": "string",
    "gross_salary": 2500.00,
    "monthly_paye": 185.00,
    "ssnit_warning": false,
    "created_at": "timestamp"
  },
  "message": "Employee added successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | PAYE_NOT_APPLICABLE | PAYE management is not available on your current plan |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `ssnit_warning` is true when `social_security_no` is null.
- Adding first employee sets `user_tax_profiles.paye_registered = true`.
- PAYE deadline records generated if not already existing.

---

### GET /api/v1/tax/paye/employees/{id}
**Description:** Retrieve a single employee with PAYE history summary.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the employee

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "employee_id": "uuid",
    "full_name": "string",
    "position": "string | null",
    "gross_salary": 2500.00,
    "transport_allowance": 200.00,
    "housing_allowance": 300.00,
    "other_allowances": 0.00,
    "social_security_no": "string | null",
    "start_date": "2024-01-15",
    "end_date": "string | null",
    "is_active": true,
    "monthly_paye": 185.00,
    "paye_summary": {
      "total_months": 4,
      "total_paye_deducted": 740.00,
      "total_remitted": 555.00,
      "outstanding": 185.00
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "message": "Employee retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this employee record |
| 403 | PAYE_NOT_APPLICABLE | PAYE management is not available on your current plan |
| 404 | EMPLOYEE_NOT_FOUND | No employee found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/tax/paye/employees/{id}
**Description:** Update an employee's details. Triggers PAYE recalculation if salary or allowances change.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the employee

**Request body:**
```json
{
  "full_name": "string, optional",
  "position": "string, optional",
  "gross_salary": "number, optional",
  "transport_allowance": "number, optional",
  "housing_allowance": "number, optional",
  "other_allowances": "number, optional",
  "social_security_no": "string, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "employee_id": "uuid",
    "full_name": "string",
    "gross_salary": 3000.00,
    "monthly_paye": 235.00,
    "paye_recalculated": true,
    "updated_at": "timestamp"
  },
  "message": "Employee updated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this employee record |
| 403 | PAYE_NOT_APPLICABLE | PAYE management is not available on your current plan |
| 404 | EMPLOYEE_NOT_FOUND | No employee found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `start_date` cannot be changed after creation.
- Historical `paye_records` never updated — they retain salary figures valid at the time.

---

### DELETE /api/v1/tax/paye/employees/{id}
**Description:** Deactivate an employee. Soft delete — historical PAYE records preserved.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the employee

**Request body:**
```json
{
  "end_date": "date, required, YYYY-MM-DD"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "employee_id": "uuid",
    "full_name": "string",
    "is_active": false,
    "end_date": "2024-04-30"
  },
  "message": "Employee deactivated successfully. Historical PAYE records preserved.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | End date is required |
| 400 | ALREADY_INACTIVE | This employee is already inactive |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this employee record |
| 403 | PAYE_NOT_APPLICABLE | PAYE management is not available on your current plan |
| 404 | EMPLOYEE_NOT_FOUND | No employee found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- If last active employee deactivated, `user_tax_profiles.paye_registered` set back to false.

---

### GET /api/v1/tax/paye/records
**Description:** Retrieve paginated list of all monthly PAYE records.
**Auth:** Bearer Token

**Query parameters:**
- `month` — optional, integer 1-12
- `year` — optional, defaults to current tax year
- `employee_id` — optional, UUID
- `remitted` — optional, boolean
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "paye_id": "uuid",
        "employee_id": "uuid",
        "employee_name": "string",
        "month": 4, "year": 2024,
        "gross_salary": 2500.00,
        "taxable_salary": 2000.00,
        "paye_deducted": 185.00,
        "remitted": false,
        "remitted_at": null
      }
    ],
    "summary": {
      "total_paye_deducted": 740.00,
      "total_remitted": 555.00,
      "total_outstanding": 185.00
    },
    "pagination": { "total": 20, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "PAYE records retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | PAYE_NOT_APPLICABLE | PAYE management is not available on your current plan |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/tax/paye/records/{month}/{year}
**Description:** Retrieve PAYE summary for all employees for a specific month.
**Auth:** Bearer Token

**Path parameters:** `month` (1-12), `year`

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "month": 4, "year": 2024,
    "remittance_due_date": "2024-05-15",
    "days_until_due": 15,
    "employees": [
      {
        "paye_id": "uuid",
        "employee_id": "uuid",
        "employee_name": "string",
        "gross_salary": 2500.00,
        "taxable_salary": 2000.00,
        "paye_deducted": 185.00,
        "remitted": false
      }
    ],
    "totals": {
      "total_gross_salary": 7500.00,
      "total_taxable_salary": 6200.00,
      "total_paye_deducted": 555.00,
      "total_remitted": 0.00,
      "total_outstanding": 555.00
    }
  },
  "message": "Monthly PAYE summary retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVALID_MONTH | Month must be between 1 and 12 |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | PAYE_NOT_APPLICABLE | PAYE management is not available on your current plan |
| 404 | NO_PAYE_RECORDS | No PAYE records found for this month and year |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `days_until_due` is negative when remittance deadline has passed. Frontend should flag prominently.

---

### PUT /api/v1/tax/paye/records/{id}/remit
**Description:** Mark a specific PAYE record as remitted to GRA.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the PAYE record

**Request body:**
```json
{
  "remitted_at": "timestamp, optional, defaults to NOW()"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "paye_id": "uuid",
    "employee_name": "string",
    "month": 4, "year": 2024,
    "paye_deducted": 185.00,
    "remitted": true,
    "remitted_at": "timestamp"
  },
  "message": "PAYE record marked as remitted.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | ALREADY_REMITTED | This PAYE record has already been marked as remitted |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this PAYE record |
| 403 | PAYE_NOT_APPLICABLE | PAYE management is not available on your current plan |
| 404 | PAYE_RECORD_NOT_FOUND | No PAYE record found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/tax/paye/annual-return/{year}
**Description:** Retrieve annual PAYE return summary for a given year. Used for March 31st annual return submission.
**Auth:** Bearer Token

**Path parameter:** `year` — integer

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "submission_deadline": "2025-03-31",
    "days_until_deadline": 335,
    "employees": [
      {
        "employee_id": "uuid",
        "full_name": "string",
        "social_security_no": "string | null",
        "monthly_breakdown": [
          { "month": 1, "gross_salary": 2500.00, "taxable_salary": 2000.00, "paye_deducted": 185.00, "remitted": true }
        ],
        "annual_totals": {
          "total_gross_salary": 30000.00,
          "total_taxable_salary": 24000.00,
          "total_paye_deducted": 2220.00,
          "total_remitted": 2220.00,
          "outstanding": 0.00
        }
      }
    ],
    "grand_totals": {
      "total_employees": 3,
      "total_gross_salary": 90000.00,
      "total_paye_deducted": 6660.00,
      "total_remitted": 6660.00,
      "outstanding": 0.00
    },
    "ready_for_submission": true
  },
  "message": "Annual PAYE return retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVALID_YEAR | Year is not valid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | PAYE_NOT_APPLICABLE | PAYE management is not available on your current plan |
| 404 | NO_PAYE_RECORDS | No PAYE records found for this year |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `ready_for_submission` is true when all monthly records have `remitted = true` and `outstanding = 0`.

---

## Group 13 — Withholding Tax

### GET /api/v1/tax/withholding/transactions
**Description:** Retrieve all transactions flagged as withholding-applicable.
**Auth:** Bearer Token

**Query parameters:**
- `remitted` — optional, boolean
- `date_from` — optional, `YYYY-MM-DD`
- `date_to` — optional, `YYYY-MM-DD`
- `category` — optional, one of: `contractor_payment | rent | dividend | interest | royalty | non_resident_contractor`
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transaction_id": "uuid",
        "description": "string",
        "category": "contractor_payment",
        "transaction_date": "2024-04-15",
        "amount": 1000.00,
        "withholding_rate": "5%",
        "withholding_amount": 50.00,
        "remitted": false,
        "remitted_at": null
      }
    ],
    "summary": {
      "total_withheld": 250.00,
      "total_remitted": 100.00,
      "total_outstanding": 150.00
    },
    "pagination": { "total": 8, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "Withholding tax transactions retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more query parameters are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/tax/withholding/transactions/{id}/remit
**Description:** Mark a withholding tax transaction as remitted to GRA.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the transaction

**Request body:**
```json
{
  "remitted_at": "timestamp, optional, defaults to NOW()"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "description": "string",
    "category": "contractor_payment",
    "amount": 1000.00,
    "withholding_amount": 50.00,
    "remitted": true,
    "remitted_at": "timestamp"
  },
  "message": "Withholding tax marked as remitted.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | NOT_WITHHOLDING_TRANSACTION | This transaction is not flagged as withholding-applicable |
| 400 | ALREADY_REMITTED | This withholding transaction has already been marked as remitted |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this transaction |
| 404 | TRANSACTION_NOT_FOUND | No withholding transaction found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Updates `withholding_remitted` and `withholding_remitted_at` on the transactions table.
- Once remitted this cannot be undone.

---

## Group 14 — Tax Returns

### GET /api/v1/tax/returns
**Description:** Retrieve paginated list of all tax returns.
**Auth:** Bearer Token

**Query parameters:**
- `tax_type` — optional
- `status` — optional, one of: `draft | submitted | accepted | rejected`
- `year` — optional
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "returns": [
      {
        "return_id": "uuid",
        "tax_type": "income_tax",
        "tax_year": 2024,
        "period_start": "2024-01-01",
        "period_end": "2024-12-31",
        "tax_liability": 1800.00,
        "status": "draft",
        "submitted_at": null,
        "gra_reference": null,
        "created_at": "timestamp"
      }
    ],
    "pagination": { "total": 6, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "Tax returns retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/tax/returns/generate
**Description:** Auto-generate a pre-filled tax return from tracked transaction data.
**Auth:** Bearer Token

**Request body:**
```json
{
  "tax_type": "string, required, one of: income_tax | vat | paye | withholding",
  "tax_year": "integer, required",
  "month": "integer, optional, required for vat and paye, 1-12"
}
```

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "return_id": "uuid",
    "tax_type": "income_tax",
    "tax_year": 2024,
    "period_start": "2024-01-01",
    "period_end": "2024-12-31",
    "gross_income": 18000.00,
    "total_deductions": 3000.00,
    "taxable_income": 15000.00,
    "tax_liability": 1800.00,
    "status": "draft",
    "created_at": "timestamp"
  },
  "message": "Tax return generated. Please review before submitting.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | MONTH_REQUIRED | Month is required for VAT and PAYE returns |
| 400 | RETURN_ALREADY_EXISTS | A return already exists for this tax type and period |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | TAX_TYPE_NOT_APPLICABLE | This tax type does not apply to your account |
| 404 | NO_TRANSACTIONS_FOUND | No transactions found for this period |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/tax/returns/{id}
**Description:** Retrieve a specific tax return with full details.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the return

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "return_id": "uuid",
    "tax_type": "income_tax",
    "tax_year": 2024,
    "period_start": "2024-01-01",
    "period_end": "2024-12-31",
    "gross_income": 18000.00,
    "total_deductions": 3000.00,
    "taxable_income": 15000.00,
    "tax_liability": 1800.00,
    "status": "draft",
    "submitted_at": null,
    "gra_reference": null,
    "payment": { "paid": false, "payment_id": null, "amount_paid": null, "paid_at": null },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "message": "Tax return retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this return |
| 404 | RETURN_NOT_FOUND | No tax return found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/tax/returns/{id}/preview
**Description:** Formatted preview of a return as it will appear when submitted to GRA.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the return

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "return_id": "uuid",
    "taxpayer": {
      "full_name": "string",
      "tin": "string | null",
      "phone": "string",
      "region": "string",
      "taxpayer_category": "string"
    },
    "return_details": {
      "tax_type": "income_tax",
      "tax_year": 2024,
      "period_start": "2024-01-01",
      "period_end": "2024-12-31"
    },
    "financials": {
      "gross_income": 18000.00,
      "total_deductions": 3000.00,
      "taxable_income": 15000.00,
      "tax_liability": 1800.00,
      "bracket_breakdown": [
        { "bracket": "GHS 0 - GHS 4,380", "rate": "0%", "tax": 0.00 }
      ]
    },
    "warnings": [
      { "code": "TIN_MISSING", "message": "Your TIN is not set. You can still submit but GRA may follow up." }
    ],
    "ready_to_submit": true
  },
  "message": "Tax return preview generated.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | RETURN_ALREADY_SUBMITTED | This return has already been submitted |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this return |
| 404 | RETURN_NOT_FOUND | No tax return found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `warnings` are non-blocking issues. `ready_to_submit` is false only for blocking issues.
- Only works on returns with `status = draft`.

---

### PUT /api/v1/tax/returns/{id}/submit
**Description:** Mark a return as submitted after completing submission on the GRA Taxpayers Portal.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the return

**Request body:**
```json
{
  "gra_reference": "string, optional",
  "submitted_at": "timestamp, optional, defaults to NOW()"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "return_id": "uuid",
    "tax_type": "string",
    "status": "submitted",
    "gra_reference": "string | null",
    "submitted_at": "timestamp",
    "next_step": "Proceed to payment to complete your tax obligation."
  },
  "message": "Tax return marked as submitted.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | RETURN_NOT_DRAFT | Only draft returns can be submitted |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this return |
| 404 | RETURN_NOT_FOUND | No tax return found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Does not submit to GRA directly. Records user's confirmation of portal submission.
- `tax_deadlines` record for this period automatically marked `completed = true`.

---

### PUT /api/v1/tax/returns/{id}/amend
**Description:** Amend a rejected return. Resets to draft status.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the return

**Request body:**
```json
{
  "amendment_reason": "string, required"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "return_id": "uuid",
    "tax_type": "string",
    "status": "draft",
    "amendment_reason": "string",
    "amended_at": "timestamp"
  },
  "message": "Tax return reset to draft. Please correct the figures and resubmit.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | RETURN_NOT_REJECTED | Only rejected returns can be amended |
| 400 | VALIDATION_ERROR | Amendment reason is required |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this return |
| 404 | RETURN_NOT_FOUND | No tax return found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

## Group 15 — Tax Deadlines

### GET /api/v1/tax/deadlines
**Description:** Retrieve all tax deadlines — upcoming and past.
**Auth:** Bearer Token

**Query parameters:**
- `tax_type` — optional
- `completed` — optional, boolean
- `year` — optional, defaults to current
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "deadlines": [
      {
        "deadline_id": "uuid",
        "tax_type": "income_tax",
        "description": "Personal Income Tax Return — 2024",
        "period_start": "2024-01-01",
        "period_end": "2024-12-31",
        "deadline_date": "2025-04-30",
        "days_until_due": 335,
        "completed": false,
        "reminder_sent": true,
        "linked_return": { "return_id": "uuid", "status": "draft" }
      }
    ],
    "pagination": { "total": 14, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "Tax deadlines retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `days_until_due` negative when deadline has passed. Frontend shows overdue in red.
- `linked_return` null when no return generated yet for this period.
- Sorted by `deadline_date` ascending — soonest first.

---

### GET /api/v1/tax/deadlines/upcoming
**Description:** Retrieve only upcoming incomplete deadlines within a configurable window.
**Auth:** Bearer Token

**Query parameters:**
- `days` — optional, default: 90, max: 365

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "deadlines": [
      {
        "deadline_id": "uuid",
        "tax_type": "vat",
        "description": "VAT Return — April 2024",
        "deadline_date": "2024-05-31",
        "days_until_due": 31,
        "urgency": "normal | warning | critical",
        "completed": false,
        "linked_return": { "return_id": "uuid", "status": "draft" }
      }
    ],
    "total": 3
  },
  "message": "Upcoming deadlines retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | Days parameter must be between 1 and 365 |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `urgency`: `critical` (7 days or fewer), `warning` (8-30 days), `normal` (more than 30 days).
- Overdue deadlines always included regardless of `days` parameter.
- Most frequently called deadline endpoint. Redis cache TTL 5 minutes.

---

### PUT /api/v1/tax/deadlines/{id}/complete
**Description:** Manually mark a deadline as completed.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the deadline

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "deadline_id": "uuid",
    "tax_type": "string",
    "description": "string",
    "deadline_date": "2025-04-30",
    "completed": true,
    "completed_at": "timestamp"
  },
  "message": "Deadline marked as complete.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | ALREADY_COMPLETED | This deadline is already marked as complete |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this deadline |
| 404 | DEADLINE_NOT_FOUND | No deadline found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Normally set automatically when `PUT /tax/returns/{id}/submit` is called.
- Available manually for users who filed directly on GRA portal without going through TaxPadi.

---

## Group 16 — Penalties

### GET /api/v1/penalties
**Description:** Retrieve paginated list of all penalties — active and resolved.
**Auth:** Bearer Token

**Query parameters:**
- `tax_type` — optional
- `resolved` — optional, boolean, default: false
- `year` — optional
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "penalties": [
      {
        "penalty_id": "uuid",
        "tax_type": "income_tax",
        "deadline_date": "2024-04-30",
        "days_late": 12,
        "base_penalty": 200.00,
        "daily_penalty": 240.00,
        "interest_amount": 36.00,
        "total_penalty": 476.00,
        "resolved": false,
        "resolved_at": null,
        "linked_return": { "return_id": "uuid", "status": "draft" }
      }
    ],
    "summary": {
      "total_active_penalties": 1,
      "total_outstanding": 476.00,
      "total_resolved": 0.00
    },
    "pagination": { "total": 1, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "Penalties retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `daily_penalty` in response is `days_late` multiplied by per-day rate — cumulative not per-day.
- Active penalties first, soonest deadline first.

---

### GET /api/v1/penalties/{id}
**Description:** Retrieve a single penalty with full breakdown and guidance.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the penalty

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "penalty_id": "uuid",
    "tax_type": "income_tax",
    "deadline_date": "2024-04-30",
    "filing_date": null,
    "days_late": 12,
    "base_penalty": 200.00,
    "daily_penalty": 240.00,
    "interest_amount": 36.00,
    "total_penalty": 476.00,
    "daily_rate": 20.00,
    "penalty_grows_by_daily": 20.00,
    "resolved": false,
    "linked_return": { "return_id": "uuid | null", "status": "draft | null" },
    "guidance": {
      "message": "You are 12 days late. Your penalty is growing by GHS 20.00 every day. Filing today will stop the penalty from growing.",
      "steps": [
        "Generate your income tax return for 2024",
        "Review and submit on the GRA Taxpayers Portal",
        "Pay your tax liability and penalty through TaxPadi",
        "Mark the penalty as resolved"
      ]
    }
  },
  "message": "Penalty retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this penalty |
| 404 | PENALTY_NOT_FOUND | No penalty found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/penalties/preview/{tax_type}
**Description:** Preview current penalty for a given tax type in real time without waiting for nightly job.
**Auth:** Bearer Token

**Path parameter:** `tax_type` — one of: `income_tax | vat | paye | withholding`

**Query parameters:**
- `month` — optional, required for `vat` and `paye`
- `year` — optional, defaults to current

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "tax_type": "income_tax",
    "deadline_date": "2024-04-30",
    "days_late": 12,
    "base_penalty": 200.00,
    "daily_penalty": 240.00,
    "interest_amount": 36.00,
    "total_penalty": 476.00,
    "penalty_active": true,
    "existing_penalty_id": "uuid | null"
  },
  "message": "Penalty preview calculated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVALID_TAX_TYPE | Invalid tax type |
| 400 | MONTH_REQUIRED | Month is required for VAT and PAYE penalty previews |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | TAX_TYPE_NOT_APPLICABLE | This tax type does not apply to your account |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Computes in real time using hardcoded GRA rates. Creates no records.
- `penalty_active` false when deadline has not yet passed.

---

### PUT /api/v1/penalties/{id}/resolve
**Description:** Mark a penalty as resolved after filing and paying.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the penalty

**Request body:**
```json
{
  "resolved_at": "timestamp, optional, defaults to NOW()"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "penalty_id": "uuid",
    "tax_type": "string",
    "total_penalty": 476.00,
    "resolved": true,
    "resolved_at": "timestamp"
  },
  "message": "Penalty marked as resolved.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | ALREADY_RESOLVED | This penalty has already been resolved |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this penalty |
| 404 | PENALTY_NOT_FOUND | No penalty found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

## Group 17 — Payments

### GET /api/v1/payments
**Description:** Retrieve paginated list of all tax payments.
**Auth:** Bearer Token

**Query parameters:**
- `status` — optional, one of: `pending | successful | failed`
- `payment_method` — optional
- `date_from` — optional, `YYYY-MM-DD`
- `date_to` — optional, `YYYY-MM-DD`
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "payment_id": "uuid",
        "amount": 1800.00,
        "payment_method": "momo",
        "payment_reference": "string | null",
        "status": "successful",
        "paid_at": "timestamp | null",
        "return": { "return_id": "uuid", "tax_type": "income_tax", "tax_year": 2024 },
        "penalty": null,
        "created_at": "timestamp"
      }
    ],
    "summary": { "total_paid": 1800.00, "total_pending": 0.00, "total_failed": 0.00 },
    "pagination": { "total": 3, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "Payments retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/payments/initiate
**Description:** Initiate a tax payment via MoMo, bank card, USSD, or vault.
**Auth:** Bearer Token

**Request body:**
```json
{
  "return_id": "uuid, required if penalty_id not provided",
  "penalty_id": "uuid, required if return_id not provided",
  "amount": "number, required, greater than 0",
  "payment_method": "string, required, one of: momo | bank_card | ussd | vault",
  "momo_number": "string, required if momo",
  "momo_provider": "string, required if momo, one of: mtn | telecel | airteltigo"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "amount": 1800.00,
    "payment_method": "momo",
    "status": "pending",
    "momo_prompt_sent": true,
    "message": "A payment prompt has been sent. Please approve it on your phone.",
    "expires_in_seconds": 120
  },
  "message": "Payment initiated. Please approve the prompt on your phone.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | RETURN_OR_PENALTY_REQUIRED | Either return_id or penalty_id must be provided |
| 400 | ALREADY_PAID | This return or penalty has already been paid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 402 | INSUFFICIENT_VAULT_BALANCE | Vault balance is insufficient |
| 402 | PAYMENT_INITIATION_FAILED | Payment could not be initiated |
| 404 | RETURN_NOT_FOUND | No return found with this ID |
| 404 | PENALTY_NOT_FOUND | No penalty found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/payments/{id}
**Description:** Retrieve a specific payment by ID.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the payment

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "amount": 1800.00,
    "payment_method": "momo",
    "payment_reference": "string | null",
    "status": "successful",
    "paid_at": "timestamp | null",
    "return": { "return_id": "uuid", "tax_type": "income_tax", "tax_year": 2024, "period_start": "2024-01-01", "period_end": "2024-12-31" },
    "penalty": null,
    "certificate": { "certificate_id": "uuid | null", "document_ref": "string | null" },
    "created_at": "timestamp"
  },
  "message": "Payment retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this payment |
| 404 | PAYMENT_NOT_FOUND | No payment found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/payments/{id}/confirm
**Description:** Confirm a payment after MoMo callback or manual confirmation.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the payment

**Request body:**
```json
{
  "payment_reference": "string, required",
  "status": "string, required, one of: successful | failed"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "status": "successful",
    "payment_reference": "string",
    "paid_at": "timestamp",
    "certificate_generated": true,
    "certificate": { "certificate_id": "uuid", "document_ref": "TXPD-2024-00847" }
  },
  "message": "Payment confirmed. Your compliance certificate has been generated.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | PAYMENT_NOT_PENDING | Only pending payments can be confirmed |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this payment |
| 404 | PAYMENT_NOT_FOUND | No payment found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- On `status = successful` a `compliance_certificates` record is created automatically.
- On `status = failed` and payment was from vault, vault balance is restored via a credit `vault_transactions` record.

---

### GET /api/v1/payments/{id}/status
**Description:** Check current status of a pending payment.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the payment

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "status": "pending | successful | failed",
    "payment_reference": "string | null",
    "paid_at": "timestamp | null",
    "message": "Your payment is still being processed."
  },
  "message": "Payment status retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this payment |
| 404 | PAYMENT_NOT_FOUND | No payment found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Frontend polls every 5 seconds, max 24 polls (2 minutes total). Stop polling when status changes from `pending`.

---

### GET /api/v1/payments/{id}/certificate
**Description:** Retrieve compliance certificate associated with a confirmed payment.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the payment

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "certificate_id": "uuid",
    "document_ref": "TXPD-2024-00847",
    "taxpayer": { "full_name": "string", "tin": "string | null", "phone": "string" },
    "tax_type": "income_tax",
    "period_start": "2024-01-01",
    "period_end": "2024-12-31",
    "amount_paid": 1800.00,
    "payment_reference": "string",
    "issued_at": "timestamp"
  },
  "message": "Compliance certificate retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this payment |
| 404 | PAYMENT_NOT_FOUND | No payment found with this ID |
| 404 | CERTIFICATE_NOT_FOUND | No certificate has been generated for this payment yet |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

## Group 18 — Compliance Certificates

### GET /api/v1/certificates
**Description:** Retrieve paginated list of all compliance certificates.
**Auth:** Bearer Token

**Query parameters:**
- `tax_type` — optional
- `year` — optional
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "certificate_id": "uuid",
        "document_ref": "TXPD-2024-00847",
        "tax_type": "income_tax",
        "period_start": "2024-01-01",
        "period_end": "2024-12-31",
        "amount_paid": 1800.00,
        "issued_at": "timestamp"
      }
    ],
    "pagination": { "total": 5, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "Compliance certificates retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/certificates/{id}
**Description:** Retrieve a single compliance certificate.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the certificate

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "certificate_id": "uuid",
    "document_ref": "TXPD-2024-00847",
    "taxpayer": { "full_name": "string", "tin": "string | null", "phone": "string" },
    "tax_type": "income_tax",
    "period_start": "2024-01-01",
    "period_end": "2024-12-31",
    "amount_paid": 1800.00,
    "payment_reference": "string",
    "issued_at": "timestamp"
  },
  "message": "Compliance certificate retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this certificate |
| 404 | CERTIFICATE_NOT_FOUND | No certificate found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/certificates/{id}/download
**Description:** Retrieve a downloadable PDF URL for a compliance certificate.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the certificate

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "certificate_id": "uuid",
    "document_ref": "TXPD-2024-00847",
    "pdf_url": "string, pre-signed S3 URL valid for 15 minutes",
    "expires_at": "timestamp"
  },
  "message": "Certificate download URL generated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this certificate |
| 404 | CERTIFICATE_NOT_FOUND | No certificate found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Pre-signed S3 URL valid for 15 minutes. Call again for a fresh URL after expiry.

---

## Group 19 — Savings Vault

### GET /api/v1/vault
**Description:** Retrieve vault balance and MoMo link details.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "vault_id": "uuid",
    "balance": 850.00,
    "linked_momo_number": "+233XXXXXXXXX | null",
    "linked_momo_provider": "mtn | telecel | airteltigo | null",
    "total_contributed": 1200.00,
    "total_withdrawn": 350.00,
    "momo_linked": true,
    "target": {
      "current_tax_liability": 1800.00,
      "percentage_saved": 47.2,
      "amount_remaining": 950.00
    }
  },
  "message": "Vault retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | VAULT_NOT_FOUND | Vault not found for this user |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/vault/link
**Description:** Link or update the MoMo number for the vault.
**Auth:** Bearer Token

**Request body:**
```json
{
  "momo_number": "string, required",
  "momo_provider": "string, required, one of: mtn | telecel | airteltigo"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "vault_id": "uuid",
    "linked_momo_number": "+233XXXXXXXXX",
    "linked_momo_provider": "mtn",
    "momo_linked": true,
    "updated_at": "timestamp"
  },
  "message": "MoMo number linked to your vault successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVALID_MOMO_NUMBER | The MoMo number provided is not valid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/vault/contribute
**Description:** Initiate a contribution to the Tax Savings Vault.
**Auth:** Bearer Token

**Request body:**
```json
{
  "amount": "number, required, greater than 0",
  "trigger": "string, required, one of: manual | suggested"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "vault_transaction_id": "uuid",
    "amount": 75.00,
    "trigger": "suggested",
    "status": "pending",
    "momo_prompt_sent": true,
    "message": "A payment prompt of GHS 75.00 has been sent. Please approve it.",
    "new_balance_on_confirmation": 925.00
  },
  "message": "Vault contribution initiated.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | MOMO_NOT_LINKED | Please link a MoMo number to your vault before contributing |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 402 | CONTRIBUTION_FAILED | Contribution could not be initiated |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/vault/transactions
**Description:** Retrieve paginated history of all vault transactions.
**Auth:** Bearer Token

**Query parameters:**
- `type` — optional, one of: `credit | debit`
- `status` — optional, one of: `pending | successful | failed`
- `trigger` — optional, one of: `manual | suggested | tax_payment`
- `date_from` — optional, `YYYY-MM-DD`
- `date_to` — optional, `YYYY-MM-DD`
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "vault_transaction_id": "uuid",
        "type": "credit",
        "amount": 75.00,
        "trigger": "suggested",
        "momo_reference": "string | null",
        "status": "successful",
        "created_at": "timestamp",
        "confirmed_at": "timestamp | null"
      }
    ],
    "summary": { "total_credited": 1200.00, "total_debited": 350.00, "current_balance": 850.00 },
    "pagination": { "total": 16, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "Vault transactions retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/vault/suggestion
**Description:** Retrieve suggested vault contribution based on latest income and current tax liability.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "suggested_amount": 75.00,
    "based_on": {
      "latest_income": 500.00,
      "marginal_tax_rate": "17.5%",
      "current_liability": 1800.00,
      "already_saved": 850.00,
      "remaining_to_save": 950.00
    },
    "message": "Based on your latest income of GHS 500.00 we suggest saving GHS 75.00 toward your tax bill."
  },
  "message": "Vault suggestion retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | NO_INCOME_TRANSACTIONS | No income transactions found to base a suggestion on |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- If `already_saved` exceeds `current_liability`, `suggested_amount` is zero.

---

## Group 20 — Invoices

### GET /api/v1/invoices
**Description:** Retrieve paginated list of all invoices.
**Auth:** Bearer Token

**Query parameters:**
- `status` — optional, one of: `unpaid | paid | cancelled`
- `date_from` — optional, `YYYY-MM-DD`
- `date_to` — optional, `YYYY-MM-DD`
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "invoice_id": "uuid",
        "invoice_ref": "INV-2024-00123",
        "client_name": "string",
        "total_amount": 1200.00,
        "status": "unpaid",
        "due_date": "2024-05-15",
        "days_until_due": 15,
        "sent_via": "whatsapp | null",
        "created_at": "timestamp"
      }
    ],
    "pagination": { "total": 12, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "Invoices retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/invoices/stats
**Description:** Retrieve invoice statistics.
**Auth:** Bearer Token

**Query parameters:**
- `year` — optional, defaults to current year
- `month` — optional, integer 1-12

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "total_invoiced": 15000.00,
    "total_paid": 10000.00,
    "total_outstanding": 4000.00,
    "total_overdue": 1000.00,
    "invoice_count": { "total": 12, "paid": 8, "unpaid": 3, "overdue": 1, "cancelled": 0 },
    "average_payment_days": 12
  },
  "message": "Invoice statistics retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/invoices
**Description:** Create a new invoice for a client.
**Auth:** Bearer Token

**Request body:**
```json
{
  "client_name": "string, required",
  "client_email": "string, optional",
  "client_phone": "string, optional",
  "description": "string, required",
  "subtotal": "number, required, greater than 0",
  "due_date": "date, optional, YYYY-MM-DD"
}
```

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid",
    "invoice_ref": "INV-2024-00123",
    "client_name": "string",
    "subtotal": 1000.00,
    "vat_amount": 210.00,
    "total_amount": 1210.00,
    "status": "unpaid",
    "due_date": "2024-05-15",
    "pdf_url": "string",
    "created_at": "timestamp"
  },
  "message": "Invoice created successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `invoice_ref` auto-generated in format `INV-{YEAR}-{SEQUENCE}`.
- `vat_amount` auto-calculated at 21% if user is VAT registered. Zero otherwise.
- PDF generated immediately and uploaded to S3.

---

### GET /api/v1/invoices/{id}
**Description:** Retrieve a specific invoice.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the invoice

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid",
    "invoice_ref": "INV-2024-00123",
    "client_name": "string",
    "client_email": "string | null",
    "client_phone": "string | null",
    "description": "string",
    "subtotal": 1000.00,
    "vat_amount": 210.00,
    "total_amount": 1210.00,
    "status": "unpaid",
    "due_date": "2024-05-15",
    "paid_at": null,
    "sent_via": "string | null",
    "sent_at": "timestamp | null",
    "pdf_url": "string",
    "transaction_id": "uuid | null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "message": "Invoice retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this invoice |
| 404 | INVOICE_NOT_FOUND | No invoice found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/invoices/{id}
**Description:** Update an unpaid invoice. Regenerates PDF after update.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the invoice

**Request body:**
```json
{
  "client_name": "string, optional",
  "client_email": "string, optional",
  "client_phone": "string, optional",
  "description": "string, optional",
  "subtotal": "number, optional, greater than 0",
  "due_date": "date, optional, YYYY-MM-DD"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid",
    "invoice_ref": "string",
    "subtotal": 1200.00,
    "vat_amount": 252.00,
    "total_amount": 1452.00,
    "pdf_url": "string, new URL",
    "updated_at": "timestamp"
  },
  "message": "Invoice updated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVOICE_NOT_EDITABLE | Only unpaid invoices can be edited |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this invoice |
| 404 | INVOICE_NOT_FOUND | No invoice found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/invoices/{id}/paid
**Description:** Mark invoice as paid. Automatically creates income transaction.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the invoice

**Request body:**
```json
{
  "paid_at": "timestamp, optional, defaults to NOW()"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid",
    "invoice_ref": "string",
    "status": "paid",
    "paid_at": "timestamp",
    "transaction_created": true,
    "transaction_id": "uuid",
    "tax_liability_updated": true,
    "vault_suggestion": {
      "suggested": true,
      "suggested_amount": 212.00,
      "message": "Consider saving GHS 212.00 for taxes on this income"
    }
  },
  "message": "Invoice marked as paid. Income has been logged automatically.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVOICE_NOT_UNPAID | Only unpaid invoices can be marked as paid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this invoice |
| 404 | INVOICE_NOT_FOUND | No invoice found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Creates `transactions` record with `type = income`, `entry_method = invoice`.
- Tax calculation engine triggered immediately.

---

### PUT /api/v1/invoices/{id}/cancel
**Description:** Cancel an unpaid invoice.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the invoice

**Request body:**
```json
{
  "reason": "string, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid",
    "invoice_ref": "string",
    "status": "cancelled",
    "cancelled_at": "timestamp"
  },
  "message": "Invoice cancelled successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | INVOICE_NOT_CANCELLABLE | Only unpaid invoices can be cancelled |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this invoice |
| 404 | INVOICE_NOT_FOUND | No invoice found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/invoices/{id}/pdf
**Description:** Retrieve PDF download URL for an invoice.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the invoice

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid",
    "invoice_ref": "INV-2024-00123",
    "pdf_url": "string, pre-signed S3 URL valid for 15 minutes",
    "expires_at": "timestamp"
  },
  "message": "Invoice PDF URL generated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this invoice |
| 404 | INVOICE_NOT_FOUND | No invoice found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/invoices/{id}/send
**Description:** Send an invoice to the client via WhatsApp, email, or download link.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the invoice

**Request body:**
```json
{
  "channel": "string, required, one of: whatsapp | email | download"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid",
    "invoice_ref": "string",
    "sent_via": "whatsapp",
    "sent_at": "timestamp",
    "delivery": {
      "whatsapp_link": "string | null",
      "download_url": "string | null"
    }
  },
  "message": "Invoice sent successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | NO_CLIENT_PHONE | Client phone number is required to send via WhatsApp |
| 400 | NO_CLIENT_EMAIL | Client email is required to send via email |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this invoice |
| 404 | INVOICE_NOT_FOUND | No invoice found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `whatsapp` generates a deep link containing the PDF URL.
- `email` sends PDF as attachment to `client_email`.
- `download` returns a pre-signed S3 URL.

---

## Group 21 — TaxBot

### POST /api/v1/taxbot/ask
**Description:** Submit a question to TaxBot and receive a plain-language Ghana tax answer.
**Auth:** Bearer Token
**Rate limit:** 50 questions per user per day

**Request body:**
```json
{
  "question": "string, required, maximum 500 characters"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "conversation_id": "uuid",
    "question": "string",
    "answer": "string",
    "created_at": "timestamp"
  },
  "message": "TaxBot response generated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | Question must not exceed 500 characters |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 429 | RATE_LIMIT_EXCEEDED | Daily TaxBot limit reached. Try again tomorrow |
| 503 | TAXBOT_UNAVAILABLE | TaxBot is temporarily unavailable |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Forwarded to Anthropic Claude API with system prompt constraining to Ghana tax law.
- Question and answer stored in `taxbot_conversations`.

---

### GET /api/v1/taxbot/history
**Description:** Retrieve past TaxBot conversations.
**Auth:** Bearer Token

**Query parameters:**
- `page` — optional, default: 1
- `limit` — optional, default: 20, max: 50

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversation_id": "uuid",
        "question": "string",
        "answer": "string",
        "created_at": "timestamp"
      }
    ],
    "pagination": { "total": 45, "page": 1, "limit": 20, "total_pages": 3 }
  },
  "message": "TaxBot history retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

## Group 22 — Reports and Export

### GET /api/v1/reports/summary
**Description:** Retrieve financial summary for a given period.
**Auth:** Bearer Token

**Query parameters:**
- `period` — optional, one of: `week | month | quarter | year`, default: `month`
- `date_from` — optional, `YYYY-MM-DD`, overrides `period`
- `date_to` — optional, `YYYY-MM-DD`, overrides `period`

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "period_start": "2024-04-01",
    "period_end": "2024-04-30",
    "income": {
      "total": 8000.00,
      "by_category": [
        { "category": "consulting_income", "total": 6000.00, "count": 4 }
      ]
    },
    "expenses": {
      "total": 2500.00,
      "deductible_total": 1800.00,
      "by_category": [
        { "category": "supplies", "total": 800.00, "count": 3 }
      ]
    },
    "net_profit": 5500.00,
    "tax_liability": { "income_tax": 450.00, "vat": 0.00, "total": 450.00 }
  },
  "message": "Financial summary retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more query parameters are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/reports/export
**Description:** Export financial history as a downloadable file.
**Auth:** Bearer Token

**Query parameters:**
- `format` — required, one of: `pdf | excel | json`
- `date_from` — required, `YYYY-MM-DD`
- `date_to` — required, `YYYY-MM-DD`
- `include_transactions` — optional, boolean, default: true
- `include_tax_returns` — optional, boolean, default: true
- `include_payments` — optional, boolean, default: true
- `include_certificates` — optional, boolean, default: true

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "export_id": "uuid",
    "format": "pdf",
    "file_url": "string, pre-signed S3 URL valid for 30 minutes",
    "expires_at": "timestamp",
    "period_start": "2024-01-01",
    "period_end": "2024-12-31",
    "records_included": { "transactions": 245, "tax_returns": 4, "payments": 4, "certificates": 4 }
  },
  "message": "Export generated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more query parameters are invalid |
| 400 | DATE_RANGE_TOO_LARGE | Export date range cannot exceed 3 years |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/reports/income-statement
**Description:** Generate a Verified Income Statement for loan applications.
**Auth:** Bearer Token

**Query parameters:**
- `months` — optional, default: 6, max: 12

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "statement_id": "uuid",
    "period_start": "2023-11-01",
    "period_end": "2024-04-30",
    "months_covered": 6,
    "taxpayer": { "full_name": "string", "tin": "string | null", "phone": "string", "taxpayer_category": "string" },
    "monthly_summary": [
      { "month": "April 2024", "total_income": 8000.00, "total_expenses": 2500.00, "net_profit": 5500.00, "tax_compliant": true }
    ],
    "averages": { "average_monthly_income": 7200.00, "average_monthly_expenses": 2100.00, "average_monthly_profit": 5100.00 },
    "tax_compliance": { "all_returns_filed": true, "all_payments_made": true, "compliance_score": "Good" },
    "pdf_url": "string, pre-signed S3 URL valid for 30 minutes",
    "generated_at": "timestamp"
  },
  "message": "Income statement generated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | Months must be between 1 and 12 |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | INSUFFICIENT_DATA | Not enough transaction history to generate an income statement |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/reports/tax-history
**Description:** Retrieve year-by-year tax filing and payment compliance history.
**Auth:** Bearer Token

**Query parameters:**
- `year_from` — optional
- `year_to` — optional, defaults to current year

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "year": 2024,
        "tax_types": [
          { "tax_type": "income_tax", "return_status": "submitted", "tax_liability": 1800.00, "amount_paid": 1800.00, "filed_on": "timestamp", "paid_on": "timestamp", "compliant": true },
          { "tax_type": "vat", "months_filed": 4, "months_outstanding": 0, "total_liability": 6720.00, "total_paid": 6720.00, "compliant": true }
        ],
        "overall_compliant": true
      }
    ]
  },
  "message": "Tax history retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

## Group 23 — Referral Offers

### GET /api/v1/referrals
**Description:** Retrieve all active referral offers for the user.
**Auth:** Bearer Token

**Query parameters:**
- `offer_type` — optional, one of: `loan | insurance`
- `page` — optional, default: 1, limit: 10, max: 20

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "offers": [
      {
        "offer_id": "uuid",
        "offer_type": "loan",
        "partner_name": "Fido",
        "product_name": "SME Business Loan",
        "max_amount": 8000.00,
        "interest_rate": 8.5,
        "description": "string",
        "status": "active | viewed",
        "expires_at": "timestamp"
      }
    ],
    "total": 2
  },
  "message": "Referral offers retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `deep_link` not included in list view. Only returned on click.

---

### POST /api/v1/referrals/check-eligibility
**Description:** Manually trigger eligibility check and generate fresh offers.
**Auth:** Bearer Token
**Rate limit:** 3 requests per user per day

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "new_offers_generated": 2,
    "eligibility_basis": {
      "months_of_data": 6,
      "average_monthly_income": 7200.00,
      "income_consistency_score": 85,
      "tax_compliance": true
    }
  },
  "message": "Eligibility check complete. New offers have been generated.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 429 | RATE_LIMIT_EXCEEDED | Eligibility check limit reached for today |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/referrals/{id}/viewed
**Description:** Mark a referral offer as viewed.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the offer

**Success — 200 OK:**
```json
{
  "success": true,
  "data": { "offer_id": "uuid", "status": "viewed" },
  "message": "Offer marked as viewed.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | OFFER_NOT_FOUND | No offer found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/referrals/{id}/clicked
**Description:** Mark offer as clicked and return partner deep link.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the offer

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "offer_id": "uuid",
    "partner_name": "Fido",
    "product_name": "SME Business Loan",
    "deep_link": "string",
    "status": "clicked"
  },
  "message": "Redirecting to partner.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | OFFER_NOT_FOUND | No offer found with this ID |
| 410 | OFFER_EXPIRED | This offer has expired and is no longer available |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/referrals/{id}/dismiss
**Description:** Dismiss a referral offer so it no longer appears in the feed.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the offer

**Success — 200 OK:**
```json
{
  "success": true,
  "data": { "offer_id": "uuid", "status": "dismissed" },
  "message": "Offer dismissed.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | OFFER_NOT_FOUND | No offer found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/referrals/{id}/converted
**Description:** Partner webhook. Called by partner when user completes a loan application or insurance purchase.
**Auth:** Bearer Token + Admin or Partner API Key

**Path parameter:** `id` — UUID of the offer

**Request body:**
```json
{
  "partner_reference": "string, required",
  "converted_at": "timestamp, optional, defaults to NOW()",
  "product_name": "string, optional",
  "amount": "number, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "offer_id": "uuid",
    "status": "converted",
    "partner_reference": "string",
    "converted_at": "timestamp"
  },
  "message": "Conversion confirmed.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | Partner reference is required |
| 401 | UNAUTHORIZED | Invalid partner API key |
| 404 | OFFER_NOT_FOUND | No offer found with this ID |
| 409 | ALREADY_CONVERTED | This offer has already been marked as converted |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Webhook called by partner — not by user.
- Uses partner-specific API key for authentication rather than user JWT.

---

## Group 24 — Notifications

### POST /api/v1/notifications/register
**Description:** Register a device's FCM token to receive push notifications.
**Auth:** Bearer Token

**Request body:**
```json
{
  "fcm_token": "string, required",
  "device_info": "string, optional",
  "platform": "string, required, one of: android | ios"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": { "registered": true, "platform": "android" },
  "message": "Device registered for notifications.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | FCM token and platform are required |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### DELETE /api/v1/notifications/register
**Description:** Unregister the current device's FCM token. Called on logout.
**Auth:** Bearer Token

**Request body:**
```json
{
  "fcm_token": "string, required"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": null,
  "message": "Device unregistered from notifications.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | FCM token is required |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | TOKEN_NOT_FOUND | No device token found matching this FCM token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/notifications
**Description:** Retrieve paginated list of recent notifications.
**Auth:** Bearer Token

**Query parameters:**
- `read` — optional, boolean
- `page` — optional, default: 1, limit: 20, max: 50

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notification_id": "uuid",
        "title": "string",
        "body": "string",
        "type": "deadline | penalty | vault | referral | payment | system",
        "read": false,
        "action_url": "string | null",
        "created_at": "timestamp"
      }
    ],
    "unread_count": 3,
    "pagination": { "total": 12, "page": 1, "limit": 20, "total_pages": 1 }
  },
  "message": "Notifications retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/notifications/{id}/read
**Description:** Mark a notification as read.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the notification

**Success — 200 OK:**
```json
{
  "success": true,
  "data": { "notification_id": "uuid", "read": true },
  "message": "Notification marked as read.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 404 | NOTIFICATION_NOT_FOUND | No notification found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### DELETE /api/v1/notifications/{id}
**Description:** Delete a specific notification.
**Auth:** Bearer Token

**Path parameter:** `id` — UUID of the notification

**Success — 200 OK:**
```json
{
  "success": true,
  "data": null,
  "message": "Notification deleted.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | You do not have access to this notification |
| 404 | NOTIFICATION_NOT_FOUND | No notification found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### DELETE /api/v1/notifications
**Description:** Clear all notifications for the authenticated user.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": { "deleted_count": 12 },
  "message": "All notifications cleared.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/notifications/preferences
**Description:** Retrieve notification preferences.
**Auth:** Bearer Token

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "deadline_reminders": true,
      "penalty_alerts": true,
      "vault_suggestions": true,
      "referral_offers": true,
      "payment_confirmations": true,
      "system_updates": true
    }
  },
  "message": "Notification preferences retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/notifications/preferences
**Description:** Update notification preferences.
**Auth:** Bearer Token

**Request body:**
```json
{
  "deadline_reminders": "boolean, optional",
  "penalty_alerts": "boolean, optional",
  "vault_suggestions": "boolean, optional",
  "referral_offers": "boolean, optional",
  "payment_confirmations": "boolean, optional",
  "system_updates": "boolean, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "deadline_reminders": true,
      "penalty_alerts": true,
      "vault_suggestions": false,
      "referral_offers": true,
      "payment_confirmations": true,
      "system_updates": false
    },
    "updated_at": "timestamp"
  },
  "message": "Notification preferences updated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `penalty_alerts` cannot be disabled. If sent as false it is silently ignored.

---

## Group 25 — Audit Log

### GET /api/v1/audit-log
**Description:** Retrieve the authenticated user's complete immutable audit trail.
**Auth:** Bearer Token

**Query parameters:**
- `action` — optional, one of: `create | update | delete | login | logout | export | file | pay`
- `entity_type` — optional, string
- `date_from` — optional, `YYYY-MM-DD`
- `date_to` — optional, `YYYY-MM-DD`
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "log_id": "uuid",
        "action": "update",
        "entity_type": "transactions",
        "entity_id": "uuid",
        "previous_value": {},
        "new_value": {},
        "ip_address": "string",
        "device_info": "string",
        "created_at": "timestamp"
      }
    ],
    "pagination": { "total": 340, "page": 1, "limit": 20, "total_pages": 17 }
  },
  "message": "Audit log retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Sorted by `created_at` descending — most recent first.
- Audit logs are read-only. No create, update, or delete operations.

---

## Group 26 — Admin

### GET /api/v1/admin/users
**Description:** Retrieve paginated list of all platform users.
**Auth:** Bearer Token + Admin

**Query parameters:**
- `subscription_tier` — optional
- `taxpayer_category` — optional
- `is_active` — optional, boolean
- `date_from` — optional, `YYYY-MM-DD`
- `date_to` — optional, `YYYY-MM-DD`
- `page` — optional, default: 1, limit: 20, max: 100

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": "uuid",
        "full_name": "string",
        "phone": "string",
        "email": "string | null",
        "taxpayer_category": "string",
        "subscription_tier": "string",
        "is_active": true,
        "is_verified": true,
        "created_at": "timestamp"
      }
    ],
    "pagination": { "total": 1250, "page": 1, "limit": 20, "total_pages": 63 }
  },
  "message": "Users retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/admin/users/{id}
**Description:** Retrieve a specific user's full details including tax profile and subscription.
**Auth:** Bearer Token + Admin

**Path parameter:** `id` — UUID of the user

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "full_name": "string",
    "phone": "string",
    "email": "string | null",
    "tin": "string | null",
    "region": "string",
    "taxpayer_category": "string",
    "subscription_tier": "string",
    "role": "user | admin",
    "is_active": true,
    "is_verified": true,
    "tax_profile": { "vat_registered": false, "paye_registered": false, "onboarding_complete": true },
    "subscription": { "plan": "monthly | annual | null", "status": "active | cancelled | expired | null", "expires_at": "timestamp | null" },
    "created_at": "timestamp"
  },
  "message": "User retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 404 | USER_NOT_FOUND | No user found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/admin/users/{id}/deactivate
**Description:** Deactivate a user account from the admin panel.
**Auth:** Bearer Token + Admin

**Path parameter:** `id` — UUID of the user

**Request body:**
```json
{
  "reason": "string, required"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": { "user_id": "uuid", "is_active": false, "deactivated_at": "timestamp" },
  "message": "User account deactivated.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | ALREADY_DEACTIVATED | This account is already deactivated |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 404 | USER_NOT_FOUND | No user found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/admin/users/{id}/activate
**Description:** Reactivate a deactivated user account.
**Auth:** Bearer Token + Admin

**Path parameter:** `id` — UUID of the user

**Success — 200 OK:**
```json
{
  "success": true,
  "data": { "user_id": "uuid", "is_active": true, "reactivated_at": "timestamp" },
  "message": "User account reactivated.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | ALREADY_ACTIVE | This account is already active |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 404 | USER_NOT_FOUND | No user found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### PUT /api/v1/admin/users/{id}/role
**Description:** Change a user's role between user and admin.
**Auth:** Bearer Token + Admin

**Path parameter:** `id` — UUID of the user

**Request body:**
```json
{
  "role": "string, required, one of: user | admin"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": { "user_id": "uuid", "role": "admin", "updated_at": "timestamp" },
  "message": "User role updated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | SAME_ROLE | User already has this role |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required. An admin cannot demote themselves. |
| 404 | USER_NOT_FOUND | No user found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/admin/stats
**Description:** Retrieve platform-wide statistics.
**Auth:** Bearer Token + Admin

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "users": { "total": 1250, "active": 1180, "verified": 1100, "free_tier": 900, "paid_tier": 350, "new_this_month": 87 },
    "transactions": { "total_logged": 48500, "logged_this_month": 3200 },
    "tax_returns": { "total_filed": 2100, "filed_this_month": 180 },
    "payments": { "total_processed": 1850, "total_amount_processed": 245000.00, "processed_this_month": 142 },
    "referrals": { "total_offers_generated": 420, "total_clicked": 180, "total_converted": 42 }
  },
  "message": "Platform statistics retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/admin/audit-log
**Description:** Retrieve platform-wide audit log across all users.
**Auth:** Bearer Token + Admin

**Query parameters:**
- `user_id` — optional, UUID
- `action` — optional
- `entity_type` — optional, string
- `date_from` — optional, `YYYY-MM-DD`
- `date_to` — optional, `YYYY-MM-DD`
- `page` — optional, default: 1, limit: 50, max: 200

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "log_id": "uuid",
        "user_id": "uuid | null",
        "user_phone": "string | null",
        "action": "string",
        "entity_type": "string",
        "entity_id": "uuid | null",
        "ip_address": "string",
        "device_info": "string",
        "created_at": "timestamp"
      }
    ],
    "pagination": { "total": 85000, "page": 1, "limit": 50, "total_pages": 1700 }
  },
  "message": "Platform audit log retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/admin/partners
**Description:** Retrieve all referral partners configured on the platform.
**Auth:** Bearer Token + Admin

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "partners": [
      {
        "partner_id": "uuid",
        "name": "Fido",
        "offer_type": "loan",
        "is_active": true,
        "eligibility_threshold": {
          "min_months_data": 3,
          "min_average_income": 1500.00,
          "min_consistency_score": 70,
          "requires_tax_compliance": true
        },
        "total_offers_generated": 210,
        "total_converted": 22,
        "created_at": "timestamp"
      }
    ]
  },
  "message": "Partners retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### POST /api/v1/admin/partners
**Description:** Add a new referral partner.
**Auth:** Bearer Token + Admin

**Request body:**
```json
{
  "name": "string, required",
  "offer_type": "string, required, one of: loan | insurance",
  "eligibility_threshold": {
    "min_months_data": "integer, required",
    "min_average_income": "number, required",
    "min_consistency_score": "integer, required, 0-100",
    "requires_tax_compliance": "boolean, required"
  }
}
```

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "partner_id": "uuid",
    "name": "string",
    "offer_type": "string",
    "api_key": "string, raw key — shown only once, store securely",
    "is_active": true,
    "created_at": "timestamp"
  },
  "message": "Partner added. Save the API key — it will not be shown again.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 409 | PARTNER_ALREADY_EXISTS | A partner with this name already exists |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- `api_key` generated by backend. Shown once only. Only hash stored.

---

### PUT /api/v1/admin/partners/{id}
**Description:** Update a partner's details or eligibility thresholds.
**Auth:** Bearer Token + Admin

**Path parameter:** `id` — UUID of the partner

**Request body:**
```json
{
  "name": "string, optional",
  "eligibility_threshold": "object, optional",
  "is_active": "boolean, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": { "partner_id": "uuid", "name": "string", "is_active": true, "updated_at": "timestamp" },
  "message": "Partner updated successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 404 | PARTNER_NOT_FOUND | No partner found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### DELETE /api/v1/admin/partners/{id}
**Description:** Deactivate a partner. All active offers from this partner are expired immediately.
**Auth:** Bearer Token + Admin

**Path parameter:** `id` — UUID of the partner

**Success — 200 OK:**
```json
{
  "success": true,
  "data": { "partner_id": "uuid", "is_active": false, "offers_expired": 12 },
  "message": "Partner deactivated. All active offers have been expired.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | ALREADY_INACTIVE | This partner is already inactive |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 404 | PARTNER_NOT_FOUND | No partner found with this ID |
| 500 | SERVER_ERROR | An unexpected error occurred |

---

### GET /api/v1/admin/tax-rates
**Description:** Retrieve current tax rates and constants as configured in the system.
**Auth:** Bearer Token + Admin

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "tax_year": 2024,
    "last_updated": "timestamp",
    "updated_by": "uuid",
    "rates": {}
  },
  "message": "Tax rates retrieved successfully.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Notes:**
- `rates` object mirrors `GET /api/v1/tax/rates` response.
- Includes `last_updated` and `updated_by` audit fields not present on the user-facing endpoint.

---

### PUT /api/v1/admin/tax-rates
**Description:** Update system tax rates after Ghana's national budget announcement.
**Auth:** Bearer Token + Admin

**Request body:**
```json
{
  "tax_year": "integer, required",
  "income_tax_brackets": "array, optional",
  "vat_standard_rate": "number, optional",
  "vat_nhil_levy": "number, optional",
  "vat_getfund_levy": "number, optional",
  "vat_covid_levy": "number, optional",
  "vat_registration_threshold": "number, optional",
  "withholding_rates": "array, optional",
  "penalty_rates": "object, optional"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "tax_year": 2025,
    "updated_at": "timestamp",
    "updated_by": "uuid"
  },
  "message": "Tax rates updated. New rates are effective immediately.",
  "timestamp": "2024-04-30T10:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|---|---|---|
| 400 | VALIDATION_ERROR | One or more fields are invalid |
| 401 | UNAUTHORIZED | Invalid or expired access token |
| 403 | FORBIDDEN | Admin access required |
| 500 | SERVER_ERROR | An unexpected error occurred |

**Notes:**
- Rate changes effective immediately for all future calculations.
- New `tax_rate_configs` record created for the tax year.
- Audit log entry written.

---

*TaxPadi — API Contract v1.0 | Group 104 | KNUST Department of Computer Science | April 2026*
