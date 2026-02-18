IF product is NOT a product of Mexico:
    APPLY normal Ch. 1–97 duties
    APPLY AD/CVD if applicable
    STOP


IF personal use in accompanied baggage:
    NO Chapter 99 Mexico duty
    APPLY normal Ch. 1–97 duties
    STOP


IF humanitarian donation qualifying under 9903.01.02:
    NO Chapter 99 Mexico duty
    APPLY normal Ch. 1–97 duties
    STOP


IF product is explicitly provided for in:
    9903.01.03 OR
    9903.01.04 OR
    9903.76.01–9903.76.03:

    APPLY the rate specified in that heading
    APPLY normal Ch. 1–97 duties
    STOP


IF product is provided for in heading 9903.01.05:
    chapter99_rate = 10%
    chapter99_heading = 9903.01.05
ELSE:
    chapter99_rate = 25%
    chapter99_heading = 9903.01.01


IF shipment qualifies for de minimis AND de minimis not revoked:
    Chapter 99 duty not collected
ELSE:
    COLLECT Chapter 99 duty normally


ALWAYS:
    Total Duty =
        (MFN or preferential rate under Ch. 1–97)
        + Chapter 99 additional duty
        + AD/CVD (if applicable)
        + any other taxes/fees
