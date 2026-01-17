# Module 2: Authentication & AWS Cognito

The OTF API uses AWS Cognito for authentication. This module explains how Cognito auth works and how to implement it in Node.js.

## Learning Objectives

- Understand token-based authentication
- Learn how AWS Cognito works
- Understand the SRP (Secure Remote Password) protocol
- Know how to manage tokens (storage, refresh, expiration)

---

## 2.1 Token-Based Authentication Overview

Modern APIs don't send username/password with every request. Instead:

```
┌─────────┐                              ┌─────────┐
│         │  1. Login (user/pass)        │         │
│         │  ──────────────────────────▶ │         │
│ Client  │  2. Receive tokens           │ Cognito │
│         │  ◀────────────────────────── │         │
│         │                              │         │
│         │  3. Use token for API calls  │         │
│         │  ──────────────────────────▶ │   API   │
└─────────┘                              └─────────┘
```

### Types of Tokens

| Token | Purpose | Lifetime |
|-------|---------|----------|
| **ID Token** | Contains user identity claims (email, name, etc.) | Short (1 hour) |
| **Access Token** | Authorizes API requests | Short (1 hour) |
| **Refresh Token** | Gets new ID/Access tokens without re-login | Long (30+ days) |

### Python Reference: Token types in OtfUser

```python
# From user.py - tokens come from Cognito
class OtfUser:
    def __init__(
        self,
        username: str | None = None,
        password: str | None = None,
        id_token: str | None = None,      # User identity
        access_token: str | None = None,   # API authorization
        refresh_token: str | None = None,  # For renewal
    ):
        ...
```

---

## 2.2 AWS Cognito Basics

AWS Cognito is Amazon's managed authentication service. OrangeTheory uses it for their user auth.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **User Pool** | Database of users (like a users table) |
| **App Client** | Your application's credentials to talk to Cognito |
| **User Pool ID** | Identifies which user pool to authenticate against |
| **Client ID** | Identifies your app to the user pool |

### Python Reference: Cognito configuration

```python
# From auth.py - Cognito is configured with these IDs
USER_POOL_ID = "us-east-1_dYDxUeyL1"  # OTF's user pool
CLIENT_ID = "65knvqta6p37efc2l3eh26pl00"  # OTF's app client

# These values were discovered through reverse engineering
# (covered in Module 3)
```

### Exercise 2.1: Research Cognito

Before implementing, understand what you're working with:

1. Read the [AWS Cognito User Pool docs](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html)
2. Answer:
   - What is SRP (Secure Remote Password)?
   - Why doesn't the password get sent directly to the server?
   - What are "claims" in a JWT token?

---

## 2.3 The Authentication Flow

### Initial Login (SRP Flow)

```
Client                                    Cognito
  │                                          │
  │  1. InitiateAuth (USERNAME, SRP_A)       │
  │  ───────────────────────────────────────▶│
  │                                          │
  │  2. Challenge (SRP_B, SALT, SECRET)      │
  │  ◀───────────────────────────────────────│
  │                                          │
  │  3. RespondToAuthChallenge (proof)       │
  │  ───────────────────────────────────────▶│
  │                                          │
  │  4. Tokens (id, access, refresh)         │
  │  ◀───────────────────────────────────────│
```

**Why SRP?** Your password never leaves your device. Instead, cryptographic proofs are exchanged. If someone intercepts the traffic, they can't recover your password.

### Python Reference: SRP login

```python
# From auth.py
def login_with_password(self) -> None:
    """Authenticate with username and password using SRP."""
    # pycognito handles the SRP math internally
    self.authenticate(password=self.password)

    # After success, we have tokens
    self._handle_device_setup()  # Set up device for future logins
    self._write_cache()          # Save tokens for later
```

### Token Refresh Flow

```
Client                                    Cognito
  │                                          │
  │  1. Check: is access_token expired?      │
  │                                          │
  │  2. InitiateAuth (REFRESH_TOKEN)         │
  │  ───────────────────────────────────────▶│
  │                                          │
  │  3. New tokens (id, access)              │
  │  ◀───────────────────────────────────────│
```

### Python Reference: Token refresh

```python
# From auth.py
def check_token(self) -> None:
    """Verify token validity and refresh if needed."""
    if datetime.now() > self.access_token_expiration:
        LOGGER.debug("Access token expired, renewing...")
        self.renew_access_token()
```

---

## 2.4 JWT Token Structure

Tokens are JWTs (JSON Web Tokens) with three parts:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U
└─────────── Header ───────────┘└────── Payload ──────┘└─────────── Signature ─────────────┘
```

### Decoding a JWT

```typescript
// JWTs are base64 encoded - you can decode them (but not verify without the secret)
function decodeJwt(token: string) {
  const [header, payload, signature] = token.split('.');
  return {
    header: JSON.parse(atob(header)),
    payload: JSON.parse(atob(payload)),
    // signature requires secret to verify
  };
}

// Example payload (claims):
{
  "sub": "abc-123",              // Subject (user ID)
  "email": "user@example.com",   // User's email
  "cognito:username": "member-uuid",
  "exp": 1699900000,             // Expiration timestamp
  "iat": 1699896400              // Issued at timestamp
}
```

### Python Reference: Extracting claims

```python
# From user.py
self.cognito_id = self.cognito.access_claims["sub"]
self.member_uuid = self.cognito.id_claims["cognito:username"]
self.email_address = self.cognito.id_claims["email"]
```

### Exercise 2.2: Decode a JWT

1. Go to [jwt.io](https://jwt.io/)
2. Paste this example token:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzAwMDAwMDAwfQ.placeholder
   ```
3. Answer:
   - What algorithm is used?
   - What is the `exp` claim and what does it represent?
   - Can you modify the payload and have it still be valid? Why or why not?

---

## 2.5 Implementing Cognito Auth in Node.js

> **Note:** The `amazon-cognito-identity-js` package is deprecated. AWS now recommends using **AWS Amplify** for all Cognito authentication. Amplify provides better TypeScript support, smaller bundle sizes, and automatic token refresh.

### Option 1: Use AWS Amplify (Recommended)

```typescript
// Install: npm install aws-amplify
import { Amplify } from 'aws-amplify';
import { signIn, signOut, fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

// Configure Amplify with existing Cognito resources
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_dYDxUeyL1',
      userPoolClientId: '65knvqta6p37efc2l3eh26pl00',
    },
  },
});

// Sign in with username/password
async function login(username: string, password: string) {
  const { nextStep } = await signIn({
    username,
    password,
    options: {
      authFlowType: 'USER_AUTH',
      preferredChallenge: 'PASSWORD_SRP', // Uses SRP under the hood
    },
  });

  if (nextStep.signInStep === 'DONE') {
    console.log('Sign in successful!');
  }
}

// Get tokens from session
async function getTokens() {
  const session = await fetchAuthSession();
  return {
    idToken: session.tokens?.idToken?.toString(),
    accessToken: session.tokens?.accessToken?.toString(),
  };
}

// Refresh tokens (automatic, but can force)
async function refreshSession() {
  await fetchAuthSession({ forceRefresh: true });
}

// Get current user info
async function getUserInfo() {
  const { username, userId, signInDetails } = await getCurrentUser();
  return { username, userId, signInDetails };
}
```

### Option 2: Manual Implementation (For Learning)

```typescript
// Directly calling Cognito APIs
// This is educational but requires implementing SRP yourself

const COGNITO_URL = 'https://cognito-idp.us-east-1.amazonaws.com/';

async function initiateAuth(username: string, srpA: string) {
  const response = await fetch(COGNITO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
    },
    body: JSON.stringify({
      AuthFlow: 'USER_SRP_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        SRP_A: srpA
      }
    })
  });
  return response.json();
}

// Note: Manual implementation requires you to handle SRP math yourself
// Amplify handles all of this internally - use it unless you need to learn the protocol
```

### Exercise 2.3: Research AWS Amplify Auth

Before coding, understand the tooling:

1. Read the [AWS Amplify Auth documentation](https://docs.amplify.aws/react/build-a-backend/auth/)
2. Look at [Using existing Cognito resources](https://docs.amplify.aws/react/build-a-backend/auth/use-existing-cognito-resources/) (relevant to OTF)
3. Look at how [pycognito](https://github.com/pvizeli/pycognito) works (Python reference)
4. Answer:
   - What functions does `aws-amplify/auth` export?
   - How does Amplify handle token refresh automatically?
   - What is `fetchAuthSession` and when would you use `forceRefresh`?

---

## 2.6 Token Storage & Security

### Where to Store Tokens

| Location | Pros | Cons | Use For |
|----------|------|------|---------|
| Memory (variables) | Secure, no persistence | Lost on restart | Short sessions |
| Environment vars | Simple, no file I/O | Visible in process list | CI/CD, dev |
| File (encrypted) | Persists across runs | Must secure file | CLI tools |
| Keychain/Credential Manager | OS-level security | Platform-specific | Production apps |

### Python Reference: Token caching

```python
# From auth.py - caches tokens to a file
def _write_cache(self) -> None:
    """Write tokens to cache for persistence."""
    cache_file = Path.home() / ".otf" / "cache.json"
    cache_file.write_text(json.dumps({
        "id_token": self.id_token,
        "access_token": self.access_token,
        "refresh_token": self.refresh_token,
        "device_key": self.device_key
    }))
```

### Security Best Practices

```typescript
// DO: Use environment variables for credentials
const username = process.env.OTF_EMAIL;
const password = process.env.OTF_PASSWORD;

// DO: Never log tokens
console.log('Logged in successfully');  // Good
console.log(`Token: ${token}`);         // BAD!

// DO: Check token expiration before use
function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token).payload;
  return Date.now() >= payload.exp * 1000;
}

// DO: Use Amplify's automatic token refresh
import { fetchAuthSession } from 'aws-amplify/auth';

async function getValidTokens() {
  // Amplify automatically refreshes expired tokens
  const session = await fetchAuthSession();
  return session.tokens;
}

// DON'T: Commit credentials to git
// Add to .gitignore:
// .env
// .otf/
// cache.json
```

### Exercise 2.4: Design Your Token Storage

Think through these questions:

1. Where will you store credentials (username/password)?
2. Where will you cache tokens?
3. How will you handle token expiration?
4. What happens if the refresh token expires?

Sketch out a design before implementing.

---

## 2.7 Putting It Together: OtfUser Class Design

### Python Reference: OtfUser structure

```python
@attrs.define(init=False)
class OtfUser:
    """Wrapper around Cognito authentication."""

    cognito_id: str      # From access token claims
    member_uuid: str     # From ID token claims
    email_address: str   # From ID token claims
    cognito: OtfCognito  # Auth handler
    httpx_auth: HttpxCognitoAuth  # Request auth middleware

    def __init__(self, username=None, password=None, ...):
        # 1. Try to create Cognito with provided credentials
        # 2. If no credentials, try environment vars
        # 3. If still nothing, prompt user
        # 4. Extract claims from tokens
        # 5. Create auth middleware for requests
```

### Your Node.js Design with Amplify

```typescript
import { Amplify } from 'aws-amplify';
import { signIn, signOut, fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

interface OtfUserConfig {
  username?: string;
  password?: string;
}

class OtfUser {
  private username: string;
  private password: string;

  // Properties extracted from tokens
  public cognitoId?: string;
  public memberUuid?: string;
  public email?: string;

  constructor(config: OtfUserConfig = {}) {
    this.username = config.username ?? process.env.OTF_EMAIL ?? '';
    this.password = config.password ?? process.env.OTF_PASSWORD ?? '';

    // Configure Amplify (do this once at app startup)
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: 'us-east-1_dYDxUeyL1',
          userPoolClientId: '65knvqta6p37efc2l3eh26pl00',
        },
      },
    });
  }

  async login(): Promise<void> {
    const { nextStep } = await signIn({
      username: this.username,
      password: this.password,
    });

    if (nextStep.signInStep === 'DONE') {
      await this.extractUserInfo();
    }
  }

  async getAuthHeader(): Promise<string> {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? '';
  }

  private async extractUserInfo(): Promise<void> {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    const accessToken = session.tokens?.accessToken;

    // Extract claims from tokens
    // These are available via the token's payload
    this.cognitoId = accessToken?.payload?.sub as string;
    this.memberUuid = idToken?.payload?.['cognito:username'] as string;
    this.email = idToken?.payload?.email as string;
  }
}
```

---

## Key Takeaways

1. **Token-based auth** separates login from API usage
2. **Three tokens**: ID (identity), Access (authorization), Refresh (renewal)
3. **SRP protocol** protects your password during login
4. **JWTs** contain claims you can decode (but not forge)
5. **Token management** is critical - store securely, refresh proactively
6. **Cognito** is AWS's auth service - OTF uses it, you'll interface with it
7. **Use AWS Amplify** - the `amazon-cognito-identity-js` package is deprecated; Amplify provides automatic token refresh and better TypeScript support

---

## Exercises Summary

Complete these before moving to Module 3:

- [ ] Exercise 2.1: Research Cognito and SRP
- [ ] Exercise 2.2: Decode a JWT and understand claims
- [ ] Exercise 2.3: Research AWS Amplify Auth and its API
- [ ] Exercise 2.4: Design your token storage strategy
- [ ] Bonus: Write a function that checks if a JWT is expired

---

## Next Module

[[03-reverse-engineering]] - Learn how to discover API endpoints using browser DevTools
