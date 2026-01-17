# Module 6: API Module Architecture

This module covers designing the high-level API structure that organizes endpoints into logical modules.

## Learning Objectives

- Understand separation of concerns in API clients
- Design the main Otf orchestrator class
- Create domain-specific API modules (Bookings, Members, etc.)
- Implement lazy loading and caching
- Connect all the pieces together

---

## 6.1 Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                          User Code                              │
│                                                                 │
│  const otf = new Otf(user);                                    │
│  const classes = await otf.bookings.getClasses();              │
│  const member = await otf.members.getDetails();                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Otf (Orchestrator)                       │
│                                                                  │
│  - Holds reference to user/auth                                 │
│  - Creates and exposes API modules                              │
│  - Provides shared state (member UUID, home studio)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐      │
│  │ Bookings │  │  Members  │  │ Workouts  │  │ Studios  │      │
│  │   Api    │  │    Api    │  │    Api    │  │   Api    │      │
│  └────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬─────┘      │
│       │              │              │              │             │
│       └──────────────┴──────────────┴──────────────┘             │
│                              │                                   │
│                       ┌──────┴──────┐                            │
│                       │  OtfClient  │                            │
│                       │  (HTTP)     │                            │
│                       └─────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Python Reference: Main Otf class

```python
# From api.py
class Otf:
    """Primary OTF class - provides data enrichment and serialization."""

    def __init__(self, user: OtfUser | None = None):
        client = OtfClient(user)

        # Create API module instances
        self.bookings = BookingApi(self, client)
        self.members = MemberApi(self, client)
        self.workouts = WorkoutApi(self, client)
        self.studios = StudioApi(self, client)

        # Internal state
        self._member: models.MemberDetail | None = None
```

---

## 6.2 The Orchestrator Pattern

The main `Otf` class orchestrates everything but delegates actual work.

### Python Reference: Otf properties

```python
# From api.py - Otf provides convenient accessors
class Otf:
    @property
    def member_uuid(self) -> str:
        """Get the member UUID for the authenticated user."""
        return self.member.member_uuid

    @property
    def member(self) -> models.MemberDetail:
        """Lazy-load member details on first access."""
        if self._member is None:
            self._member = self.members.get_member()
        return self._member

    @property
    def home_studio(self) -> models.StudioDetail:
        """Get the user's home studio."""
        return self.member.home_studio

    def refresh_member(self) -> None:
        """Force refresh of member data."""
        self._member = None
        _ = self.member  # Trigger reload
```

### Your Implementation Sketch

```typescript
// TODO: Implement the Otf orchestrator

class Otf {
  // API modules
  public readonly bookings: BookingApi;
  public readonly members: MemberApi;
  public readonly workouts: WorkoutApi;
  public readonly studios: StudioApi;

  // Internal state
  private _member: MemberDetail | null = null;
  private client: OtfClient;

  constructor(user?: OtfUser) {
    // TODO: Initialize client and modules
  }

  // Lazy-loaded member
  get member(): Promise<MemberDetail> {
    // TODO: Return cached or fetch
  }

  get memberUuid(): Promise<string> {
    // TODO: Get from member
  }

  get homeStudio(): Promise<StudioDetail> {
    // TODO: Get from member
  }

  async refreshMember(): Promise<void> {
    // TODO: Clear cache and refetch
  }
}
```

### Exercise 6.1: Design Questions

Think through these design decisions:

1. Should `member` be a property that returns a Promise, or should it be pre-fetched?
2. How do API modules get access to `memberUuid` when they need it?
3. What happens if `member` fetch fails? How do other APIs handle it?

---

## 6.3 API Module Design

Each API module handles a specific domain.

### Python Reference: BookingApi structure

```python
# From booking_api.py
class BookingApi:
    """Booking operations - list, create, cancel bookings."""

    def __init__(self, otf: Otf, client: OtfClient):
        self.otf = otf      # Reference to orchestrator (for member_uuid, etc.)
        self.client = client  # Reference to HTTP client

    def get_classes(
        self,
        studio_uuids: list[str] | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[models.OtfClass]:
        """Get available classes."""
        # Use orchestrator to get home studio if not provided
        if studio_uuids is None:
            studio_uuids = [self.otf.home_studio_uuid]

        response = self.client.get_classes(
            studio_uuids=studio_uuids,
            start_date=start_date,
            end_date=end_date
        )

        return [models.OtfClass.create(**c, api=self.otf) for c in response]

    def book_class(self, otf_class: models.OtfClass) -> models.Booking:
        """Book a class."""
        body = {
            "classUUId": otf_class.class_uuid,
            "memberUUId": self.otf.member_uuid,
            "confirmed": True
        }
        response = self.client.put_class(body=body)
        return models.Booking.create(**response, api=self.otf)
```

### Your Implementation Pattern

```typescript
// Base pattern for API modules

class BookingApi {
  constructor(
    private otf: Otf,        // For shared state
    private client: OtfClient // For HTTP requests
  ) {}

  async getClasses(options: GetClassesOptions = {}): Promise<OtfClass[]> {
    // 1. Apply defaults (use home studio if not specified)
    const studioUuids = options.studioUuids ?? [await this.otf.homeStudioUuid];

    // 2. Call client
    const response = await this.client.get('/v1/classes', {
      studioUuids: studioUuids.join(','),
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    });

    // 3. Validate and transform
    return z.array(OtfClassSchema).parse(response);
  }

  async bookClass(otfClass: OtfClass): Promise<Booking> {
    const memberUuid = await this.otf.memberUuid;

    const response = await this.client.put('/v1/bookings', {
      classUUId: otfClass.classUuid,
      memberUUId: memberUuid,
      confirmed: true
    });

    return BookingSchema.parse(response);
  }

  async cancelBooking(booking: Booking): Promise<void> {
    await this.client.delete(`/v1/bookings/${booking.bookingUuid}`);
  }
}
```

---

## 6.4 Method Parameters Pattern

Provide flexible parameters with sensible defaults.

### Python Reference: Parameter patterns

```python
# From booking_api.py
def get_bookings(
    self,
    start_date: date | None = None,   # Optional - defaults to today
    end_date: date | None = None,      # Optional - defaults to +7 days
    status: BookingStatus | None = None,  # Optional - filter by status
    limit: int | None = None           # Optional - pagination
) -> list[models.Booking]:
    """Get user's bookings with optional filters."""

    # Apply smart defaults
    if start_date is None:
        start_date = date.today()
    if end_date is None:
        end_date = start_date + timedelta(days=7)

    # ...
```

### TypeScript Approach

```typescript
// Use interfaces for options
interface GetBookingsOptions {
  startDate?: Date;
  endDate?: Date;
  status?: BookingStatus;
  limit?: number;
}

async getBookings(options: GetBookingsOptions = {}): Promise<Booking[]> {
  // Apply defaults
  const startDate = options.startDate ?? new Date();
  const endDate = options.endDate ?? addDays(startDate, 7);

  // Build params - only include defined values
  const params = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    ...(options.status && { status: options.status }),
    ...(options.limit && { limit: options.limit.toString() })
  };

  const response = await this.client.get('/v1/bookings', params);
  return z.array(BookingSchema).parse(response);
}
```

### Exercise 6.2: Design an API Method

Design the `getWorkouts` method:

**Requirements:**
- Can fetch workouts for date range
- Can filter by workout type
- Defaults to last 30 days if no dates provided
- Returns typed workout data

Write:
1. The TypeScript interface for options
2. The method signature
3. Pseudocode for the implementation

---

## 6.5 Data Enrichment

API responses often need additional context or related data.

### Python Reference: Model enrichment

```python
# From booking_api.py - models can access the API
class Booking(OtfItemBase):
    booking_uuid: str
    class_uuid: str
    _api: Otf | None = None  # Internal reference to API

    @classmethod
    def create(cls, api: Otf, **data) -> "Booking":
        """Create with API reference for enrichment."""
        instance = cls(**data)
        instance._api = api
        return instance

    @property
    def otf_class(self) -> OtfClass:
        """Fetch the full class details."""
        if self._api is None:
            raise ValueError("No API reference")
        return self._api.bookings.get_class(self.class_uuid)
```

### TypeScript Approach

```typescript
// Option 1: Enriched models (similar to Python)
class Booking {
  constructor(
    public data: BookingData,
    private api?: Otf
  ) {}

  async getClass(): Promise<OtfClass> {
    if (!this.api) throw new Error('No API reference');
    return this.api.bookings.getClass(this.data.classUuid);
  }
}

// Option 2: Keep models simple, enrich in API layer
async getBookingsWithClasses(options?: GetBookingsOptions): Promise<BookingWithClass[]> {
  const bookings = await this.getBookings(options);

  // Fetch related classes
  const classIds = [...new Set(bookings.map(b => b.classUuid))];
  const classes = await this.getClassesByIds(classIds);
  const classMap = new Map(classes.map(c => [c.classUuid, c]));

  // Combine
  return bookings.map(b => ({
    ...b,
    class: classMap.get(b.classUuid)!
  }));
}
```

### Exercise 6.3: Choose an Enrichment Strategy

Consider the trade-offs:

| Approach | Pros | Cons |
|----------|------|------|
| Model with API reference | Lazy loading, clean usage | Circular deps, harder to serialize |
| Enrichment in API layer | Simple models, explicit | More API methods, more boilerplate |
| Fetch all upfront | Single request | Over-fetching, slower initial load |

Which would you choose for your implementation and why?

---

## 6.6 Connecting Everything

### Main Entry Point

```typescript
// src/index.ts - public API

export { Otf } from './api/otf';
export { OtfUser } from './auth/user';

// Re-export types users might need
export type {
  OtfClass,
  Booking,
  MemberDetail,
  StudioDetail,
  WorkoutSummary
} from './models';

// Re-export options interfaces
export type {
  GetClassesOptions,
  GetBookingsOptions,
  GetWorkoutsOptions
} from './api/types';
```

### Usage Example

```typescript
// How users will use your library

import { Otf, OtfUser } from 'otf-api';

// Create user (handles auth)
const user = new OtfUser({
  username: process.env.OTF_EMAIL,
  password: process.env.OTF_PASSWORD
});

// Create API client
const otf = new Otf(user);

// Use the API
const classes = await otf.bookings.getClasses({
  startDate: new Date(),
  endDate: addDays(new Date(), 7)
});

console.log(`Found ${classes.length} classes`);

for (const cls of classes) {
  console.log(`${cls.name} at ${cls.startTime} (${cls.availableSpots} spots)`);
}
```

### Python Reference: Usage example

```python
# From README - how the Python library is used
from otf_api import Otf

otf = Otf()  # Uses env vars or prompts for credentials

# Get upcoming classes
classes = otf.bookings.get_classes()
for cls in classes:
    print(f"{cls.name} - {cls.coach.name} - {cls.start_time}")

# Book a class
booking = otf.bookings.book_class(classes[0])
print(f"Booked! Confirmation: {booking.booking_uuid}")
```

---

## 6.7 File Organization

### Complete Project Structure

```
src/
├── index.ts                 # Public exports
├── api/
│   ├── otf.ts              # Main Otf orchestrator
│   ├── client.ts           # OtfClient HTTP layer
│   ├── bookings.ts         # BookingApi
│   ├── members.ts          # MemberApi
│   ├── workouts.ts         # WorkoutApi
│   ├── studios.ts          # StudioApi
│   └── types.ts            # Shared API types/options
├── auth/
│   ├── cognito.ts          # Cognito auth implementation
│   ├── user.ts             # OtfUser class
│   └── cache.ts            # Token caching
├── models/
│   ├── index.ts            # Re-exports
│   ├── booking.ts          # Booking, OtfClass schemas
│   ├── member.ts           # Member schemas
│   ├── studio.ts           # Studio schemas
│   └── workout.ts          # Workout schemas
└── errors.ts               # Custom error classes
```

---

## Key Takeaways

1. **Orchestrator pattern** - Main class coordinates modules, provides shared state
2. **Domain-specific modules** - Each API module handles one area (bookings, members, etc.)
3. **Flexible parameters** - Use interfaces with smart defaults
4. **Lazy loading** - Fetch data only when needed
5. **Clean public API** - Export only what users need

---

## Exercises Summary

Complete these before moving to Module 7:

- [ ] Exercise 6.1: Answer design questions about the Otf class
- [ ] Exercise 6.2: Design a getWorkouts API method
- [ ] Exercise 6.3: Choose and justify an enrichment strategy
- [ ] Bonus: Write the complete Otf class skeleton

---

## Next Module

[[07-error-handling]] - Implement robust error handling and retry logic
