# Module 5: Data Modeling with TypeScript

This module covers defining types for API responses and validating data at runtime using Zod.

## Learning Objectives

- Understand the difference between TypeScript types and runtime validation
- Create interfaces that match API response shapes
- Use Zod for runtime validation and parsing
- Handle optional and nullable fields
- Transform API data into your desired format

---

## 5.1 Types vs Runtime Validation

### The Problem

TypeScript types are erased at runtime:

```typescript
interface User {
  id: string;
  email: string;
  age: number;
}

// TypeScript thinks this is fine at compile time
const data: User = await response.json();

// But at runtime, if the API returns { id: 123, email: null }
// You won't know until something crashes!
```

### The Solution: Runtime Validation

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  age: z.number()
});

// This THROWS if data doesn't match
const user = UserSchema.parse(await response.json());

// Now you KNOW the data is valid
```

### Python Reference: Pydantic models

```python
# From models/base.py - Pydantic does both types AND validation
from pydantic import BaseModel

class OtfItemBase(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        extra="ignore"  # Ignore extra fields from API
    )
```

---

## 5.2 Mapping API Responses to Types

First, understand the API response shape, then create matching types.

### Step 1: Capture a Real Response

```json
{
  "classUuid": "abc-123",
  "studioUuid": "studio-456",
  "name": "Orange 60",
  "coach": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T10:00:00Z",
  "maxCapacity": 24,
  "enrollmentCount": 18,
  "waitlistSize": 0,
  "isCancelled": false
}
```

### Step 2: Create TypeScript Interface

```typescript
interface Coach {
  firstName: string;
  lastName: string;
}

interface OtfClass {
  classUuid: string;
  studioUuid: string;
  name: string;
  coach: Coach;
  startTime: string;  // ISO date string
  endTime: string;
  maxCapacity: number;
  enrollmentCount: number;
  waitlistSize: number;
  isCancelled: boolean;
}
```

### Step 3: Create Zod Schema

```typescript
import { z } from 'zod';

const CoachSchema = z.object({
  firstName: z.string(),
  lastName: z.string()
});

const OtfClassSchema = z.object({
  classUuid: z.string(),
  studioUuid: z.string(),
  name: z.string(),
  coach: CoachSchema,
  startTime: z.string(),
  endTime: z.string(),
  maxCapacity: z.number(),
  enrollmentCount: z.number(),
  waitlistSize: z.number(),
  isCancelled: z.boolean()
});

// Infer the type from the schema (no duplication!)
type OtfClass = z.infer<typeof OtfClassSchema>;
```

### Python Reference: Pydantic model definition

```python
# From models/bookings/classes.py (conceptual)
class OtfClass(OtfItemBase):
    class_uuid: str
    studio_uuid: str
    name: str
    coach: Coach
    start_time: datetime
    end_time: datetime
    max_capacity: int
    enrollment_count: int
    waitlist_size: int
    is_cancelled: bool
```

---

## 5.3 Handling Optional and Nullable Fields

APIs often have optional or nullable fields. Handle them correctly.

### Python Reference: Optional fields

```python
# Python uses Optional or | None
class Booking(OtfItemBase):
    booking_uuid: str
    class_uuid: str
    waitlist_position: int | None = None  # Optional, might be null
    cancelled_date: datetime | None = None
```

### Zod Equivalents

```typescript
const BookingSchema = z.object({
  bookingUuid: z.string(),
  classUuid: z.string(),

  // Optional: might not exist in response
  waitlistPosition: z.number().optional(),

  // Nullable: exists but value is null
  cancelledDate: z.string().nullable(),

  // Both: might not exist, or might be null
  notes: z.string().optional().nullable(),

  // Default value if missing
  status: z.string().default('confirmed')
});
```

### Exercise 5.1: Model a Booking Response

Given this API response:

```json
{
  "bookingUuid": "booking-123",
  "classUuid": "class-456",
  "memberUuid": "member-789",
  "status": "BOOKED",
  "createdAt": "2024-01-10T08:00:00Z",
  "checkInTime": null,
  "waitlistPosition": null,
  "class": {
    "name": "Orange 60",
    "startTime": "2024-01-15T09:00:00Z"
  }
}
```

Create:
1. TypeScript interface
2. Zod schema with proper optional/nullable handling
3. Inferred type from schema

---

## 5.4 Transforming Data

Sometimes you want to transform API data into a different shape.

### Python Reference: Computed properties

```python
# From models - computed properties and transforms
class OtfClass(OtfItemBase):
    start_time: datetime
    end_time: datetime

    @property
    def duration_minutes(self) -> int:
        """Computed property - not from API."""
        return int((self.end_time - self.start_time).total_seconds() / 60)
```

### Zod Transforms

```typescript
const OtfClassSchema = z.object({
  classUuid: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  maxCapacity: z.number(),
  enrollmentCount: z.number()
}).transform((data) => ({
  ...data,
  // Parse dates
  startTime: new Date(data.startTime),
  endTime: new Date(data.endTime),
  // Compute derived values
  availableSpots: data.maxCapacity - data.enrollmentCount,
  isFull: data.enrollmentCount >= data.maxCapacity
}));

// Result type includes the transformed fields
type OtfClass = z.infer<typeof OtfClassSchema>;
// {
//   classUuid: string;
//   startTime: Date;      // Now a Date, not string!
//   endTime: Date;
//   maxCapacity: number;
//   enrollmentCount: number;
//   availableSpots: number;  // Computed
//   isFull: boolean;         // Computed
// }
```

### Exercise 5.2: Add Computed Properties

Take your Booking schema from 5.1 and add transforms for:
1. Parse `createdAt` into a Date object
2. Add `isWaitlisted` boolean (true if waitlistPosition is not null)
3. Add `canCancel` boolean (true if checkInTime is null)

---

## 5.5 Handling API Response Wrappers

APIs often wrap data in containers.

### Common Patterns

```json
// Pattern 1: Direct array
[{ "classUuid": "..." }, { "classUuid": "..." }]

// Pattern 2: Wrapped in object
{
  "data": [{ "classUuid": "..." }],
  "pagination": { "page": 1, "total": 50 }
}

// Pattern 3: Keyed by type
{
  "classes": [{ "classUuid": "..." }],
  "studios": [{ "studioUuid": "..." }]
}
```

### Handling Wrappers in Zod

```typescript
// For wrapped responses
const ClassListResponseSchema = z.object({
  data: z.array(OtfClassSchema),
  pagination: z.object({
    page: z.number(),
    total: z.number()
  }).optional()
});

// For direct arrays
const ClassArraySchema = z.array(OtfClassSchema);
```

### Python Reference: Response handling

```python
# From booking_api.py - unwrapping responses
def get_classes(self, ...) -> list[models.OtfClass]:
    response = self.client.get_classes(...)
    # Response might be wrapped, need to extract data
    classes_data = response.get("classes", response)
    return [models.OtfClass(**c) for c in classes_data]
```

---

## 5.6 Dealing with Inconsistent APIs

Real APIs are messy. The same field might have different names or formats.

### Python Reference: Field aliases

```python
# Pydantic supports field aliases
class Studio(OtfItemBase):
    studio_uuid: str = Field(alias="studioUUId")  # API uses different name
    name: str = Field(alias="studioName")
```

### Zod Preprocessing

```typescript
// Handle inconsistent field names
const StudioSchema = z.preprocess(
  // Preprocessing step - normalize the data
  (data: any) => ({
    studioUuid: data.studioUUId || data.studio_uuid || data.studioUuid,
    name: data.studioName || data.name,
    ...data
  }),
  // Then validate the normalized shape
  z.object({
    studioUuid: z.string(),
    name: z.string()
  })
);

// Handle different date formats
const DateSchema = z.preprocess(
  (val) => {
    if (typeof val === 'string') return new Date(val);
    if (typeof val === 'number') return new Date(val * 1000);  // Unix timestamp
    return val;
  },
  z.date()
);
```

### Exercise 5.3: Handle Messy Data

Create a schema that handles this inconsistent member response:

```json
// Sometimes returns:
{ "memberUUID": "123", "firstName": "John", "email_address": "john@x.com" }

// Other times returns:
{ "member_uuid": "123", "first_name": "John", "emailAddress": "john@x.com" }
```

Your schema should normalize both to:
```typescript
{ memberUuid: string; firstName: string; email: string }
```

---

## 5.7 Organizing Models

Structure your models folder cleanly.

### Python Reference: Models organization

```
models/
├── __init__.py       # Public exports
├── base.py           # OtfItemBase
├── mixins.py         # Shared functionality
├── bookings/
│   ├── __init__.py
│   ├── booking.py
│   └── classes.py
├── members/
│   └── member.py
└── studios/
    └── studio.py
```

### Suggested Node.js Structure

```
models/
├── index.ts          # Re-export everything
├── base.ts           # Base schemas/utilities
├── booking.ts        # Booking, OtfClass schemas
├── member.ts         # Member, MemberDetail schemas
├── studio.ts         # Studio schemas
└── workout.ts        # Workout, Performance schemas
```

### Example: models/index.ts

```typescript
// Re-export all models for easy imports
export * from './booking';
export * from './member';
export * from './studio';
export * from './workout';

// Also export common types
export type { ApiResponse, PaginatedResponse } from './base';
```

---

## 5.8 Validation Strategies

When and how to validate.

### Strategy 1: Validate at Boundary

```typescript
// Validate immediately when data enters your system
class OtfClient {
  async getClasses(): Promise<OtfClass[]> {
    const response = await this.get('/v1/classes');
    return z.array(OtfClassSchema).parse(response);  // Validate here
  }
}
```

### Strategy 2: Safe Parse (Don't Throw)

```typescript
// When you want to handle validation errors gracefully
const result = OtfClassSchema.safeParse(data);

if (result.success) {
  console.log(result.data);  // Typed correctly
} else {
  console.error('Validation failed:', result.error.issues);
}
```

### Strategy 3: Partial Validation (Development)

```typescript
// During development, be lenient about extra fields
const DevSchema = OtfClassSchema.passthrough();  // Allow extra fields

// In production, be strict
const ProdSchema = OtfClassSchema.strict();  // Fail on extra fields
```

---

## Key Takeaways

1. **TypeScript types vanish at runtime** - you need runtime validation
2. **Zod provides both** - define schema once, get type + validation
3. **Use transforms** - convert strings to Dates, add computed fields
4. **Handle nullable vs optional** - they're different things
5. **Normalize messy APIs** - use preprocess for inconsistent data
6. **Validate at boundaries** - when data enters your system

---

## Exercises Summary

Complete these before moving to Module 6:

- [ ] Exercise 5.1: Model a Booking response with nullable fields
- [ ] Exercise 5.2: Add computed properties with transforms
- [ ] Exercise 5.3: Handle inconsistent field names
- [ ] Bonus: Create a complete `models/` folder structure with 2-3 models

---

## Next Module

[[06-api-architecture]] - Design the API module layer that uses these models
