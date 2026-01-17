# Building an API Client in Node.js

Learn how to build a production-quality API client by reverse-engineering and reimplementing the [otf-api](https://github.com/NodeJSmith/otf-api) Python library in Node.js/TypeScript.

## What You'll Build

An unofficial OrangeTheory Fitness API client that can:
- Authenticate with AWS Cognito
- Retrieve workout and performance data
- Access class schedules and studio information
- Manage class bookings

## Prerequisites

- Comfortable with JavaScript/TypeScript basics
- Familiar with `async/await` and Promises
- Basic understanding of HTTP (GET, POST, headers)
- Node.js 18+ installed (for native `fetch`)

## Study Guide Modules

| Module | Topic | Key Concepts |
|--------|-------|--------------|
| [[01-http-fundamentals]] | HTTP & API Fundamentals | Requests, responses, headers, status codes |
| [[02-authentication-cognito]] | Authentication & AWS Cognito | OAuth flows, tokens, credential management |
| [[03-reverse-engineering]] | Reverse Engineering APIs | DevTools, intercepting requests, discovering endpoints |
| [[04-http-client]] | Building the HTTP Client | fetch, axios, retries, timeouts |
| [[05-data-modeling]] | Data Modeling with TypeScript | Interfaces, Zod validation, type safety |
| [[06-api-architecture]] | API Module Architecture | Class design, separation of concerns |
| [[07-error-handling]] | Error Handling & Reliability | Custom errors, retries, graceful failures |

## Python Reference Architecture

```
otf-api/src/otf_api/
├── api/
│   ├── api.py          → Main Otf class (orchestrator)
│   ├── client.py       → OtfClient (HTTP layer)
│   ├── bookings/       → BookingApi (domain logic)
│   ├── members/        → MemberApi
│   ├── studios/        → StudioApi
│   └── workouts/       → WorkoutApi
├── auth/
│   ├── auth.py         → OtfCognito, HttpxCognitoAuth
│   └── user.py         → OtfUser (credential wrapper)
├── models/
│   ├── base.py         → OtfItemBase (Pydantic base)
│   ├── bookings/       → Booking models
│   ├── members/        → Member models
│   └── ...
├── cache.py            → Token/credential caching
└── exceptions.py       → Custom exception classes
```

## Your Node.js Target Architecture

```
otf-api-node/src/
├── api/
│   ├── otf.ts          → Main Otf class
│   ├── client.ts       → OtfClient (HTTP layer)
│   ├── bookings.ts     → BookingApi
│   ├── members.ts      → MemberApi
│   ├── studios.ts      → StudioApi
│   └── workouts.ts     → WorkoutApi
├── auth/
│   ├── cognito.ts      → Cognito authentication
│   └── user.ts         → OtfUser class
├── models/
│   ├── booking.ts      → Booking types + Zod schemas
│   ├── member.ts       → Member types
│   └── ...
├── cache.ts            → Token caching
├── errors.ts           → Custom error classes
└── index.ts            → Public exports
```

## How to Use This Guide

1. **Read each module in order** - concepts build on each other
2. **Study the Python reference** - understand _what_ it does before _how_ to do it in Node
3. **Complete the exercises** - hands-on practice is essential
4. **Build incrementally** - start with auth, then client, then one API module

## Key Differences: Python → Node.js

| Python | Node.js Equivalent |
|--------|-------------------|
| `httpx` | `fetch` or `axios` |
| `pydantic` | `zod` + TypeScript interfaces |
| `attrs` | TypeScript classes |
| `pycognito` | `amazon-cognito-identity-js` or manual implementation |
| `async with` | `try/finally` or wrapper functions |

## Resources

- [Python otf-api source](https://github.com/NodeJSmith/otf-api)
- [AWS Cognito Docs](https://docs.aws.amazon.com/cognito/)
- [Zod Documentation](https://zod.dev/)
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
