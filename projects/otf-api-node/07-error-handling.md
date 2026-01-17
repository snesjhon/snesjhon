# Module 7: Error Handling & Reliability

This module covers building a robust API client that handles errors gracefully and recovers from failures.

## Learning Objectives

- Create custom error classes for different failure types
- Implement retry logic with exponential backoff
- Handle rate limiting (429 responses)
- Map API error codes to meaningful exceptions
- Build graceful degradation strategies

---

## 7.1 Types of Errors

### Error Categories

| Category | Example | Recovery Strategy |
|----------|---------|-------------------|
| **Network** | Timeout, DNS failure | Retry with backoff |
| **Server** | 500, 502, 503 | Retry (server might recover) |
| **Client** | 400, 404 | Don't retry (your fault) |
| **Auth** | 401, 403 | Refresh token, re-auth |
| **Rate Limit** | 429 | Wait and retry |
| **Business Logic** | "Already booked" | Handle specifically |

### Python Reference: Exception hierarchy

```python
# From exceptions.py
class OtfException(Exception):
    """Base exception for all OTF errors."""
    pass

class AuthenticationError(OtfException):
    """Failed to authenticate with Cognito."""
    pass

class AlreadyBookedError(OtfException):
    """User is already booked for this class."""
    pass

class OutsideSchedulingWindowError(OtfException):
    """Class is outside the booking window."""
    pass

class ClassFullError(OtfException):
    """Class is at capacity."""
    pass
```

---

## 7.2 Creating Custom Error Classes

### TypeScript Error Classes

```typescript
// src/errors.ts

// Base error
export class OtfError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'OtfError';
  }
}

// Authentication errors
export class AuthenticationError extends OtfError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_FAILED');
    this.name = 'AuthenticationError';
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor() {
    super('Token has expired and refresh failed');
    this.name = 'TokenExpiredError';
  }
}

// HTTP errors
export class HttpError extends OtfError {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message, `HTTP_${status}`);
    this.name = 'HttpError';
  }
}

// Business logic errors
export class AlreadyBookedError extends OtfError {
  constructor() {
    super('You are already booked for this class', 'ALREADY_BOOKED');
    this.name = 'AlreadyBookedError';
  }
}

export class ClassFullError extends OtfError {
  constructor() {
    super('This class is at capacity', 'CLASS_FULL');
    this.name = 'ClassFullError';
  }
}

export class OutsideSchedulingWindowError extends OtfError {
  constructor() {
    super('Class is outside the scheduling window', 'OUTSIDE_WINDOW');
    this.name = 'OutsideSchedulingWindowError';
  }
}
```

### Exercise 7.1: Identify Error Cases

Look at the OTF API you've discovered:

1. What error codes does the API return?
2. What HTTP status codes have you seen?
3. Create a list of custom errors you'll need

---

## 7.3 Mapping API Errors

### Python Reference: Error code mapping

```python
# From client.py - mapping error responses to exceptions
ERROR_CODE_EXCEPTIONS: ClassVar[dict[str, type[OtfException]]] = {
    "ALREADY_BOOKED": AlreadyBookedError,
    "OUTSIDE_SCHEDULING_WINDOW": OutsideSchedulingWindowError,
    "ERROR-801": ClassFullError,  # Different format
}

def _handle_error_response(self, response: httpx.Response) -> None:
    """Convert API error response to appropriate exception."""
    try:
        body = response.json()
        error_code = body.get("code") or body.get("errorCode")

        if error_code in self.ERROR_CODE_EXCEPTIONS:
            raise self.ERROR_CODE_EXCEPTIONS[error_code]()

    except json.JSONDecodeError:
        pass

    # Default to generic HTTP error
    raise httpx.HTTPStatusError(...)
```

### Your Implementation

```typescript
// Error code to exception mapping

const ERROR_MAP: Record<string, new () => OtfError> = {
  'ALREADY_BOOKED': AlreadyBookedError,
  'OUTSIDE_SCHEDULING_WINDOW': OutsideSchedulingWindowError,
  'ERROR-801': ClassFullError,
  'CLASS_FULL': ClassFullError,
  'WAITLIST_FULL': WaitlistFullError
};

function mapApiError(response: Response, body: unknown): OtfError {
  // Try to extract error code from body
  const errorCode =
    (body as any)?.code ||
    (body as any)?.errorCode ||
    (body as any)?.error?.code;

  // Check if we have a specific error class
  if (errorCode && ERROR_MAP[errorCode]) {
    return new ERROR_MAP[errorCode]();
  }

  // Fall back to generic HTTP error
  return new HttpError(
    response.status,
    `API error: ${response.statusText}`,
    body
  );
}
```

### Exercise 7.2: Implement Error Mapping

Write the `handleResponse` function that:

1. Checks if response is ok (2xx)
2. If not, parses the error body
3. Maps to appropriate custom error
4. Throws the error

```typescript
async function handleResponse<T>(response: Response): Promise<T> {
  // TODO: Implement this
}
```

---

## 7.4 Retry Logic with Exponential Backoff

### Why Exponential Backoff?

```
Attempt 1: Wait 0ms      → Request fails (server overloaded)
Attempt 2: Wait 1000ms   → Request fails
Attempt 3: Wait 2000ms   → Request fails
Attempt 4: Wait 4000ms   → Request succeeds!
```

Exponential backoff prevents overwhelming a struggling server.

### Python Reference: Retry implementation

```python
# From client.py
async def _make_request_with_retry(
    self,
    method: str,
    url: str,
    max_retries: int = 3,
    **kwargs
) -> dict:
    """Make request with exponential backoff retry."""

    for attempt in range(max_retries):
        try:
            response = await self._make_request(method, url, **kwargs)
            return response

        except (httpx.TransportError, httpx.HTTPStatusError) as e:
            # Only retry on network errors or 5xx
            if isinstance(e, httpx.HTTPStatusError):
                if e.response.status_code < 500:
                    raise  # Don't retry 4xx errors

            if attempt == max_retries - 1:
                raise  # Last attempt, give up

            # Exponential backoff: 4s, 6s, 8s, 10s (with jitter)
            wait_time = 4 + (attempt * 2) + random.uniform(0, 1)
            LOGGER.warning(f"Retry {attempt + 1} in {wait_time:.1f}s")
            await asyncio.sleep(wait_time)
```

### TypeScript Implementation

```typescript
interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    shouldRetry = defaultShouldRetry
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (!shouldRetry(error, attempt)) {
        throw error;
      }

      // Don't wait after last attempt
      if (attempt < maxRetries - 1) {
        const delay = calculateBackoff(attempt, baseDelayMs, maxDelayMs);
        console.log(`Retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

function calculateBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  // Exponential: 1s, 2s, 4s, 8s...
  const exponential = baseDelay * Math.pow(2, attempt);

  // Add jitter (±25%)
  const jitter = exponential * 0.25 * (Math.random() * 2 - 1);

  // Cap at max delay
  return Math.min(exponential + jitter, maxDelay);
}

function defaultShouldRetry(error: unknown, attempt: number): boolean {
  // Retry on network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Retry on 5xx errors
  if (error instanceof HttpError && error.status >= 500) {
    return true;
  }

  // Retry on rate limiting (429)
  if (error instanceof HttpError && error.status === 429) {
    return true;
  }

  // Don't retry client errors (4xx except 429)
  return false;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

### Exercise 7.3: Implement Retry Logic

Write the `withRetry` function and test it:

```typescript
// Test with a function that fails twice then succeeds
let attempts = 0;
const flaky = async () => {
  attempts++;
  if (attempts < 3) throw new Error('Flaky!');
  return 'success';
};

const result = await withRetry(flaky);
console.log(result); // 'success'
console.log(attempts); // 3
```

---

## 7.5 Rate Limiting

### Handling 429 Responses

```typescript
// Rate limiting with respect for Retry-After header

async function handleRateLimit(response: Response): Promise<number> {
  const retryAfter = response.headers.get('Retry-After');

  if (retryAfter) {
    // Header might be seconds or a date
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }

    // Try parsing as date
    const date = new Date(retryAfter);
    if (!isNaN(date.getTime())) {
      return date.getTime() - Date.now();
    }
  }

  // Default: wait 60 seconds
  return 60000;
}

// In your request handler:
if (response.status === 429) {
  const waitMs = await handleRateLimit(response);
  console.log(`Rate limited. Waiting ${waitMs}ms`);
  await sleep(waitMs);
  // Then retry...
}
```

### Proactive Rate Limiting

```typescript
// Don't hit rate limits in the first place

class RateLimiter {
  private lastRequest: number = 0;
  private minIntervalMs: number;

  constructor(requestsPerSecond: number = 2) {
    this.minIntervalMs = 1000 / requestsPerSecond;
  }

  async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;

    if (elapsed < this.minIntervalMs) {
      await sleep(this.minIntervalMs - elapsed);
    }

    this.lastRequest = Date.now();
  }
}

// Usage in client:
class OtfClient {
  private rateLimiter = new RateLimiter(2); // 2 requests/sec

  async request<T>(...): Promise<T> {
    await this.rateLimiter.throttle();  // Wait if needed
    // ... make request
  }
}
```

---

## 7.6 Graceful Error Handling in API Methods

### Python Reference: Error handling in methods

```python
# From booking_api.py
def book_class(self, otf_class: OtfClass) -> Booking:
    """Book a class with proper error handling."""
    try:
        response = self.client.put_class(...)
        return Booking.create(**response)

    except AlreadyBookedError:
        # Get existing booking instead of failing
        bookings = self.get_bookings()
        existing = next(
            (b for b in bookings if b.class_uuid == otf_class.class_uuid),
            None
        )
        if existing:
            return existing
        raise  # Re-raise if we can't find it

    except ClassFullError:
        # Could auto-join waitlist here
        raise
```

### Your Implementation Strategy

```typescript
async bookClass(otfClass: OtfClass): Promise<Booking> {
  try {
    return await this.client.put('/v1/bookings', { ... });

  } catch (error) {
    // Handle specific errors gracefully
    if (error instanceof AlreadyBookedError) {
      // Return existing booking instead of failing
      const bookings = await this.getBookings();
      const existing = bookings.find(b => b.classUuid === otfClass.classUuid);
      if (existing) return existing;
    }

    if (error instanceof ClassFullError) {
      // Could offer to join waitlist
      throw new ClassFullError(
        `Class is full. ${otfClass.waitlistSize} people on waitlist.`
      );
    }

    throw error;
  }
}
```

### Exercise 7.4: Design Error Handling

For each scenario, design how to handle it:

1. **Token expired mid-request**
   - Should you auto-refresh and retry?
   - What if refresh also fails?

2. **Class full when booking**
   - Should you auto-join waitlist?
   - How do you communicate this to the user?

3. **Network timeout**
   - How many retries?
   - What if it's a mutation (POST/PUT)?

---

## 7.7 Logging and Debugging

### Python Reference: Debug logging

```python
# From client.py
if os.getenv("OTF_LOG_RAW_RESPONSE"):
    LOGGER.debug(f"Response: {response.text}")
```

### TypeScript Logging

```typescript
// Simple debug logging

const DEBUG = process.env.OTF_DEBUG === 'true';

function log(level: 'debug' | 'info' | 'warn' | 'error', ...args: unknown[]) {
  if (level === 'debug' && !DEBUG) return;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [OTF] [${level.toUpperCase()}]`;

  console[level](prefix, ...args);
}

// Usage:
log('debug', 'Request:', method, url);
log('debug', 'Response:', response.status, body);
log('warn', 'Retry attempt', attempt, 'after error:', error.message);
log('error', 'Request failed:', error);
```

### What to Log

| Level | What to Log |
|-------|-------------|
| DEBUG | Request/response details, timing |
| INFO | Significant operations (login, booking) |
| WARN | Retries, rate limits, recoverable errors |
| ERROR | Failures, unrecoverable errors |

---

## 7.8 Putting It Together

### Complete Error-Handling Flow

```typescript
class OtfClient {
  private rateLimiter = new RateLimiter();

  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return withRetry(
      async () => {
        // 1. Rate limiting
        await this.rateLimiter.throttle();

        // 2. Ensure valid token
        await this.user.ensureValidToken();

        // 3. Build and send request
        log('debug', `${method} ${path}`);
        const response = await fetchWithTimeout(
          this.buildUrl(path, options.params),
          this.buildRequestInit(method, options),
          this.timeout
        );

        // 4. Handle response
        return this.handleResponse<T>(response);
      },
      {
        maxRetries: 3,
        shouldRetry: (error) => {
          // Auth errors: try token refresh
          if (error instanceof TokenExpiredError) {
            this.user.invalidateToken();
            return true;
          }
          return defaultShouldRetry(error);
        }
      }
    );
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const body = await this.parseBody(response);

    if (!response.ok) {
      throw mapApiError(response, body);
    }

    log('debug', 'Response:', response.status);
    return body as T;
  }
}
```

---

## Key Takeaways

1. **Create specific error classes** - don't just throw generic Errors
2. **Map API errors** - translate error codes to meaningful exceptions
3. **Retry with backoff** - for network and server errors only
4. **Respect rate limits** - both proactively and reactively
5. **Handle errors gracefully** - recover when possible
6. **Log effectively** - enough to debug, not too much to overwhelm

---

## Exercises Summary

Complete these to finish the study guide:

- [ ] Exercise 7.1: Identify error cases from the API
- [ ] Exercise 7.2: Implement error response handling
- [ ] Exercise 7.3: Build retry logic with exponential backoff
- [ ] Exercise 7.4: Design graceful error handling strategies
- [ ] Bonus: Implement a complete error handling layer

---

## What's Next?

Congratulations! You've completed the study guide. You now understand:

1. **HTTP fundamentals** - how requests and responses work
2. **Authentication** - AWS Cognito and token management
3. **API discovery** - reverse engineering with DevTools
4. **HTTP client layer** - building a reusable client
5. **Data modeling** - TypeScript types with Zod validation
6. **Architecture** - organizing code into modules
7. **Reliability** - error handling and retries

### Suggested Build Order

1. Start with authentication (Module 2)
2. Build the HTTP client (Module 4)
3. Add one API module (bookings is good to start)
4. Add data models as you need them (Module 5)
5. Expand to other modules
6. Refine error handling throughout

### Resources

- [otf-api Python source](https://github.com/NodeJSmith/otf-api) - Your reference implementation
- [Zod documentation](https://zod.dev/) - Runtime validation
- [amazon-cognito-identity-js](https://www.npmjs.com/package/amazon-cognito-identity-js) - Cognito auth
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) - HTTP requests

Good luck building your Node.js OTF API client!
