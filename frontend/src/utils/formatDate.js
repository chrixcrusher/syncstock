import { format, getISOWeek, getMonth, getYear } from 'date-fns';

// Helper function to get the week number formatted as 'W# YYYY'
const getWeekNumber = (date) => {
  const weekNumber = getISOWeek(date); // Get the ISO week number
  const year = getYear(date);        // Get the year
  return `W${weekNumber} ${year}`;
};

// Helper function to get the month formatted as 'MMM YYYY'
const getMonthName = (date) => {
  const monthName = format(date, 'MMM');  // Get abbreviated month name
  const year = getYear(date);            // Get the year
  return `${monthName} ${year}`;
};

// Helper function to get the day formatted as 'MMM D, YYYY'
const getDayFormatted = (date) => {
  return format(date, 'MMM d, yyyy');  // Format date as 'Jan 21, 2024'
};

// Main function to format the date based on the group_by type
const formatDate = (dateString, groupBy) => {
  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString);
    return dateString; // Return the original string if the date is invalid
  }

  let formattedDate;

  switch (groupBy) {
    case 'daily':
      formattedDate = getDayFormatted(date);
      break;
    case 'weekly':
      formattedDate = getWeekNumber(date);
      break;
    case 'monthly':
      formattedDate = getMonthName(date);
      break;
    case 'yearly':
      formattedDate = getYear(date).toString();
      break;
    default:
      formattedDate = dateString;
  }

  return formattedDate;
};

// Exporting as default
export default formatDate;
