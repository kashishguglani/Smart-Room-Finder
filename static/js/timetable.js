
/* =========================================================
   TIMETABLE CONFIGURATION
   Supports saved period settings from the Admin Panel.
   Existing period indexes remain zero-based.
   ========================================================= */

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

/*
 * Fallback schedule.
 * Keep the same eight periods and their original indexes
 * so existing timetable records continue to work.
 */
const DEFAULT_PERIODS = [
    ["09:05", "10:00"],
    ["10:00", "10:55"],
    ["10:55", "11:50"],
    ["11:50", "12:45"],
    ["12:45", "13:40"],
    ["13:40", "14:35"],
    ["14:35", "15:30"],
    ["15:30", "16:25"]
];

/* Convert HH:MM into minutes after midnight. */
function timeToMinutes(time) {
    if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
        return NaN;
    }

    const [hours, minutes] = time.split(":").map(Number);

    if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return NaN;
    }

    return hours * 60 + minutes;
}

/* Display 09:05 as 9:05. */
function displayTime(time) {
    const parts = String(time || "").split(":");

    if (parts.length !== 2) {
        return String(time || "");
    }

    return `${Number(parts[0])}:${parts[1]}`;
}

/* Convert a pair of times into a period object. */
function createPeriod(start, end) {
    return {
        startMinutes: timeToMinutes(start),
        endMinutes: timeToMinutes(end),
        start: displayTime(start),
        end: displayTime(end)
    };
}

/* Default period configuration. */
let PERIODS = DEFAULT_PERIODS.map(([start, end]) =>
    createPeriod(start, end)
);

/*
 * Apply timings returned by GET /api/timetable/periods.
 *
 * IMPORTANT:
 * - Existing timetable entries use zero-based period indexes.
 * - Keep exactly eight periods to match the existing timetable.
 * - Do not reorder periods or change their indexes.
 * - This function expects start_time and end_time in HH:MM format.
 */
function applyPeriodSettings(savedPeriods) {
    if (!Array.isArray(savedPeriods) || savedPeriods.length === 0) {
        console.warn("No saved period settings; using default timings.");
        return false;
    }

   if (savedPeriods.length !== DEFAULT_PERIODS.length) {
    console.error(
        `Expected ${DEFAULT_PERIODS.length} periods, received ${savedPeriods.length}.`
    );
    return false;
}

    const ordered = [...savedPeriods].sort(
        (a, b) => Number(a.period_index) - Number(b.period_index)
    );

    const converted = [];

    for (let i = 0; i < ordered.length; i++) {
        const item = ordered[i];

        /* Ensure each existing period index remains in place. */
        if (Number(item.period_index) !== i) {
            console.error(
                `Invalid period index at position ${i}. Using default timings.`
            );
            return false;
        }

        const start = String(item.start_time || "");
        const end = String(item.end_time || "");

        const startMinutes = timeToMinutes(start);
        const endMinutes = timeToMinutes(end);

        if (
            !Number.isFinite(startMinutes) ||
            !Number.isFinite(endMinutes) ||
            endMinutes <= startMinutes
        ) {
            console.error(
                `Invalid timings for period ${i + 1}. Using default timings.`
            );
            return false;
        }

        /* Periods must remain chronological and must not overlap. */
        if (
            converted.length > 0 &&
            startMinutes < converted[converted.length - 1].endMinutes
        ) {
            console.error(
                `Period ${i + 1} overlaps the previous period. Using default timings.`
            );
            return false;
        }

        converted.push({
            startMinutes,
            endMinutes,
            start: displayTime(start),
            end: displayTime(end)
        });
    }

    PERIODS = converted;

    console.log("Saved timetable period settings applied:", PERIODS);
    return true;
}

/* Get a readable period label. */
function getPeriodLabel(periodIndex) {
    const period = PERIODS[periodIndex];

    if (!period) {
        return "Unknown period";
    }

    return `${period.start} – ${period.end}`;
}

/*
 * Convert section code into readable text.
 * Examples: 3A -> 3rd Sem A, 5B -> 5th Sem B.
 */
function formatSection(section) {
    if (!section) {
        return "";
    }

    const value = String(section).trim();
    const semester = value.charAt(0);
    const division = value.charAt(1);

    if (!/^[1-8][A-Za-z]$/.test(value)) {
        return value;
    }

    const suffix =
        semester === "1" ? "st" :
        semester === "2" ? "nd" :
        semester === "3" ? "rd" : "th";

    return `${semester}${suffix} Sem ${division.toUpperCase()}`;
}

/* Find a scheduled class in the original static PIET timetable. */
function findScheduledClass(room, day, period) {
    if (
        typeof TIMETABLE === "undefined" ||
        !Array.isArray(TIMETABLE)
    ) {
        return null;
    }

    return TIMETABLE.find(entry =>
        entry.room === room &&
        Number(entry.day) === Number(day) &&
        Array.isArray(entry.periods) &&
        entry.periods.includes(Number(period))
    ) || null;
}

/*
 * Get the current period using the active timetable timings.
 * Returns a zero-based period index.
 */
function getCurrentPeriod() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < PERIODS.length; i++) {
        const period = PERIODS[i];

        if (
            minutes >= period.startMinutes &&
            minutes < period.endMinutes
        ) {
            return i;
        }
    }

    /* Before the first period: return the first period. */
    if (minutes < PERIODS[0].startMinutes) {
        return 0;
    }

    /* After the last period: return the last period. */
    return PERIODS.length - 1;
}

/* Get current day: Sunday = 0, Monday = 1, etc. */
function getCurrentDay() {
    return new Date().getDay();
}
