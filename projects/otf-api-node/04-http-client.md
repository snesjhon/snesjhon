# Module 4: Building the HTTP Client

This module covers building a reusable HTTP client layer that handles requests, authentication, and common concerns like timeouts and retries.

## Learning Objectives

- Understand the HTTP client's role in the architecture
- Implement a client using native `fetch` or axios
- Add authentication headers automatically
- Implement timeouts and connection handling
- Build a clean, reusable abstraction

---

## 4.1 The Client's Role in the Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       Your Application                        │
├──────────────────────────────────────────────────────────────┤
│  BookingApi    MemberApi    WorkoutApi    StudioApi          │
│      │            │            │             │                │
│      └────────────┴────────────┴─────────────┘                │
│                          │                                    │
│                    ┌─────┴─────┐                              │
│                    │ OtfClient │  ← HTTP Client Layer         │
│                    └─────┬─────┘                              │
│                          │                                    │
│            ┌─────────────┼─────────────┐                     │
│            │             │             │                      │
│         fetch()      headers       auth                       │
└──────────────────────────────────────────────────────────────┘
```

The client layer:
- Centralizes HTTP logic
- Adds authentication to every request
- Handles timeouts, retries, errors
- Provides a clean interface for API modules

### Python Reference: OtfClient structure

```python
# From client.py
class OtfClient:
    """HTTP client for OTF API - handles all HTTP concerns."""

    DEFAULT_HEADERS: ClassVar[dict[str, str]] = {
        "content-type": "application/json",
        "accept": "application/json",
        "user-agent": "okhttp/4.12.0",
    }

    def __init__(self, user: OtfUser | None = None):
        self.user = user or OtfUser()
        self._client = httpx.Client(
            auth=self.user.httpx_auth,   # Auto-adds auth to requests
            timeout=httpx.Timeout(20, connect=60)
        )
```

---

## 4.2 Native fetch vs Axios

### Option 1: Native fetch (Node.js 18+)

```typescript
// Built into Node.js, no dependencies
const response = await fetch(url, {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Pros: No dependencies, standard API
// Cons: No automatic retries, less features
```

### Option 2: Axios

```typescript
import axios from 'axios';

// More features out of the box
const client = axios.create({
  baseURL: 'https://api.orangetheory.co',
  timeout: 20000,
  headers: { 'User-Agent': 'okhttp/4.12.0' }
});

// Pros: Interceptors, automatic transforms, retries (with plugin)
// Cons: External dependency
```

### Exercise 4.1: Choose Your HTTP Library

Research and decide:

1. What are interceptors and why are they useful?
2. How would you add automatic retries with each option?
3. Which approach matches the Python `httpx` library better?

Document your choice and reasoning.

---

## 4.3 Building the Client Class

### Step 1: Basic Structure

```typescript
// TODO: Fill in the implementation

interface OtfClientConfig {
  baseUrl?: string;
  timeout?: number;
}

class OtfClient {
  private baseUrl: string;
  private timeout: number;
  private user: OtfUser;

  constructor(user: OtfUser, config?: OtfClientConfig) {
    // TODO: Initialize with defaults
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    // TODO: Implement GET request
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    // TODO: Implement POST request
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    // TODO: Implement PUT request
  }

  async delete<T>(path: string): Promise<T> {
    // TODO: Implement DELETE request
  }
}
```

### Python Reference: Method signatures

```python
# From client.py
def _make_request(
    self,
    method: str,
    url: str,
    params: dict | None = None,
    json: dict | None = None,
    headers: dict | None = None,
) -> dict[str, Any]:
    """Core request method - all other methods use this."""
```

---

## 4.4 Request Building

Build requests with proper headers and parameters.

### Python Reference: _build_request

```python
# From client.py
def _build_request(
    self,
    method: str,
    url: str,
    **kwargs: Any
) -> httpx.Request:
    """Build a request with default headers and filtered params."""

    # Merge custom headers with defaults
    headers = self.DEFAULT_HEADERS | kwargs.pop("headers", {})

    # Filter out null/undefined params
    params = {k: v for k, v in kwargs.pop("params", {}).items() if v is not None}

    return self._client.build_request(
        method, url, headers=headers, params=params, **kwargs
    )
```

### Your Implementation

```typescript
// TODO: Implement request building

private buildRequest(
  method: string,
  url: string,
  options: RequestOptions = {}
): Request {
  // 1. Merge default headers with custom headers
  const headers = {
    ...this.defaultHeaders,
    ...options.headers,
  };

  // 2. Filter out undefined/null params
  // Hint: Object.entries + filter + Object.fromEntries

  // 3. Build the full URL with query params
  // Hint: URLSearchParams

  // 4. Return fetch-compatible options
}
```

### Exercise 4.2: Implement buildRequest

Write a function that:
1. Merges default headers with custom headers
2. Filters out null/undefined query parameters
3. Constructs the full URL with query string
4. Returns an object ready for `fetch()`

Test it with:
```typescript
const req = buildRequest('GET', '/v1/classes', {
  params: { studio: '123', date: null, limit: '10' }
});
// Should produce: /v1/classes?studio=123&limit=10
```

---

## 4.5 Authentication Integration

Every request needs the auth token automatically.

### Python Reference: httpx Auth

```python
# From auth.py
class HttpxCognitoAuth(httpx.Auth):
    """Authentication handler that adds token to every request."""

    def __init__(self, cognito: OtfCognito):
        self.cognito = cognito

    def auth_flow(self, request: httpx.Request):
        # Check/refresh token if needed
        self.cognito.check_token()

        # Add token to request
        request.headers["authorization"] = f"Bearer {self.cognito.id_token}"

        yield request
```

### Your Implementation Strategy

```typescript
// Option 1: Pass token getter to client
class OtfClient {
  constructor(
    private getToken: () => Promise<string>
  ) {}

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return { 'Authorization': `Bearer ${token}` };
  }
}

// Option 2: Accept user object, call its method
class OtfClient {
  constructor(private user: OtfUser) {}

  private async getAuthHeaders(): Promise<Record<string, string>> {
    await this.user.ensureValidToken();  // Refresh if needed
    return { 'Authorization': `Bearer ${this.user.idToken}` };
  }
}

// Option 3: Axios interceptors
const client = axios.create({ ... });
client.interceptors.request.use(async (config) => {
  const token = await getToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Exercise 4.3: Design Auth Integration

Think through:
1. When should token refresh happen?
2. What if refresh fails mid-request?
3. How do you avoid race conditions (multiple requests refreshing at once)?

---

## 4.6 Timeouts and Connection Handling

### Python Reference: Timeout configuration

```python
# From client.py
self._client = httpx.Client(
    timeout=httpx.Timeout(20, connect=60)  # 20s request, 60s connect
)
```

### Implementing Timeouts with fetch

```typescript
// fetch doesn't have built-in timeout, you need AbortController

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### Exercise 4.4: Implement Timeout Wrapper

Write a `fetchWithTimeout` function that:
1. Accepts a timeout in milliseconds
2. Aborts the request if it takes too long
3. Throws a descriptive error on timeout

Test with a slow endpoint:
```typescript
// https://httpbin.org/delay/5 delays for 5 seconds
await fetchWithTimeout('https://httpbin.org/delay/5', {}, 2000);
// Should throw timeout error after 2 seconds
```

---

## 4.7 Response Handling

### Python Reference: Response processing

```python
# From client.py
def _default_response_handler(self, response: httpx.Response) -> dict[str, Any]:
    """Process response - raise on error, parse JSON on success."""
    response.raise_for_status()  # Throws on 4xx/5xx
    return response.json()
```

### Your Implementation

```typescript
// TODO: Implement response handling

async function handleResponse<T>(response: Response): Promise<T> {
  // 1. Check if response is ok (status 200-299)

  // 2. If not ok, throw appropriate error
  //    - Include status code
  //    - Include response body if available

  // 3. Parse JSON and return

  // 4. Handle empty responses (204 No Content)
}
```

### Exercise 4.5: Handle Different Response Types

Write response handling that correctly handles:
1. `200 OK` with JSON body → return parsed JSON
2. `201 Created` with JSON body → return parsed JSON
3. `204 No Content` → return null or undefined
4. `400 Bad Request` → throw with error details
5. `401 Unauthorized` → throw auth error
6. `500 Server Error` → throw server error

---

## 4.8 Putting It Together

### Complete Client Structure

```typescript
// Your OtfClient should look something like this:

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'okhttp/4.12.0'
};

const API_BASE_URL = 'https://api.orangetheory.co';
const DEFAULT_TIMEOUT = 20000;

class OtfClient {
  private user: OtfUser;
  private timeout: number;

  constructor(user: OtfUser, timeout = DEFAULT_TIMEOUT) {
    this.user = user;
    this.timeout = timeout;
  }

  // Core request method
  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    // 1. Ensure valid token
    // 2. Build headers (default + auth + custom)
    // 3. Build URL with params
    // 4. Make request with timeout
    // 5. Handle response
  }

  // Convenience methods
  async get<T>(path: string, params?: Params): Promise<T> {
    return this.request<T>('GET', path, { params });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, { body });
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, { body });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}
```

### Python Reference: Complete flow

```python
# From client.py - simplified flow
def _make_request(self, method: str, url: str, **kwargs) -> dict:
    request = self._build_request(method, url, **kwargs)
    response = self._client.send(request)
    return self._default_response_handler(response)
```

---

## Key Takeaways

1. **Client layer centralizes HTTP concerns** - one place for auth, headers, timeouts
2. **Authentication is automatic** - added to every request transparently
3. **Timeouts prevent hanging** - use AbortController with fetch
4. **Response handling is consistent** - same error handling everywhere
5. **Clean interface for API modules** - `get()`, `post()`, etc.

---

## Exercises Summary

Complete these before moving to Module 5:

- [ ] Exercise 4.1: Choose fetch vs axios and document reasoning
- [ ] Exercise 4.2: Implement buildRequest with param filtering
- [ ] Exercise 4.3: Design your auth integration approach
- [ ] Exercise 4.4: Implement fetchWithTimeout
- [ ] Exercise 4.5: Handle different response types
- [ ] Bonus: Write a complete OtfClient class skeleton

---

## Next Module

[[05-data-modeling]] - Define TypeScript types and Zod schemas for API data
