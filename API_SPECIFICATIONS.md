# JoinTravel Backend API Specifications

## Overview
This document outlines the API specifications for the JoinTravel backend, focusing on user authentication endpoints. The API follows RESTful conventions and uses JSON for request/response payloads.

## Base URL
```
https://api.jointravel.com/v1
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the JWT token in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <jwt_token>
```

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## Endpoints

### 1. User Registration

**Endpoint:** `POST /auth/register`

**Description:** Register a new user account with email verification.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "acceptTerms": true
}
```

**Request Validation:**
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `confirmPassword`: Required, must match password
- `acceptTerms`: Required, must be true

**Response (Success - 201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "emailVerified": false,
      "createdAt": "2025-01-18T10:30:00Z"
    },
    "verificationSent": true
  },
  "message": "Registration successful. Please check your email for verification."
}
```

**Response (Email Already Exists - 409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "El email ya está en uso. Intente iniciar sesión."
  }
}
```

**Response (Validation Error - 400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Formato de correo inválido.",
      "password": "La contraseña no cumple con los requisitos."
    }
  }
}
```

**Rate Limiting:** 5 registration attempts per hour per IP address.

---

### 2. User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user credentials and return JWT token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Request Validation:**
- `email`: Required, valid email format
- `password`: Required

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "emailVerified": true,
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2025-01-18T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  },
  "message": "Login successful"
}
```

**Response (Invalid Credentials - 401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Response (Account Not Verified - 403 Forbidden):**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_NOT_VERIFIED",
    "message": "Please verify your email address before logging in"
  }
}
```

**Rate Limiting:** 10 login attempts per 15 minutes per IP address.

---

### 3. Email Verification

**Endpoint:** `POST /auth/verify-email`

**Description:** Verify user email address using verification token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "emailVerified": true
    }
  },
  "message": "Email verified successfully"
}
```

**Response (Invalid Token - 400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_VERIFICATION_TOKEN",
    "message": "Invalid or expired verification token"
  }
}
```

---

### 4. Resend Verification Email

**Endpoint:** `POST /auth/resend-verification`

**Description:** Resend email verification link.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

**Rate Limiting:** 3 resend attempts per hour per email.

---

### 5. Password Reset Request

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request password reset email.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent if account exists"
}
```

**Rate Limiting:** 5 reset requests per hour per email.

---

### 6. Password Reset Confirmation

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset password using reset token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 7. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Description:** Refresh access token using refresh token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
```

---

### 8. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Invalidate refresh token (logout).

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_to_invalidate"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 9. Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Get current authenticated user information.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "emailVerified": true,
      "firstName": "John",
      "lastName": "Doe",
      "profilePicture": "https://...",
      "createdAt": "2025-01-18T10:30:00Z",
      "updatedAt": "2025-01-18T10:30:00Z"
    }
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `EMAIL_ALREADY_EXISTS` | 409 | Email address already registered |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `ACCOUNT_NOT_VERIFIED` | 403 | Email not verified |
| `INVALID_VERIFICATION_TOKEN` | 400 | Invalid or expired verification token |
| `INVALID_RESET_TOKEN` | 400 | Invalid or expired reset token |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INVALID_TOKEN` | 401 | Invalid JWT token |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## Rate Limiting

- **Registration:** 5 attempts/hour/IP
- **Login:** 10 attempts/15min/IP
- **Email verification resend:** 3 attempts/hour/email
- **Password reset:** 5 requests/hour/email
- **General API:** 1000 requests/hour/IP

## Security Considerations

1. **HTTPS Only:** All API calls must use HTTPS
2. **Password Requirements:** Enforced server-side validation
3. **JWT Expiration:** Access tokens expire in 1 hour, refresh tokens in 30 days
4. **Password Hashing:** Use bcrypt with appropriate cost factor
5. **Input Sanitization:** All inputs are sanitized and validated
6. **CORS:** Properly configured CORS policies
7. **Logging:** All authentication attempts are logged

## Frontend Integration Examples

### Registration (React with Axios)
```typescript
const handleRegister = async (formData: RegisterFormData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/register`, formData);
    if (response.data.success) {
      // Show success message and redirect
      navigate('/');
    }
  } catch (error) {
    if (error.response?.status === 409) {
      setError('El email ya está en uso. Intente iniciar sesión.');
    } else {
      setError(error.response?.data?.error?.message || 'Registration failed');
    }
  }
};
```

### Login (React with Axios)
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email,
      password
    });

    if (response.data.success) {
      // Store tokens
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);

      // Redirect to home
      navigate('/');
    }
  } catch (error) {
    setError(error.response?.data?.error?.message || 'Login failed');
  }
};
```

### Axios Interceptor for Token Refresh
```typescript
// Add request interceptor to include auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const refreshResponse = await axios.post(`${BACKEND_URL}/auth/refresh`, {
          refreshToken
        });

        if (refreshResponse.data.success) {
          localStorage.setItem('accessToken', refreshResponse.data.data.accessToken);
          localStorage.setItem('refreshToken', refreshResponse.data.data.refreshToken);

          // Retry original request
          error.config.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`;
          return axios(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);