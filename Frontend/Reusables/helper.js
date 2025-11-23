
/*
 * Convert To AMPM Range
*/
export const convertToAmPmRange = (timeStr) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  const ampm = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Format a date based on the user's system locale
 * @param {string|Date|null} date - Date object or date string (default: today)
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Localized date string
*/
export const getDateForDisplayLabel = (date = null, options = { day: "2-digit", month: "short", year: "numeric" }) => {
  const dateObj = date instanceof Date ? date : new Date(date || Date.now());
  return dateObj.toLocaleDateString(undefined, options);
};


export const dateAndTimeFormat = (isoDateString) => {
  const dateObject = new Date(isoDateString);

  const formattedString = dateObject.toLocaleDateString("en-US", {
    month: "long", 
    day: "2-digit", 
    year: "numeric", 
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  return formattedString === "Invalid Date" ? "" : formattedString;
};

export const capitalize = (string = "") => {
  if (!string) return "";

  return string.charAt(0).toUpperCase() + string.slice(1);
};
