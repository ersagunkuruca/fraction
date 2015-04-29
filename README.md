# fraction
BigInteger, Fraction and FractionData classes for JavaScript.

Somewhat undocumented right now, so here is a quick introduction:

- *BigInteger* implements arbitrarily large integer operations by using a 32 bit integer array and a sign property for each integer.
- *Fraction* implements arbitrary fractions using two BigIntegers one for numerator, one for denominator. Normalization is off by default for now. GCD is too slow for large integers.
- *FractionData* extracts arbitrary data from a *Fraction* between 0 and 1. It can decode any arithmetic coded data.

*BigInteger* and *Fraction* classes have similar methods. Methods starting with an underscore change the original data.
