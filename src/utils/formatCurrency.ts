/**
 * Format a number as currency string.
 * @param amount - Amount in smallest unit (e.g. paise for INR)
 * @param currency - ISO 4217 currency code
 * @param locale - BCP 47 locale tag
 */
export function formatCurrency(
  amount: number,
  currency: 'INR' | 'USD' | 'EUR' = 'INR',
  locale: string = 'en-IN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format paise (1/100 INR) to ₹ string */
export function formatPaise(paise: number): string {
  return formatCurrency(paise / 100, 'INR', 'en-IN');
}
