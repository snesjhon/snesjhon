## Tue, Feb 03

### Modulo

I guess I've always been under the assumption of modulo as being the remainder of a division. That's what it's always been described as. Given `a` and `b` the modulo would be `5 / 3 === 1.666` and that `6` was the modulo. But that's completely false.

The mdn describes it as

> The **remainder (`%`)** operator returns the remainder left over when one operand is divided by a second operand. It always takes the sign of the dividend.

But that's super confusing because it's not talking about the remainder of `1.66` aka the `Decimal Remainder` it's literally talking about the remainder of values AFTER division.

So, for `5 % 3` ... `3` goes into `5` ...`1` time, and the Value Remainder is `2` because `5 = 1 x 3 + 2`

Or in bigger numbers:

`8 % 3` ... `3` goes into `8` ... `2` times, and the Value Remainder is `2` because `8 = 2 x 3 + 2`

Crazy. Feels like I've never really gotten this until now.

---

"If my checkpoint value is higher than my target, then my target must be in the lower (left) region. I discard everything from checkpoint onwards."

"If my checkpoint value is lower than my target, then my target must be in the higher (right) region. I discard everything up to and including checkpoint."

---
