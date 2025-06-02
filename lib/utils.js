// Get current time (hour only)
function getCurrentHour() {
    return new Date().getHours();
}

// Determine if current time falls within a time window
function isTimeInRange(startHour, endHour) {
    const hour = getCurrentHour();
    if (startHour <= endHour) {
        return hour >= startHour && hour <= endHour;
    } else {
        // Handles ranges that cross midnight (i.e., 22 to 05)
        return hour >= startHour || hour <= endHour;
    }
}

// Weekday/Weekend check
function isWeekend() {
    const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
}

// Delay/wait helper
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Safe access to nested object properties
function getNested(obj, path, fallback = undefined) {
    return path.split('.').reduce((res, key) => (res && key in res ? res[key] : fallback), obj);
}

module.exports = {
    getCurrentHour,
    isTimeInRange,
    isWeekend,
    wait,
    getNested
};
