# System Design in a Hurry

> High-level mental models for each core concept. Not a deep dive — a vocabulary builder.
> Based on: [Hello Interview — Core Concepts](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts)

The goal here is to internalize the **why** and the **when** for each concept before going deep. Think of these as the vocabulary cards you review before an interview, not the textbook.

---

## Topics

| # | Topic | One-Line Mental Model |
|---|-------|-----------------------|
| 01 | [Networking Essentials](01-networking.md) | Distance = latency. CDN = move the data closer. |
| 02 | [API Design](02-api-design.md) | Contracts between clients and servers. Get this wrong and everything else is wrong. |
| 03 | [Data Modeling](03-data-modeling.md) | How you shape your data determines what queries are fast. |
| 04 | [Caching](04-caching.md) | Store expensive results close to where they're needed. |
| 05 | [Sharding](05-sharding.md) | Split data across machines when one machine isn't enough. |
| 06 | [Consistent Hashing](06-consistent-hashing.md) | A smarter way to shard so adding/removing nodes doesn't reshuffle everything. |
| 07 | [CAP Theorem](07-cap-theorem.md) | During a network failure, you must choose: consistency or availability. |
| 08 | [Database Indexing](08-database-indexing.md) | A lookup table that trades write cost for read speed. |
| 09 | [Numbers to Know](09-numbers-to-know.md) | Back-of-envelope anchors every interviewer expects you to know. |
