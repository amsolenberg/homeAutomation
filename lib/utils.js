// Get current time (hour only)
export function getCurrentHour() {
    return new Date().getHours();
}

// Determine if current time falls within a time window
export function isTimeInRange(startHour, endHour) {
    const hour = getCurrentHour();
    if (startHour <= endHour) {
        return hour >= startHour && hour <= endHour;
    } else {
        // Handles ranges that cross midnight (i.e., 22 to 05)
        return hour >= startHour || hour <= endHour;
    }
}

// Weekday/Weekend check
export function isWeekend() {
    const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
}

// Timetamp for logs
export function getTimestamp() {
    const time = new Date().toLocaleTimeString('en-GB');
    return `[${time}]`;
}
