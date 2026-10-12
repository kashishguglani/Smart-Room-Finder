
/* =========================================================
   SMART ROOM FINDER
   Main Application
   ========================================================= */

/* APPLICATION STATE */

const state = {
    day: getCurrentDay(),
    period: getCurrentPeriod(),
    roomType: "all",
    freeOnly: false,
    selectedRoom: null
};

/* SAVED UPDATES AND COLLEGE STATE */

let roomUpdates = {};
let activeCollegeCode = "PIET";
let activeTimetable = [];
let eventListenersAttached = false;
let timetableRefreshInProgress = false;

/* DOM ELEMENTS */

const daySelect = document.getElementById("day");
const periodSelect = document.getElementById("period");
const roomGrid = document.getElementById("roomGrid");
const summary = document.getElementById("summary");
const nowButton = document.getElementById("nowBtn");
const freeOnlyButton = document.getElementById("freeOnly");
const filterButtons = document.querySelectorAll(".filter-btn");

const roomDialog = document.getElementById("roomDialog");
const dialogRoomNumber = document.getElementById("dialogRoomNumber");
const dialogStatus = document.getElementById("dialogStatus");
const periodStrip = document.getElementById("periodStrip");
const roomActions = document.getElementById("roomActions");
const teacherName = document.getElementById("teacherName");
const closeDialog = document.getElementById("closeDialog");
const dialogCloseBottom = document.getElementById("dialogCloseBottom");

/* =========================================================
   HELPERS
   ========================================================= */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

async function fetchJSON(url) {
    const response = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" }
    });

    if (!response.ok) {
        throw new Error(`${url} returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
        throw new Error(`Invalid JSON response from ${url}`);
    }

    return data;
}

/* =========================================================
   COLLEGE ROOMS
   ========================================================= */

function getActiveRooms() {
    if (typeof getRoomsForCollege === "function") {
        return getRoomsForCollege(activeCollegeCode) || [];
    }

    if (activeCollegeCode === "PIET" && typeof ROOMS !== "undefined") {
        return ROOMS;
    }

    return [];
}

/* =========================================================
   LOAD PERIOD SETTINGS
   ========================================================= */

async function loadPeriodSettings() {
    const data = await fetchJSON("/api/timetable/periods");

    if (!Array.isArray(data.periods) || data.periods.length === 0) {
        console.warn(
            "The period settings endpoint returned no periods. Default timings remain active.",
            data
        );
        return false;
    }

    if (typeof applyPeriodSettings !== "function") {
        console.error("applyPeriodSettings() is not available.");
        return false;
    }

    const applied = applyPeriodSettings(data.periods);

    if (!applied) {
        console.warn(
            "Saved period settings could not be applied. Check the period indexes and timings.",
            data.periods
        );
        return false;
    }

    console.log("Period settings successfully applied:", PERIODS);
    return true;
}

/* =========================================================
   LOAD DATABASE TIMETABLE
   Database day indexes: Monday = 0 ... Saturday = 5.
   JavaScript day indexes: Sunday = 0 ... Saturday = 6.
   ========================================================= */

function normalizeTimetableEntries(entries) {
    if (!Array.isArray(entries)) {
        throw new Error("The timetable response does not contain an array.");
    }

    return entries.map(entry => {
        const databaseDay = Number(entry.day);
        const periodIndex = Number(entry.period);

        /*
         * Convert database day indexes:
         * Monday 0 -> JavaScript Monday 1
         * Saturday 5 -> JavaScript Saturday 6
         */
        const jsDay = databaseDay + 1;

        if (
            !Number.isInteger(databaseDay) ||
            databaseDay < 0 ||
            databaseDay > 5
        ) {
            console.warn("Skipping timetable entry with invalid day:", entry);
            return null;
        }

        if (
            !Number.isInteger(periodIndex) ||
            periodIndex < 0 ||
            periodIndex >= PERIODS.length
        ) {
            console.warn("Skipping timetable entry with invalid period:", entry);
            return null;
        }

        return {
            room: String(entry.room ?? "").trim(),
            day: jsDay,
            periods: [periodIndex],
            subject: entry.subject || "",
            teacher: entry.teacher || "",
            section: entry.section || "",
            batch: entry.batch || ""
        };
    }).filter(entry => entry && entry.room);
}

async function loadActiveTimetable() {
    const data = await fetchJSON("/api/timetable");

    if (!Array.isArray(data.timetable)) {
        throw new Error(
            "The timetable API did not return a timetable array."
        );
    }

    activeTimetable = normalizeTimetableEntries(data.timetable);

    console.log(
        `Loaded ${activeTimetable.length} timetable entries for ${activeCollegeCode}.`
    );

    if (activeTimetable.length === 0) {
        console.warn(
            "The database timetable is empty. PIET may still use its static timetable as a fallback."
        );
    }

    return activeTimetable;
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

async function initializeApp() {
    try {
        const me = await fetchJSON("/api/me");

        if (!me.logged_in || !me.college) {
            console.warn("No logged-in college was found.");
            return;
        }

        activeCollegeCode = String(me.college.code || "")
            .trim()
            .toUpperCase();

        window.currentCollegeCode = activeCollegeCode;

        console.log("Logged-in college:", activeCollegeCode);

        /*
         * Apply period timings before calculating the current period
         * or populating the time dropdown.
         */
        try {
            await loadPeriodSettings();
        } catch (error) {
            console.warn(
                "Could not load saved period timings. Default timings will remain active.",
                error
            );
        }

        state.day = getCurrentDay();
        state.period = getCurrentPeriod();

        await loadActiveTimetable();

        if (typeof loadRoomUpdates === "function") {
            roomUpdates = await loadRoomUpdates() || {};
        } else {
            console.warn("loadRoomUpdates() is not available.");
            roomUpdates = {};
        }

        populateDayDropdown();
        populatePeriodDropdown();
        syncControls();

        if (!eventListenersAttached) {
            attachEventListeners();
            eventListenersAttached = true;
        }

        render();

    } catch (error) {
        console.error("APP INITIALIZATION ERROR:", error);
        alert("Could not load the room data. Please refresh and try again.");
    }
}

/* =========================================================
   ACTIVE TIMETABLE LOOKUP
   ========================================================= */

function findActiveScheduledClass(room, day, period) {
    const roomNumber = String(room ?? "").trim();
    const selectedDay = Number(day);
    const selectedPeriod = Number(period);

    const databaseClass = activeTimetable.find(entry =>
        String(entry.room ?? "").trim() === roomNumber &&
        Number(entry.day) === selectedDay &&
        Array.isArray(entry.periods) &&
        entry.periods.includes(selectedPeriod)
    );

    if (databaseClass) {
        return databaseClass;
    }

    /*
     * Use the original static timetable only for PIET.
     * This preserves the existing static data as a fallback.
     */
    if (
        activeCollegeCode === "PIET" &&
        typeof findScheduledClass === "function"
    ) {
        return findScheduledClass(
            roomNumber,
            selectedDay,
            selectedPeriod
        );
    }

    return null;
}

/* =========================================================
   DROPDOWNS
   ========================================================= */

function populateDayDropdown() {
    if (!daySelect) return;

    daySelect.innerHTML = "";

    DAYS.forEach((day, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = day;
        daySelect.appendChild(option);
    });
}

function populatePeriodDropdown() {
    if (!periodSelect) return;

    periodSelect.innerHTML = "";

    PERIODS.forEach((period, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = getPeriodLabel(index);
        periodSelect.appendChild(option);
    });
}

/* =========================================================
   CONTROLS
   ========================================================= */

function syncControls() {
    if (daySelect) daySelect.value = String(state.day);
    if (periodSelect) periodSelect.value = String(state.period);
}

function attachEventListeners() {
    if (daySelect) {
        daySelect.addEventListener("change", function () {
            state.day = Number(this.value);
            render();
            refreshDialog();
        });
    }

    if (periodSelect) {
        periodSelect.addEventListener("change", function () {
            state.period = Number(this.value);
            render();
            refreshDialog();
        });
    }

    if (nowButton) {
        nowButton.addEventListener("click", function () {
            state.day = getCurrentDay();
            state.period = getCurrentPeriod();

            syncControls();
            render();
            refreshDialog();
        });
    }

    if (freeOnlyButton) {
        freeOnlyButton.addEventListener("click", function () {
            state.freeOnly = !state.freeOnly;
            this.classList.toggle("active", state.freeOnly);
            render();
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", function () {
            state.roomType = this.dataset.filter || "all";

            filterButtons.forEach(btn => {
                btn.classList.toggle("active", btn === this);
            });

            render();
        });
    });

    if (closeDialog) {
        closeDialog.addEventListener("click", closeRoomDialog);
    }

    if (dialogCloseBottom) {
        dialogCloseBottom.addEventListener("click", closeRoomDialog);
    }

    if (roomDialog) {
        roomDialog.addEventListener("click", function (event) {
            if (event.target === roomDialog) {
                closeRoomDialog();
            }
        });
    }
}

/* =========================================================
   ROOM STATUS
   ========================================================= */

function getRoomStatus(room, day, period) {
    const key = createUpdateKey(day, period, room.number);
    const update = roomUpdates[key];

    const scheduledClass = findActiveScheduledClass(
        room.number,
        day,
        period
    );

    if (update && update.type === "occupied") {
        return {
            type: "teacher",
            label: "Teacher Occupied",
            details: `${update.who || "Teacher"} is using this room`
        };
    }

    if (
        scheduledClass &&
        update &&
        update.type === "cancelled"
    ) {
        return {
            type: "free",
            label: "Free",
            details: `${scheduledClass.subject || "Class"} cancelled`
        };
    }

    if (scheduledClass) {
        return {
            type: "busy",
            label: "In Class",
            details: formatClassDetails(scheduledClass)
        };
    }

    return {
        type: "free",
        label: "Free",
        details: "No class scheduled"
    };
}

/* =========================================================
   FORMAT CLASS DETAILS
   ========================================================= */

function formatClassDetails(classInfo) {
    if (!classInfo) return "";

    const parts = [];

    if (classInfo.subject) parts.push(classInfo.subject);

    if (classInfo.section) {
        parts.push(
            typeof formatSection === "function"
                ? formatSection(classInfo.section)
                : classInfo.section
        );
    }

    if (classInfo.batch) parts.push(classInfo.batch);
    if (classInfo.teacher) parts.push(classInfo.teacher);

    return parts.join(" · ");
}

/* =========================================================
   RENDER ROOMS
   ========================================================= */

function render() {
    if (!roomGrid || !summary) return;

    roomGrid.innerHTML = "";

    let freeCount = 0;
    let busyCount = 0;
    let teacherCount = 0;

    const rooms = getActiveRooms();

    rooms.forEach(room => {
        const status = getRoomStatus(room, state.day, state.period);

        if (status.type === "free") {
            freeCount++;
        } else if (status.type === "busy") {
            busyCount++;
        } else {
            teacherCount++;
        }

        if (
            state.roomType !== "all" &&
            room.type !== state.roomType
        ) {
            return;
        }

        if (state.freeOnly && status.type !== "free") {
            return;
        }

        createRoomCard(room, status);
    });

    updateSummary(freeCount, busyCount, teacherCount);

    if (roomGrid.children.length === 0) {
        const message = rooms.length === 0
            ? "No rooms are configured for this college yet."
            : 'Try changing the selected time or turning off "Free Only".';

        roomGrid.innerHTML = `
            <div class="empty-state">
                <h3>No rooms found</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

/* =========================================================
   CREATE ROOM CARD
   ========================================================= */

function createRoomCard(room, status) {
    const card = document.createElement("button");

    card.type = "button";
    card.className = `room-card ${status.type}`;

    card.innerHTML = `
        <div class="room-top">
            <div>
                <div class="room-number">${escapeHTML(room.number)}</div>
                <div class="room-type">${escapeHTML(room.type)}</div>
            </div>
        </div>

        <div class="status-badge ${status.type}">
            ${getStatusSymbol(status.type)}
            ${escapeHTML(status.label)}
        </div>

        <div class="room-details">
            ${escapeHTML(status.details)}
        </div>

        <div class="view-details">View Details →</div>
    `;

    card.addEventListener("click", function () {
        openRoomDialog(room);
    });

    roomGrid.appendChild(card);
}

/* =========================================================
   STATUS SYMBOL
   ========================================================= */

function getStatusSymbol(type) {
    if (type === "free") return "●";
    if (type === "busy") return "●";
    return "●";
}

/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary(freeCount, busyCount, teacherCount) {
    summary.innerHTML = `
        <span class="summary-item summary-free">
            ${freeCount} Free
        </span>
        <span class="summary-item summary-busy">
            ${busyCount} In Class
        </span>
        <span class="summary-item summary-teacher">
            ${teacherCount} Teacher Occupied
        </span>
    `;
}

/* =========================================================
   ROOM DIALOG
   ========================================================= */

function openRoomDialog(room) {
    if (!roomDialog) return;

    state.selectedRoom = room;

    if (teacherName) teacherName.value = "";
    if (dialogRoomNumber) {
        dialogRoomNumber.textContent = room.number;
    }

    if (typeof roomDialog.showModal === "function") {
        roomDialog.showModal();
    } else {
        roomDialog.setAttribute("open", "");
    }

    refreshDialog();
}

function closeRoomDialog() {
    if (roomDialog && roomDialog.open) {
        roomDialog.close();
    }

    state.selectedRoom = null;
}

/* =========================================================
   REFRESH DIALOG
   ========================================================= */

function refreshDialog() {
    if (
        !state.selectedRoom ||
        !roomDialog ||
        !roomDialog.open
    ) {
        return;
    }

    const room = state.selectedRoom;
    const status = getRoomStatus(room, state.day, state.period);

    if (dialogStatus) {
        dialogStatus.innerHTML = `
            <strong>${escapeHTML(status.label)}</strong>
            <br>
            ${escapeHTML(DAYS[state.day] || "")} ·
            ${escapeHTML(getPeriodLabel(state.period))}
            <br>
            ${escapeHTML(status.details)}
        `;
    }

    renderPeriodStrip(room);
    renderRoomActions(room);
}

/* =========================================================
   PERIOD STRIP
   ========================================================= */

function renderPeriodStrip(room) {
    if (!periodStrip) return;

    periodStrip.innerHTML = "";

    PERIODS.forEach((period, index) => {
        const status = getRoomStatus(room, state.day, index);
        const slot = document.createElement("div");

        slot.className = `period-slot ${status.type}`;

        if (index === state.period) {
            slot.classList.add("current");
        }

        slot.textContent = period.start;
        slot.title = `${getPeriodLabel(index)} — ${status.label}`;

        periodStrip.appendChild(slot);
    });
}

/* =========================================================
   ROOM ACTIONS
   ========================================================= */

function renderRoomActions(room) {
    if (!roomActions) return;

    const user = typeof window.getLoggedInUser === "function"
        ? window.getLoggedInUser()
        : (
            typeof loggedInUser !== "undefined"
                ? loggedInUser
                : null
        );

    if (user && user.role === "student") {
        roomActions.innerHTML = `
            <p class="student-note">
                Login as a teacher to update room availability.
            </p>
        `;
        return;
    }

    roomActions.innerHTML = "";

    const key = createUpdateKey(
        state.day,
        state.period,
        room.number
    );

    const update = roomUpdates[key];

    const scheduledClass = findActiveScheduledClass(
        room.number,
        state.day,
        state.period
    );

    if (update) {
        const button = document.createElement("button");

        button.className = "action-btn undo";
        button.type = "button";
        button.textContent = "Undo Update";

        button.addEventListener("click", async function () {
            const success = await deleteRoomUpdate(
                room.number,
                state.day,
                state.period
            );

            if (success) {
                delete roomUpdates[key];
                render();
                refreshDialog();
            }
        });

        roomActions.appendChild(button);
        return;
    }

    if (scheduledClass) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "action-btn cancel";
        button.textContent = "Cancel This Class";

        button.addEventListener("click", async function () {
            const name = teacherName ? teacherName.value.trim() : "";

            const newUpdate = {
                type: "cancelled",
                who: name || "Teacher",
                timestamp: new Date().toISOString()
            };

            const success = await saveRoomUpdate(
                room.number,
                state.day,
                state.period,
                newUpdate
            );

            if (success) {
                roomUpdates[key] = newUpdate;
                render();
                refreshDialog();
            }
        });

        roomActions.appendChild(button);
        return;
    }

    const button = document.createElement("button");

    button.type = "button";
    button.className = "action-btn";
    button.textContent = "Mark Occupied – I'm Using This Room";

    button.addEventListener("click", async function () {
        const name = teacherName ? teacherName.value.trim() : "";

        const newUpdate = {
            type: "occupied",
            who: name || "Teacher",
            timestamp: new Date().toISOString()
        };

        const success = await saveRoomUpdate(
            room.number,
            state.day,
            state.period,
            newUpdate
        );

        if (success) {
            roomUpdates[key] = newUpdate;
            render();
            refreshDialog();
        }
    });

    roomActions.appendChild(button);
}

/* =========================================================
   UPDATE KEY
   ========================================================= */

function createUpdateKey(day, period, room) {
    return `${day}|${period}|${room}`;
}

/* =========================================================
   REFRESH AFTER ADMIN TIMETABLE CHANGES
   ========================================================= */

window.addEventListener("timetableUpdated", async function (event) {
    const updatedCollege = String(
        event.detail?.collegeCode || ""
    ).trim().toUpperCase();

    if (
        updatedCollege &&
        updatedCollege !== activeCollegeCode
    ) {
        return;
    }

    if (timetableRefreshInProgress) return;

    timetableRefreshInProgress = true;

    try {
        try {
            await loadPeriodSettings();
        } catch (error) {
            console.error("Could not refresh period settings:", error);
        }

        await loadActiveTimetable();

        state.day = getCurrentDay();
        state.period = getCurrentPeriod();

        populatePeriodDropdown();
        syncControls();

        render();
        refreshDialog();

        console.log(
            "Timetable refreshed for college:",
            activeCollegeCode
        );
    } catch (error) {
        console.error("TIMETABLE REFRESH ERROR:", error);
    } finally {
        timetableRefreshInProgress = false;
    }
});

/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

initializeApp();
