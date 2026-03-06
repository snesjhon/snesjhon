# Level 1: Consistency Models

> **Goal**: Given a data type and a business requirement, reason out loud to the right consistency guarantee.

---

## The Core Framework

Every consistency decision starts with one sentence:

> **"I need `[data type]` to be `[fresh / stale-tolerant]` because `[business reason]`, so I need a `[CP / AP]` store."**

Practice saying this out loud for every exercise below. The goal is not to memorize technologies — it's to make this sentence automatic.

---

## Exercise 1: Complete the sentence

For each data type, fill in the full reasoning sentence. The store type (CP or AP) should be the *conclusion*, not the starting point.

| Data type | Fresh or stale-tolerant? | Because... | CP or AP? |
|-----------|--------------------------|------------|-----------|
| Bank account balance | | | |
| Social media post like count | | | |
| Inventory count during checkout | | | |
| User profile bio | | | |
| Authentication session token | | | |
| Search index results | | | |
| Distributed lock ownership | | | |
| User notification feed | | | |
| Product price at payment time | | | |
| Product description on listing page | | | |

**Before checking**: What is the common thread between all "must be fresh" rows? Write it in one sentence.

> _Your answer:_

---

## Exercise 2: Classify the behavior

Given what a system *does* during a partition, identify whether it's demonstrating CP or AP behavior.

**CP behavior**: Returns an error or blocks when it cannot guarantee data freshness.
**AP behavior**: Returns data even if it might be stale — no error.

For each behavior, also write which data types it would be *safe* to use this way.

| Behavior | CP or AP? | Safe for what data? |
|----------|-----------|---------------------|
| Returns an error rather than serve stale data when nodes disagree | | |
| Serves the last known cached value when primary is unreachable | | |
| Blocks a write until a majority of nodes acknowledge it | | |
| Accepts a write on one node even if others are unreachable | | |
| Rejects a read when replica lag is detected | | |
| Returns a replica read even though the primary has newer data | | |

---

## Exercise 3: The consistency spectrum

CAP is a binary framing. Real systems live on a spectrum. Classify each behavior by its position, then write which data types each level is appropriate for.

- **Strong**: Every read reflects the most recent write by anyone
- **Read-your-writes**: After YOUR write, YOU always see YOUR own change (others may still see old)
- **Monotonic reads**: You never see data older than what you've previously seen
- **Eventual**: Nodes converge over time; reads may be stale in the interim

| Behavior | Consistency Level | Appropriate for... |
|----------|-------------------|--------------------|
| After any write, all reads everywhere return it immediately | | |
| Your own new post appears in your own feed immediately after posting | | |
| A social feed never shows older posts after newer ones have appeared | | |
| A new follower count becomes visible to everyone within ~2 seconds | | |
| A password change immediately prevents login with the old password | | |
| You see your own profile update instantly; others see it shortly after | | |

**Follow-up**: Rank these four levels from strongest (most expensive) to weakest (cheapest to implement).

> _Your ranking:_

---

## Exercise 4: Spot the mismatch

Each scenario below has a hidden consistency bug. Identify what data is at risk and why, using the core framework sentence.

| Scenario | What could go wrong? | What consistency level does this data actually need? |
|----------|----------------------|------------------------------------------------------|
| An e-commerce site stores inventory counts in an AP store to keep checkout fast | | |
| A banking app uses eventual consistency for balance reads to reduce latency | | |
| A social app uses a CP store for like counts, blocking reads during partitions | | |
| A session token is stored in an AP cache, replicated across regions | | |
| A distributed job queue uses an AP store to assign work to servers | | |

---

<details>
<summary>Answer key</summary>

**Exercise 1**

| Data type | Fresh or stale-tolerant? | Because... | CP or AP? |
|-----------|--------------------------|------------|-----------|
| Bank account balance | Fresh | Stale balance causes overdrafts or fraud | CP |
| Post like count | Stale-tolerant | A slightly wrong count is cosmetically annoying, not harmful | AP |
| Inventory at checkout | Fresh | Stale count causes overselling — real financial and operational harm | CP |
| User profile bio | Stale-tolerant | Seeing a slightly old bio causes no harm | AP |
| Auth session token | Fresh | Stale token lets a logged-out user stay authenticated — security breach | CP |
| Search index results | Stale-tolerant | Slightly outdated results are annoying but not harmful | AP |
| Distributed lock ownership | Fresh | Two nodes both thinking they hold the lock causes data corruption | CP |
| Notification feed | Stale-tolerant | Seeing a notification a second late causes no harm | AP |
| Product price at payment | Fresh | Stale price means charging the wrong amount — financial and legal harm | CP |
| Product description on listing | Stale-tolerant | Slightly outdated description is cosmetic, not harmful | AP |

Common thread: All "must be fresh" data types have **irreversible consequences** if acted upon while stale — money moves, access is granted, resources are allocated.

**Exercise 2**

| Behavior | Answer | Safe for what data? |
|----------|--------|---------------------|
| Error rather than stale when nodes disagree | CP | Financial records, locks, auth tokens |
| Serves cached value when primary down | AP | Feeds, counts, profiles, descriptions |
| Blocks write until majority ack | CP | Inventory, balances, lock ownership |
| Accepts write with single node ack | AP | Likes, notifications, search indexes |
| Rejects read when replica lag detected | CP | Session tokens, prices at checkout |
| Returns stale replica read | AP | Product descriptions, social feeds |

**Exercise 3**

| Behavior | Answer | Appropriate for... |
|----------|--------|--------------------|
| All reads reflect latest write immediately | Strong | Auth, financial records, distributed locks |
| Own post appears in own feed immediately | Read-your-writes | Social posts, profile edits |
| Feed never goes backwards | Monotonic reads | Activity feeds, timelines |
| Follower count visible within seconds | Eventual | Like counts, view counts, follower counts |
| Password change immediately effective | Strong | Auth, security-sensitive data |
| Author sees own update immediately | Read-your-writes | Profile updates, settings changes |

Ranking (strongest → weakest): Strong > Read-your-writes > Monotonic reads > Eventual

**Exercise 4**

| Scenario | What could go wrong? | What it actually needs |
|----------|----------------------|------------------------|
| Inventory in AP store | Two users both see "1 item left" and both complete checkout — oversell | CP: I need inventory to be fresh because stale counts cause real overselling harm |
| Eventual balance reads | User withdraws money, sees old balance, withdraws again — overdraft | CP: I need balance to be fresh because acting on stale balance causes financial harm |
| CP store for like counts | Like counter unavailable during any partition — massive over-engineering | AP: I need like counts to be stale-tolerant because a slightly wrong count causes no harm |
| Session token in AP cache | Logged-out token still valid in some regions — security vulnerability | CP: I need session tokens to be fresh because stale tokens allow unauthorized access |
| Job queue in AP store | Two workers both claim the same job — duplicate processing, data corruption | CP: I need lock ownership to be fresh because two owners causes irreversible data corruption |

</details>
