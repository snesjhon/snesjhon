# Module 1: HTTP & API Fundamentals

Before building an API client, you need to understand how HTTP communication works at a fundamental level.

## Learning Objectives

- Understand the HTTP request/response cycle
- Know the common HTTP methods and when to use them
- Understand headers and their purpose
- Interpret status codes correctly
- Understand JSON as a data format

---

## 1.1 The HTTP Request/Response Cycle

Every API interaction follows this pattern:

```
┌─────────┐         Request          ┌─────────┐
│         │  ───────────────────────▶│         │
│ Client  │                          │ Server  │
│         │  ◀───────────────────────│         │
└─────────┘         Response         └─────────┘
```

**Request** = What you're asking for
**Response** = What the server gives back

### Python Reference: How otf-api makes requests

```python
# From client.py - simplified
def _build_request(self, method: str, url: str, **kwargs) -> httpx.Request:
    headers = self.DEFAULT_HEADERS | kwargs.pop("headers", {})
    params = {k: v for k, v in kwargs.pop("params", {}).items() if v is not None}
    return self._client.build_request(method, url, headers=headers, params=params, **kwargs)
```

### Exercise 1.1: Make Your First Request

Using Node.js native `fetch`, make a simple GET request:

```typescript
// TODO: Make a GET request to a public API
// Try: https://httpbin.org/get
// Log the response status and body
```

**Questions to answer:**

1. What status code did you receive?

- `200`

2. What headers came back in the response?

```json
headers: Headers {
      date: 'Wed, 14 Jan 2026 19:24:07 GMT',
      'content-type': 'application/json',
      'content-length': '353',
      connection: 'keep-alive',
      server: 'gunicorn/19.9.0',
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true'
    },
```

3. What is the `content-type` header?

```
'content-type': 'application/json'
```

---

## 1.2 HTTP Methods

| Method | Purpose                 | Has Body?  | Idempotent? |
| ------ | ----------------------- | ---------- | ----------- |
| GET    | Retrieve data           | No         | Yes         |
| POST   | Create new resource     | Yes        | No          |
| PUT    | Update/replace resource | Yes        | Yes         |
| PATCH  | Partial update          | Yes        | No          |
| DELETE | Remove resource         | Usually No | Yes         |

### Python Reference: Methods used in otf-api

```python
# From booking_api.py
def book_class(self, otf_class: models.OtfClass) -> models.Booking:
    """Book a class - uses PUT"""
    body = {"classUUId": otf_class.class_uuid, ...}
    return self.client.put_class(body=body)  # PUT request

def cancel_booking(self, booking: models.Booking) -> None:
    """Cancel a booking - uses DELETE"""
    self.client.delete_booking(booking_uuid=booking.booking_uuid)
```

### Exercise 1.2: Explore HTTP Methods

```typescript
// TODO: Use https://httpbin.org to test different methods
// 1. GET  https://httpbin.org/get
// 2. POST https://httpbin.org/post  (with JSON body)
// 3. PUT  https://httpbin.org/put   (with JSON body)
// 4. DELETE https://httpbin.org/delete
```

Questions:

- How do you include a body in a POST request?
  > Within the `fetch` api there's an key/value param that you can add `body` within it
  > You also need to provide `method: 'POST'`
- What happens to the body in a GET request?
  > It fails with the `TypeError: request with GET/HEAD method cannot have a body`

---

## 1.3 Headers

Headers are key-value pairs that provide metadata about the request/response.

### Common Request Headers

| Header          | Purpose                 | Example            |
| --------------- | ----------------------- | ------------------ |
| `Content-Type`  | Format of request body  | `application/json` |
| `Accept`        | What formats you accept | `application/json` |
| `Authorization` | Auth credentials        | `Bearer <token>`   |
| `User-Agent`    | Client identification   | `okhttp/4.12.0`    |

### Python Reference: Default headers in otf-api

```python
# From client.py
DEFAULT_HEADERS: ClassVar[dict[str, str]] = {
    "content-type": "application/json",
    "accept": "application/json",
    "user-agent": "okhttp/4.12.0",
}
```

**Note:** The `user-agent` is set to mimic the official OTF mobile app. This is common in unofficial API clients to avoid being blocked.

### Exercise 1.3: Working with Headers

```typescript
// TODO: Make a request with custom headers
// 1. Set Content-Type to application/json
// 2. Set a custom User-Agent
// 3. Post to https://httpbin.org/post and observe what headers were received
```

Question: Why might an API care about the User-Agent header?

> My guess is that it tries to assume that we don't want to make/take random requests
> Given that this HTTP request is trying to mimic a kotlin app we'd want to make sure we're only
> doing requests that make sense

---

## 1.4 Status Codes

Status codes tell you what happened with your request.

### Categories

| Range | Category     | Meaning                 |
| ----- | ------------ | ----------------------- |
| 2xx   | Success      | Request worked          |
| 3xx   | Redirect     | Go somewhere else       |
| 4xx   | Client Error | You did something wrong |
| 5xx   | Server Error | Server had a problem    |

### Common Status Codes

| Code | Name                  | When You'll See It             |
| ---- | --------------------- | ------------------------------ |
| 200  | OK                    | Successful GET/PUT             |
| 201  | Created               | Successful POST (new resource) |
| 204  | No Content            | Successful DELETE              |
| 400  | Bad Request           | Invalid request body           |
| 401  | Unauthorized          | Missing/invalid auth           |
| 403  | Forbidden             | Valid auth, but not allowed    |
| 404  | Not Found             | Resource doesn't exist         |
| 429  | Too Many Requests     | Rate limited                   |
| 500  | Internal Server Error | Server crashed                 |

### Python Reference: Status code handling

```python
# From client.py - error handling based on status
if response.status_code >= 500:
    # Server error - might retry
    raise httpx.HTTPStatusError(...)

if response.status_code == 400:
    # Check for specific error codes
    error_code = response.json().get("code")
    if error_code == "ALREADY_BOOKED":
        raise AlreadyBookedError()
```

### Exercise 1.4: Status Code Exploration

```typescript
// TODO: Trigger different status codes using httpbin
// https://httpbin.org/status/200  → 200
// https://httpbin.org/status/404  → 404
// https://httpbin.org/status/500  → 500
```

Question: How should your code handle each of these differently?

> Given that I can use `fetch` which is async I can handle them depending on their status code

---

## 1.5 JSON as Data Format

REST APIs almost always use JSON for request/response bodies.

### Request Body (what you send)

```typescript
const body = {
  classUUId: "abc-123",
  memberUUId: "def-456",
  confirmed: true,
};

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body), // Must stringify!
});
```

### Response Body (what you receive)

```typescript
const response = await fetch(url);
const data = await response.json(); // Parse JSON
console.log(data.memberUUId);
```

### Python Reference: JSON handling in otf-api

```python
# From client.py
def _default_response_handler(self, response: httpx.Response) -> dict[str, Any]:
    response.raise_for_status()
    return response.json()  # Parse response as JSON
```

---

## 1.6 Putting It Together: Anatomy of an API Request

```typescript
// A complete API request in Node.js

const response = await fetch("https://api.example.com/bookings", {
  method: "POST", // HTTP Method
  headers: {
    "Content-Type": "application/json", // Request Headers
    Authorization: "Bearer eyJhbGc...",
    "User-Agent": "my-app/1.0.0",
  },
  body: JSON.stringify({
    // Request Body
    classId: "class-123",
    memberId: "member-456",
  }),
});

// Response handling
if (!response.ok) {
  // Check status
  throw new Error(`HTTP ${response.status}`);
}

const data = await response.json(); // Parse response body
console.log(data);
```

---

## Key Takeaways

1. **HTTP is request/response** - you ask, server answers
2. **Methods matter** - GET for reading, POST for creating, etc.
3. **Headers carry metadata** - authentication, content type, etc.
4. **Status codes tell you what happened** - 2xx good, 4xx your fault, 5xx server's fault
5. **JSON is the standard format** - stringify to send, parse to receive

---

## Exercises Summary

Complete these before moving to Module 2:

- [ ] Exercise 1.1: Make a GET request with fetch
- [ ] Exercise 1.2: Test all HTTP methods with httpbin
- [ ] Exercise 1.3: Send custom headers
- [ ] Exercise 1.4: Trigger and handle different status codes
- [ ] Bonus: Write a simple function that wraps fetch with default headers

---

## Next Module

[[02-authentication-cognito]] - Learn how authentication works with AWS Cognito
