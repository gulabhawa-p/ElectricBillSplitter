import { CalculationForm, CalculationResult } from "@shared/schema";

/**
 * Calculates the bill shares based on meter readings and bill amount
 * 
 * @param formData - The form data containing meter readings and bill amount
 * @returns The calculated result
 */
export function calculateBillShares(formData: CalculationForm): CalculationResult {
  const mainMeter = formData.mainMeterReading;
  const abcdMeter = formData.abcdMeterReading;
  const xyzMeter = formData.xyzMeterReading;
  const okbdMeter = formData.okbdMeterReading;
  const billAmount = formData.billAmount;
  
  // Calculate total sub-meter readings
  const totalSubMeters = abcdMeter + xyzMeter + okbdMeter;
  
  // Calculate common usage
  const commonUsage = mainMeter - totalSubMeters;
  
  if (commonUsage < 0) {
    throw new Error("Sum of sub-meter readings exceeds main meter reading");
  }
  
  // Calculate percentages
  const abcdPercent = (abcdMeter / mainMeter) * 100;
  const xyzPercent = (xyzMeter / mainMeter) * 100;
  const okbdPercent = (okbdMeter / mainMeter) * 100;
  const commonPercent = (commonUsage / mainMeter) * 100;
  
  // Calculate shares
  const abcdShare = (abcdMeter / mainMeter) * billAmount;
  const xyzShare = (xyzMeter / mainMeter) * billAmount;
  const okbdShare = (okbdMeter / mainMeter) * billAmount;
  const commonShare = (commonUsage / mainMeter) * billAmount;
  const commonSharePerPerson = commonShare / 3; // Divided equally among 3 tenants
  
  return {
    mainMeter,
    abcdMeter,
    xyzMeter,
    okbdMeter,
    billAmount,
    commonUsage,
    abcdShare,
    xyzShare,
    okbdShare,
    commonShare,
    commonSharePerPerson,
    abcdPercent,
    xyzPercent,
    okbdPercent,
    commonPercent,
    fromDate: formData.fromDate,
    toDate: formData.toDate,
    meterImages: formData.meterImages,
    billImage: formData.billImage
  };
}

/**
 * Formats a number as currency (INR)
 * 
 * @param value - The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value).replace('₹', '');
}

/**
 * Formats a date in the format "MMM D" (e.g., "Feb 1")
 * 
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats a date range for display
 * 
 * @param fromDate - Start date
 * @param toDate - End date
 * @returns Formatted date range string
 */
export function formatDateRange(fromDate: Date, toDate: Date): string {
  const fromFormatted = formatDate(fromDate);
  const toFormatted = formatDate(toDate);
  return `${fromFormatted} - ${toFormatted}, ${toDate.getFullYear()}`;
}

/**
 * Sets default date values (bimonthly)
 * 
 * @returns Object with fromDate and toDate set to bimonthly interval
 */
export function getDefaultDates(): { fromDate: Date, toDate: Date } {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setMonth(toDate.getMonth() - 2);
  
  return { fromDate, toDate };
}
