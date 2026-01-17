# Module 3: Reverse Engineering APIs

This module teaches you how to discover API endpoints by observing network traffic. This is how the original otf-api was built.

## Learning Objectives

- Use browser DevTools to intercept network requests
- Identify API endpoints, headers, and payloads
- Document discovered endpoints systematically
- Understand legal and ethical considerations

---

## 3.1 Why Reverse Engineering?

OrangeTheory doesn't publish a public API. The otf-api library works by:

1. Observing what the official OTF app/website does
2. Replicating those requests programmatically

This is how you discover:

- API base URLs
- Required headers
- Authentication flow
- Request/response formats

### Python Reference: Discovered endpoints

```python
# From client.py - these URLs were found through reverse engineering
API_BASE_URL = "https://api.orangetheory.co"
API_IO_BASE_URL = "https://api.orangetheory.io"
API_TELEMETRY_BASE_URL = "https://api.yuzu.orangetheory.com"
```

---

## 3.2 Browser DevTools: Network Tab

Your primary tool for API discovery is the browser's Network tab.

### Opening DevTools

| Browser | Shortcut                                     |
| ------- | -------------------------------------------- |
| Chrome  | `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Win)  |
| Firefox | `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Win)  |
| Safari  | `Cmd+Option+I` (enable in Preferences first) |

### Network Tab Walkthrough

1. **Open DevTools** → Click "Network" tab
2. **Enable "Preserve log"** → Keeps requests across page navigations
3. **Filter by "Fetch/XHR"** → Shows only API calls (not images, CSS, etc.)
4. **Perform action** → Login, book class, view workouts, etc.
5. **Click a request** → See details (Headers, Payload, Response)

### What to Look For

```
┌─────────────────────────────────────────────────────────────┐
│ Network Tab                                          Filter: XHR │
├─────────────────────────────────────────────────────────────┤
│ Name              Method   Status   Type    Size    Time    │
│ ─────────────────────────────────────────────────────────── │
│ classes?studio... GET      200      json    12.3KB  234ms   │
│ bookings          POST     201      json    1.2KB   456ms   │
│ member/details    GET      200      json    3.4KB   123ms   │
└─────────────────────────────────────────────────────────────┘

Click a request to see:
┌─────────────────────────────────────────────────────────────┐
│ Headers │ Payload │ Preview │ Response │ Timing             │
├─────────────────────────────────────────────────────────────┤
│ General:                                                     │
│   Request URL: https://api.orangetheory.co/v1/classes       │
│   Request Method: GET                                        │
│   Status Code: 200 OK                                        │
│                                                              │
│ Request Headers:                                             │
│   authorization: Bearer eyJhbGc...                          │
│   content-type: application/json                            │
│   user-agent: okhttp/4.12.0                                 │
│                                                              │
│ Query String Parameters:                                     │
│   studioUuids: abc-123,def-456                              │
│   startDate: 2024-01-01                                     │
└─────────────────────────────────────────────────────────────┘
```

### Exercise 3.1: Explore Any Website's API

Practice on a public website first:

1. Open [GitHub.com](https://github.com) (logged in)
2. Open DevTools → Network tab → Filter: Fetch/XHR
3. Navigate around (view repos, issues, etc.)
4. Document 3 API endpoints you find:
   - URL
   - Method
   - What action triggered it

---

## 3.3 Documenting Discovered Endpoints

Create systematic documentation as you discover endpoints.

### Documentation Template

````markdown
## Endpoint: Get Classes

**URL:** `GET https://api.orangetheory.co/v1/classes`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {id_token} | Yes |
| Content-Type | application/json | Yes |
| User-Agent | okhttp/4.12.0 | Recommended |

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| studioUuids | string | Comma-separated studio UUIDs |
| startDate | string | YYYY-MM-DD format |
| endDate | string | YYYY-MM-DD format |

**Response:**

```json
{
  "classes": [
    {
      "classUuid": "abc-123",
      "studioUuid": "studio-456",
      "startTime": "2024-01-15T09:00:00Z",
      "coach": "John Doe",
      "maxCapacity": 24,
      "currentCapacity": 18
    }
  ]
}
```
````

**Notes:**

- Returns max 100 classes per request
- Date range cannot exceed 30 days

````

### Python Reference: How endpoints are called

```python
# From client.py - the discovered API structure
def get_classes(
    self,
    studio_uuids: list[str],
    start_date: date | None = None,
    end_date: date | None = None,
) -> dict[str, Any]:
    """Get classes from API."""
    return self._make_request(
        "GET",
        f"{API_BASE_URL}/v1/classes",
        params={
            "studioUuids": ",".join(studio_uuids),
            "startDate": start_date.isoformat() if start_date else None,
            "endDate": end_date.isoformat() if end_date else None,
        }
    )
````

---

## 3.4 Mobile App Interception (Advanced)

Web apps are easier to inspect, but many APIs are mobile-only. For those, you need a proxy.

### Tools for Mobile Traffic

| Tool          | Platform | Difficulty |
| ------------- | -------- | ---------- |
| Charles Proxy | Mac/Win  | Medium     |
| mitmproxy     | All      | Advanced   |
| Proxyman      | Mac      | Easy       |

### Basic Proxy Setup

1. Install proxy tool on your computer
2. Configure phone to use your computer as HTTP proxy
3. Install proxy's SSL certificate on phone (for HTTPS)
4. Use the app - traffic flows through your proxy

### What You'll See

```
┌─────────────────────────────────────────────────────────────┐
│ mitmproxy - intercepted request                             │
├─────────────────────────────────────────────────────────────┤
│ POST https://api.orangetheory.co/v1/bookings                │
│                                                              │
│ Headers:                                                     │
│   authorization: Bearer eyJhbGc...                          │
│   x-device-id: iPhone14,2                                   │
│   x-app-version: 6.15.0                                     │
│                                                              │
│ Body:                                                        │
│ {                                                            │
│   "classUuid": "abc-123",                                   │
│   "memberUuid": "def-456",                                  │
│   "waitlist": false                                         │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

### Exercise 3.2: Set Up a Proxy (Optional)

If you want to capture mobile traffic:

1. Install [mitmproxy](https://mitmproxy.org/) or [Proxyman](https://proxyman.io/)
2. Follow their guide to intercept HTTPS traffic
3. Use any mobile app and observe the requests

**Note:** This is optional and more advanced. The web version may be sufficient for OTF.

---

## 3.5 Discovering the Cognito Configuration

How did the Python library find the Cognito User Pool and Client IDs?

### Finding Cognito IDs

Look for requests to:

- `cognito-idp.{region}.amazonaws.com`
- Look in the request body for `ClientId`
- Check JavaScript source files for hardcoded values

```javascript
// Often found in bundled JS files:
const config = {
  cognito: {
    userPoolId: "us-east-1_dYDxUeyL1",
    clientId: "65knvqta6p37efc2l3eh26pl00",
    region: "us-east-1",
  },
};
```

### Exercise 3.3: Find Configuration Values

1. Go to the OTF website or load the app
2. Look for:
   - Cognito User Pool ID
   - Cognito Client ID
   - API base URLs
3. Document where you found each value

---

## 3.6 Copy as cURL / Copy as Fetch

DevTools can export requests in various formats.

### Copy as cURL

1. Right-click any request
2. Select "Copy" → "Copy as cURL"
3. Paste into terminal to replay the request

```bash
curl 'https://api.orangetheory.co/v1/classes?studioUuids=abc-123' \
  -H 'authorization: Bearer eyJhbGc...' \
  -H 'content-type: application/json' \
  -H 'user-agent: okhttp/4.12.0'
```

### Copy as Fetch (JavaScript)

1. Right-click request
2. Select "Copy" → "Copy as fetch"
3. Paste into Node.js or browser console

```javascript
fetch("https://api.orangetheory.co/v1/classes?studioUuids=abc-123", {
  headers: {
    authorization: "Bearer eyJhbGc...",
    "content-type": "application/json",
    "user-agent": "okhttp/4.12.0",
  },
  method: "GET",
});
```

### Exercise 3.4: Export and Test a Request

1. Find an API request in DevTools
2. Copy it as cURL
3. Run it in your terminal
4. Copy it as fetch
5. Run it in Node.js

Does it work? What headers are required?

---

## 3.7 Mapping the API Surface

Build a complete map of all endpoints.

### API Map Template

```markdown
# OTF API Endpoint Map

## Authentication

- `POST /auth/login` - Login with credentials
- `POST /auth/refresh` - Refresh access token

## Classes

- `GET /v1/classes` - List available classes
- `GET /v1/classes/{uuid}` - Get class details

## Bookings

- `GET /v1/bookings` - List user's bookings
- `POST /v1/bookings` - Create new booking
- `DELETE /v1/bookings/{uuid}` - Cancel booking

## Member

- `GET /v1/member/details` - Get member profile
- `GET /v1/member/workouts` - Get workout history

## Studios

- `GET /v1/studios` - Search studios
- `GET /v1/studios/{uuid}` - Get studio details
```

### Python Reference: API structure

```python
# From api.py - the discovered API modules
class Otf:
    def __init__(self, user: OtfUser | None = None):
        client = OtfClient(user)
        self.bookings = BookingApi(self, client)   # Booking operations
        self.members = MemberApi(self, client)      # Member data
        self.workouts = WorkoutApi(self, client)    # Workout history
        self.studios = StudioApi(self, client)      # Studio info
```

---

## 3.8 Legal and Ethical Considerations

### Generally Acceptable

- Accessing your own data
- Personal use / learning projects
- Not sharing credentials
- Not overwhelming servers with requests
- Respecting rate limits

### Potentially Problematic

- Sharing discovered APIs publicly (gray area)
- Automated booking bots that give unfair advantage
- Scraping and selling data
- Violating Terms of Service

### Best Practices

```typescript
// DO: Implement reasonable rate limiting
const RATE_LIMIT_MS = 1000; // 1 request per second
await sleep(RATE_LIMIT_MS);

// DO: Identify yourself (sort of)
const headers = {
  "User-Agent": "personal-otf-client/1.0", // Not deceptive
};

// DON'T: Hammer the API
for (const id of allClassIds) {
  await bookClass(id); // Would book hundreds instantly
}
```

---

## Key Takeaways

1. **DevTools Network tab** is your primary discovery tool
2. **Document systematically** - URL, method, headers, params, response
3. **Copy as cURL/fetch** lets you test and replicate requests
4. **Proxies** capture mobile app traffic (advanced)
5. **Configuration values** (Cognito IDs) are often in JS bundles
6. **Be ethical** - access your own data, respect rate limits

---

## Exercises Summary

Complete these before moving to Module 4:

- [ ] Exercise 3.1: Discover 3 endpoints on any website
- [ ] Exercise 3.2: (Optional) Set up a proxy for mobile traffic
- [ ] Exercise 3.3: Find OTF's Cognito configuration values
- [ ] Exercise 3.4: Export and test a request via cURL and fetch
- [ ] Bonus: Create an API map document for OTF endpoints you discover

---

## Next Module

[[04-http-client]] - Build the HTTP client layer that makes API calls
