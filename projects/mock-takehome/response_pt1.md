## Problem Summary

Our users count on us to keep their records guarded and any access to them should have a speficic reason, and more importantly -- HIPPA compliant.
Not every reason requires access to records and we need to `require` any of our providers to enter a reason why they need these records in the first place.

Thus, we should introduce a user flow where through any of our portals that expose sensitive user data have a way of inputing their reason.

## Proposed Solution

Given the sensitive nature of both the data and reason why the provider needs access, we have to audit any source that exposes records.

On the provider side: 

- We have to be specific about _why_ we're asking for a reason (eg. HIPPA compliance), and warn that we _will_ audit their reasoning. 
- We can't have a lengthy form (not add to the toil of the user)
- We can have a minimum set of dropdown/textfields that allow us to capture the necessary data without burdening the user flow.

On the auditor side:
- We need to provide an easy way for them to filter/sort through this data

## Key Decisions

Decision 1: 
