# VisionEdge API Documentation

## Base URL

```
http://127.0.0.1:8000
```

---

# Endpoints

## 1. Welcome API

**Method**

GET /

**Description**

Returns the welcome message.

---

## 2. Health Check

**Method**

GET /api/v1/health

**Description**

Checks whether the backend server is running.

---

## 3. Create User

**Method**

POST /api/v1/users

**Request**

```json
{
  "full_name": "Rajesh Reddy",
  "email": "rajesh@example.com"
}
```

---

## 4. Get All Users

**Method**

GET /api/v1/users

Returns all users.

---

## 5. Get User by ID

**Method**

GET /api/v1/users/{id}

Returns a single user.

---

## 6. Update User

**Method**

PUT /api/v1/users/{id}

**Request**

```json
{
  "full_name": "Rajesh Updated",
  "email": "rajesh@example.com",
  "is_active": true
}
```

---

## 7. Delete User

**Method**

DELETE /api/v1/users/{id}

Deletes a user from the database.

---

## Response Format

```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": {}
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |
