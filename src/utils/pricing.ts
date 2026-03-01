import type { PricingConfig } from '../types/booking';

/**
 * Calculate total price for a booking based on effective weeks.
 * 1 month is treated as exactly 4 weeks.
 * Example for 10 weeks: 2 months (8 weeks) + 2 weeks remaining.
 * Total = (2 * price_1m) + price_2w.
 */
export const calculatePrice = (effectiveWeeks: number, pricing: PricingConfig): {
    total: number;
    tierLabel: string;
} => {
    // Treat any <1 week as 1 week for simplest fallback
    const weeks = Math.max(1, effectiveWeeks);

    const months = Math.floor(weeks / 4);
    const remainingWeeks = weeks % 4;

    const basePrice = (months * pricing.price_1m);
    const remainderPrice =
        remainingWeeks === 3 ? pricing.price_3w :
            remainingWeeks === 2 ? pricing.price_2w :
                remainingWeeks === 1 ? pricing.price_1w : 0;

    const total = basePrice + remainderPrice;

    // Generate descriptive label
    let tierLabel = '';
    if (months > 0) tierLabel += `${months} month${months > 1 ? 's' : ''}`;
    if (remainingWeeks > 0) {
        if (tierLabel) tierLabel += ' + ';
        tierLabel += `${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}`;
    }
    if (!tierLabel) tierLabel = '0 weeks';

    return { total, tierLabel };
};
