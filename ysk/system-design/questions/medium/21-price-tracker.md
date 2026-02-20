# 21 · Price Tracker

> **Difficulty**: Medium
> **Introduces**: change detection, event-driven alerting, web scraping at scale
> **Builds on**: [05 · News Aggregator](../easy/05-news-aggregator.md) — crawling scheduler; [22 · Notification System](22-notification-system.md) — alert delivery

---

## How I Should Think About This

A price tracker (like CamelCamelCamel for Amazon or Google Shopping alerts) monitors product prices across retailers and notifies users when a price drops below their target. The core design is a **polling loop**: periodically scrape product pages, compare the new price against the last-seen price, and if it changed, trigger alerts. This is a direct extension of the News Aggregator's crawl scheduler (Q05), but now the interesting event isn't "new content exists" — it's "existing content *changed*." Change detection adds a comparison step between old and new state.

The challenging part is scale: tracking 100 million products across thousands of retailers means your scraping fleet must be large, polite (respecting robots.txt and rate limits per domain), and resilient to anti-bot measures. Each successful scrape either confirms "no change" (discard) or "price changed" (write to DB + fan-out alerts to subscribed users). The alert fan-out looks like a simplified Notification System: one price drop event triggers notifications to potentially thousands of users who had alerts set for that product. Designing the alert fan-out as a separate async step (via a message queue) keeps the scraping pipeline decoupled from the notification delivery.

---

## Whiteboard Diagram

```mermaid
graph TB
    Scheduler["Crawl Scheduler\nPriority queue by next_check_at\nfrequent for popular products\nrare for old/stale products"]

    Scrapers["Scraper Workers\n• fetch product page\n• extract price (CSS selector / ML)\n• respect robots.txt + rate limits"]

    PriceDB[("Price DB\nproduct_id, retailer\ncurrent_price, prev_price\nlast_checked_at\nprice_history[]")]

    ChangeDetector["Change Detector\ncompare new_price vs current_price\nif changed: publish event"]

    Kafka["Kafka\nprice-change-events topic"]

    AlertService["Alert Service\nKafka consumer\nfor each event: find users\nwith alert_price >= new_price"]

    AlertDB[("Alerts DB\nuser_id, product_id\ntarget_price, created_at)]

    NotifService["Notification Service\nsend email / push / SMS"]

    User["User\n(sets price alert)"]

    User -->|"POST /alert { productId, targetPrice }"| AlertDB

    Scheduler --> Scrapers
    Scrapers -->|"new price: $89.99"| ChangeDetector
    ChangeDetector -->|"was $109.99 → now $89.99"| PriceDB
    ChangeDetector -->|"publish price-drop event"| Kafka

    Kafka --> AlertService
    AlertService -->|"SELECT users WHERE target_price >= 89.99\nAND product_id = X"| AlertDB
    AlertService --> NotifService
    NotifService --> User

    style Kafka fill:#FFD700
    style ChangeDetector fill:#90EE90
    style Scheduler fill:#e1f5ff
```

---

## Key Decisions

**1. Crawl scheduling: adaptive frequency**

Not all products need the same check frequency:

```
Frequency tiers:
  High-demand products (iPhone, PS5):      every 5 minutes
  Regular products:                        every 1 hour
  Rarely changing / old products:          every 24 hours

Implementation:
  Priority queue keyed by next_check_at timestamp
  On each successful scrape: update next_check_at = now + interval(product)
  On price change: briefly increase check frequency (price is volatile)
```

A Redis sorted set works well: `ZADD crawl_queue next_check_timestamp product_id`. Workers call `ZRANGEBYSCORE crawl_queue -inf now LIMIT 10` to claim the next batch due for scraping.

**2. Change detection**

```python
def detect_change(product_id, new_price):
    current = db.get(f"price:{product_id}")
    if current is None:
        # First time seeing this product
        db.set(f"price:{product_id}", new_price)
        return

    if abs(new_price - current.price) < 0.01:
        # No meaningful change (floating point noise)
        db.update_last_checked(product_id)
        return

    # Price changed — persist and alert
    db.update_price(product_id, new_price, prev=current.price)
    kafka.publish("price-changes", {
        product_id, new_price, prev_price: current.price,
        pct_change: (new_price - current.price) / current.price
    })
```

Store full price history for charting (Pastebin's TTL pattern in reverse — keep forever for historical data).

**3. Anti-bot and scraping reliability**

Retailers actively block scrapers:
- **Rate limiting per domain**: max N requests/sec to each retailer (respect their robots.txt)
- **User-agent rotation**: rotate browser user-agent strings
- **IP rotation**: use rotating proxy pools or residential proxies
- **Headless browser fallback**: for JS-rendered prices (Playwright/Puppeteer) when HTML scraping fails
- **Official APIs**: always prefer retailer APIs (Amazon PA-API, Google Shopping) when available — more reliable, no anti-bot friction

---

## Capacity Estimation

```
Products tracked:   100M
Check frequency:    avg 1/hr across all products
Scrape rate:        100M / 3600 = ~28,000 scrapes/sec
Price changes:      ~5% of checks detect a price change = 1,400 events/sec

Alerts to send:     1,400 events × avg 50 users/product = 70,000 notifications/sec
                    (peaks around major sales like Black Friday)

Price history:
  100M products × 365 days × 8 bytes (price + date) = ~292 GB/year → manageable
```

---

## Concepts Introduced

- **Adaptive crawl scheduling** — different check frequencies for different resource priorities. The same Redis sorted set trick reappears in: Web Crawler (Q25).
- **Change detection as an event source** — comparing new vs old state; publishing only deltas. The pattern behind changelog systems, audit logs, and CDC (Change Data Capture).
- **Fan-out on detected event** — one price change → N user notifications. The alert fan-out decoupled via Kafka. Reappears in: Notification System (Q22).
- **Scraping resilience patterns** — rate limiting, user-agent rotation, proxy pools. Operational knowledge that distinguishes a senior answer from a junior one in any web-scale data collection question.

---

## What to Study Next

➜ **[22 · Notification System](22-notification-system.md)** — the last Medium question. Generalizes the alert-delivery pattern you just saw here into a full notification infrastructure: push, in-app, email, SMS, batching, and user preferences.
