
/**
 * Formats a date string into a readable format: "Month Day · Year"
 * @param dateString ISO date string or any valid date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid

    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day} · ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original if error
  }
}
