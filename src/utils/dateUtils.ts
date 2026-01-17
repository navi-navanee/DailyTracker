
/**
 * Returns a date string in "YYYY-MM-DD" format based on the local timezone.
 * This avoids the UTC shifting issue caused by toISOString() in negative or positive timezones.
 * 
 * @param date The date object to format
 * @returns string "YYYY-MM-DD"
 */
export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
