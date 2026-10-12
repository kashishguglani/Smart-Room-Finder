/* =========================================================
   SMART ROOM FINDER — ADMIN TIMETABLE MANAGEMENT
   MULTI-COLLEGE SUPPORT + CUSTOM PERIOD SETTINGS
   ========================================================= */

(() => {
    "use strict";

    // =====================================================
    // TIMETABLE ELEMENTS
    // =====================================================

    const daySelect = document.getElementById("adminDay");
    const periodSelect = document.getElementById("adminPeriod");
    const roomSelect = document.getElementById("adminRoom");
    const sectionInput = document.getElementById("adminSection");
    const subjectInput = document.getElementById("adminSubject");
    const teacherInput = document.getElementById("adminTeacher");
    const saveButton = document.getElementById("saveTimetableBtn");
    const refreshButton = document.getElementById("refreshTimetableBtn");
    const table = document.getElementById("adminTimetableTable");
    const message = document.getElementById("timetableAdminMessage");
    const adminPanelButton = document.getElementById("adminPanelBtn");

    // =====================================================
    // CONSTANTS
    // =====================================================

    const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const PERIOD_LABELS = [
        "9:05 – 10:00",
        "10:00 – 10:55",
        "10:55 – 11:50",
        "11:50 – 12:45",
        "12:45 – 1:40",
        "1:40 – 2:35",
        "2:35 – 3:30",
        "3:30 – 4:25"
    ];

    let adminCollegeCode = "";
    let initializationPromise = null;

    // =====================================================
    // COMMON HELPERS
    // =====================================================

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character]));
    }

    function setMessage(text, isError = false) {
        if (!message) return;

        message.textContent = text;
        message.style.color = isError ? "#dc2626" : "#2563eb";
    }

    function isAdmin() {
        return typeof loggedInUser !== "undefined" &&
            loggedInUser &&
            loggedInUser.role === "admin";
    }

    function notifyTimetableUpdated() {
        window.dispatchEvent(
            new CustomEvent("timetableUpdated", {
                detail: {
                    collegeCode: adminCollegeCode
                }
            })
        );
    }

    // =====================================================
    // COLLEGE CONTEXT
    // =====================================================

    async function loadCollegeContext() {
        
    // =====================================================
    // COLLEGE DISPLAY SETTINGS
    // =====================================================

    const departmentInput = document.getElementById("collegeDepartment");
    const semesterInput = document.getElementById("collegeSemester");
    const academicYearInput = document.getElementById("collegeAcademicYear");
    const saveCollegeSettingsBtn = document.getElementById("saveCollegeSettingsBtn");
    const collegeSettingsMessage = document.getElementById("collegeSettingsMessage");

    let currentCollegeSettings = null;

    function setCollegeSettingsMessage(text, isError = false) {
        if (!collegeSettingsMessage) return;

        collegeSettingsMessage.textContent = text;
        collegeSettingsMessage.style.color = isError ? "#dc2626" : "#15803d";
    }

    function updateCollegeDisplay(settings) {
        const department = settings?.department || "";
        const semester = settings?.semester || "";
        const academicYear = settings?.academic_year || "";

        const departmentLabel = document.getElementById("loginDepartmentLabel");
        const footerLabel = document.getElementById("timetableFooterLabel");

        if (departmentLabel) {
            departmentLabel.textContent = department || "College-specific department";
        }

        if (footerLabel) {
            const details = [department, semester, academicYear].filter(Boolean);
            footerLabel.textContent = details.length
                ? "Timetable: " + details.join(" · ")
                : "Timetable details not configured";
        }
    }

    async function loadCollegeDisplaySettings() {
        try {
            const response = await fetch("/api/college-settings", {
                cache: "no-store"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not load college settings.");
            }

            currentCollegeSettings = data.settings;
            updateCollegeDisplay(currentCollegeSettings);

            if (isAdmin()) {
                if (departmentInput) {
                    departmentInput.value = currentCollegeSettings.department || "";
                }
                if (semesterInput) {
                    semesterInput.value = currentCollegeSettings.semester || "";
                }
                if (academicYearInput) {
                    academicYearInput.value = currentCollegeSettings.academic_year || "";
                }
            }
        } catch (error) {
            console.error("LOAD COLLEGE SETTINGS ERROR:", error);
        }
    }

    async function saveCollegeDisplaySettings() {
        if (!isAdmin()) {
            setCollegeSettingsMessage("Admin access is required.", true);
            return;
        }

        const payload = {
            department: departmentInput?.value.trim() || "",
            semester: semesterInput?.value.trim() || "",
            academic_year: academicYearInput?.value.trim() || ""
        };

        if (!payload.department || !payload.semester || !payload.academic_year) {
            setCollegeSettingsMessage(
                "Please fill in department, semester and academic year.",
                true
            );
            return;
        }

        saveCollegeSettingsBtn.disabled = true;
        saveCollegeSettingsBtn.textContent = "Saving...";

        try {
            const response = await fetch("/api/admin/college-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not save college settings.");
            }

            currentCollegeSettings = data.settings;
            updateCollegeDisplay(currentCollegeSettings);

            setCollegeSettingsMessage("College settings saved successfully.");
        } catch (error) {
            console.error("SAVE COLLEGE SETTINGS ERROR:", error);
            setCollegeSettingsMessage(
                error.message || "Could not connect to server.",
                true
            );
        } finally {
            saveCollegeSettingsBtn.disabled = false;
            saveCollegeSettingsBtn.textContent = "Save College Settings";
        }
    }

    if (saveCollegeSettingsBtn) {
        saveCollegeSettingsBtn.addEventListener("click", saveCollegeDisplaySettings);
    }

    // Make settings available to the main app after login.
    window.loadCollegeDisplaySettings = loadCollegeDisplaySettings;

        const response = await fetch("/api/me", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                "Could not identify the logged-in college."
            );
        }

        const data = await response.json();

        if (!data.logged_in || !data.college) {
            throw new Error(
                "Please log in to your college account."
            );
        }

        adminCollegeCode = String(data.college.code || "")
            .trim()
            .toUpperCase();

        window.currentCollegeCode = adminCollegeCode;

        console.log("Admin college:", adminCollegeCode);
    }

    // =====================================================
    // LOAD ROOMS
    // =====================================================

    function loadRoomOptions() {
        if (!roomSelect) return;

        const previousValue = roomSelect.value;
        roomSelect.innerHTML = "";

        let rooms = [];

        if (typeof getRoomsForCollege === "function") {
            rooms = getRoomsForCollege(adminCollegeCode);
        } else if (
            adminCollegeCode === "PIET" &&
            typeof ROOMS !== "undefined"
        ) {
            rooms = ROOMS;
        }

        if (!Array.isArray(rooms) || rooms.length === 0) {
            roomSelect.add(
                new Option("No rooms configured for this college", "")
            );

            console.warn(
                "No rooms configured for:",
                adminCollegeCode
            );

            return;
        }

        rooms.forEach(room => {
            const value = typeof room === "string"
                ? room
                : (room.number || room.name || room.id || "");

            if (value) {
                roomSelect.add(new Option(value, value));
            }
        });

        if (
            [...roomSelect.options].some(
                option => option.value === previousValue
            )
        ) {
            roomSelect.value = previousValue;
        }
    }

    // =====================================================
    // LOAD TIMETABLE
    // =====================================================

    async function loadTimetable() {
        if (!table) return;

        if (!isAdmin()) {
            table.innerHTML =
                "<p>Admin access is required.</p>";
            return;
        }

        table.innerHTML = "<p>Loading timetable entries...</p>";

        try {
            const response = await fetch("/api/admin/timetable", {
                method: "GET",
                cache: "no-store"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Could not load timetable."
                );
            }

            if (
                !Array.isArray(data.timetable) ||
                data.timetable.length === 0
            ) {
                table.innerHTML =
                    "<p>No database timetable entries yet for this college.</p>";
                return;
            }

            const header = `
                <div class="user-row user-row-header timetable-row">
                    <span>Day / Period</span>
                    <span>Room</span>
                    <span>Section</span>
                    <span>Subject / Teacher</span>
                    <span>Action</span>
                </div>
            `;

            const rows = data.timetable.map(entry => `
                <div class="user-row timetable-row">
                    <span>
                        <strong>
                            ${escapeHtml(
                                DAYS[Number(entry.day)] ?? "-"
                            )}
                        </strong>
                        <br>
                        <small>
                            ${escapeHtml(
                                PERIOD_LABELS[Number(entry.period)] ?? "-"
                            )}
                        </small>
                    </span>

                    <span class="user-username">
                        ${escapeHtml(entry.room)}
                    </span>

                    <span>
                        ${escapeHtml(entry.section)}
                    </span>

                    <span>
                        <strong>${escapeHtml(entry.subject)}</strong>
                        <br>
                        <small>${escapeHtml(entry.teacher)}</small>
                    </span>

                    <span>
                        <button
                            type="button"
                            class="delete-timetable-btn"
                            data-entry-id="${Number(entry.id)}"
                        >
                            Delete
                        </button>
                    </span>
                </div>
            `).join("");

            table.innerHTML = header + rows;

            table.querySelectorAll(".delete-timetable-btn")
                .forEach(button => {
                    button.addEventListener("click", () => {
                        deleteTimetableEntry(button.dataset.entryId);
                    });
                });

        } catch (error) {
            console.error("LOAD TIMETABLE ERROR:", error);

            table.innerHTML = `
                <p>${escapeHtml(
                    error.message || "Could not connect to server."
                )}</p>
            `;
        }
    }

    // =====================================================
    // INITIALIZE ADMIN PANEL
    // =====================================================

    async function initializeAdminPanel() {
        if (initializationPromise) {
            return initializationPromise;
        }

        initializationPromise = (async () => {
            try {
                await loadCollegeContext();
                loadRoomOptions();
                await loadTimetable();
            } catch (error) {
                console.error(
                    "ADMIN INITIALIZATION ERROR:",
                    error
                );

                setMessage(error.message, true);
            }
        })();

        try {
            await initializationPromise;
        } finally {
            initializationPromise = null;
        }
    }

    // =====================================================
    // SAVE TIMETABLE ENTRY
    // =====================================================

    async function saveTimetable() {
        if (!isAdmin()) {
            setMessage("Admin access is required.", true);
            return;
        }

        const payload = {
            day: Number(daySelect.value),
            period: Number(periodSelect.value),
            room: roomSelect.value.trim(),
            section: sectionInput.value.trim(),
            subject: subjectInput.value.trim(),
            teacher: teacherInput.value.trim()
        };

        if (
            !payload.room ||
            !payload.section ||
            !payload.subject ||
            !payload.teacher
        ) {
            setMessage(
                "Please fill in room, section, subject and teacher.",
                true
            );
            return;
        }

        const allowedRooms =
            typeof getRoomsForCollege === "function"
                ? getRoomsForCollege(adminCollegeCode)
                : (
                    adminCollegeCode === "PIET" &&
                    typeof ROOMS !== "undefined"
                        ? ROOMS
                        : []
                );

        const roomExists = allowedRooms.some(room => {
            const number = typeof room === "string"
                ? room
                : (room.number || room.name || room.id || "");

            return String(number).trim() === payload.room;
        });

        if (!roomExists) {
            setMessage(
                "Select a room configured for your college.",
                true
            );
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {
            const response = await fetch("/api/admin/timetable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Could not save timetable entry."
                );
            }

            setMessage("Timetable entry saved successfully.");

            sectionInput.value = "";
            subjectInput.value = "";
            teacherInput.value = "";

            await loadTimetable();
            notifyTimetableUpdated();

        } catch (error) {
            console.error("SAVE TIMETABLE ERROR:", error);

            setMessage(
                error.message || "Could not connect to server.",
                true
            );
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Save Timetable";
        }
    }

    // =====================================================
    // DELETE TIMETABLE ENTRY
    // =====================================================

    async function deleteTimetableEntry(entryId) {
        if (!isAdmin()) {
            alert("Admin access is required.");
            return;
        }

        if (!confirm("Delete this timetable entry?")) {
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/timetable/${encodeURIComponent(entryId)}`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Could not delete timetable entry."
                );
            }

            setMessage("Timetable entry deleted.");

            await loadTimetable();
            notifyTimetableUpdated();

        } catch (error) {
            console.error("DELETE TIMETABLE ERROR:", error);

            alert(
                error.message || "Could not connect to server."
            );
        }
    }

    // =====================================================
    // CUSTOMIZABLE TIMETABLE PERIOD SETTINGS
    // =====================================================

    const periodSettingsSection =
        document.getElementById("periodSettingsSection");

    const periodSettingsRows =
        document.getElementById("periodSettingsRows");

    const loadPeriodSettingsBtn =
        document.getElementById("loadPeriodSettingsBtn");

    const addPeriodSettingBtn =
        document.getElementById("addPeriodSettingBtn");

    const savePeriodSettingsBtn =
        document.getElementById("savePeriodSettingsBtn");

    const periodSettingsMessage =
        document.getElementById("periodSettingsMessage");

    function setPeriodSettingsMessage(text, isError = false) {
        if (!periodSettingsMessage) return;

        periodSettingsMessage.textContent = text;
        periodSettingsMessage.style.color = isError
            ? "#dc2626"
            : "#15803d";
    }

    // =====================================================
    // CREATE A PERIOD ROW
    // =====================================================

    function createPeriodRow(
        startTime = "09:05",
        endTime = "10:00"
    ) {
        if (!periodSettingsRows) return;

        const row = document.createElement("div");
        row.className = "period-setting-row";

        row.innerHTML = `
            <strong class="period-setting-number"></strong>

            <div class="admin-field">
                <label>Start Time</label>
                <input
                    type="time"
                    class="period-start-time"
                    value="${escapeHtml(startTime)}"
                    required
                >
            </div>

            <div class="admin-field">
                <label>End Time</label>
                <input
                    type="time"
                    class="period-end-time"
                    value="${escapeHtml(endTime)}"
                    required
                >
            </div>

            <button
                type="button"
                class="delete-period-setting-btn"
            >
                Remove
            </button>
        `;

        row.querySelector(".delete-period-setting-btn")
            .addEventListener("click", () => {
                row.remove();
                renumberPeriodRows();
            });

        periodSettingsRows.appendChild(row);
        renumberPeriodRows();
    }

    // =====================================================
    // RENUMBER PERIOD ROWS
    // =====================================================

    function renumberPeriodRows() {
        if (!periodSettingsRows) return;

        periodSettingsRows
            .querySelectorAll(".period-setting-row")
            .forEach((row, index) => {
                const number = row.querySelector(
                    ".period-setting-number"
                );

                if (number) {
                    number.textContent = `Period ${index + 1}`;
                }
            });
    }

    // =====================================================
    // DISPLAY PERIOD SETTINGS
    // =====================================================

    function displayPeriodSettings(periods) {
        if (!periodSettingsRows) return;

        periodSettingsRows.innerHTML = "";

        periods.forEach(period => {
            createPeriodRow(
                period.start_time,
                period.end_time
            );
        });

        renumberPeriodRows();
    }

    // =====================================================
    // LOAD PERIOD SETTINGS
    // =====================================================

    async function loadPeriodSettings() {
        if (
            !periodSettingsSection ||
            !periodSettingsRows ||
            !loadPeriodSettingsBtn
        ) {
            return;
        }

        if (!isAdmin()) {
            setPeriodSettingsMessage(
                "Admin access is required.",
                true
            );
            return;
        }

        const section = periodSettingsSection.value.trim();

        setPeriodSettingsMessage("Loading period settings...");
        loadPeriodSettingsBtn.disabled = true;

        try {
            const url = new URL(
                "/api/timetable/periods",
                window.location.origin
            );

            if (section) {
                url.searchParams.set("section", section);
            }

            const response = await fetch(url, {
                method: "GET",
                cache: "no-store"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Could not load period settings."
                );
            }

            if (!Array.isArray(data.periods)) {
                throw new Error(
                    "The server returned invalid period settings."
                );
            }

            displayPeriodSettings(data.periods);

            setPeriodSettingsMessage(
                section
                    ? `Loaded settings for section ${section}.`
                    : "Loaded college-wide period settings."
            );

        } catch (error) {
            console.error(
                "LOAD PERIOD SETTINGS ERROR:",
                error
            );

            setPeriodSettingsMessage(
                error.message || "Could not connect to server.",
                true
            );
        } finally {
            loadPeriodSettingsBtn.disabled = false;
        }
    }

    // =====================================================
    // GET PERIOD SETTINGS FORM DATA
    // =====================================================

    function getPeriodSettingsPayload() {
        if (!periodSettingsRows) return [];

        const rows = [
            ...periodSettingsRows.querySelectorAll(
                ".period-setting-row"
            )
        ];

        return rows.map(row => ({
            start_time: row.querySelector(
                ".period-start-time"
            ).value,

            end_time: row.querySelector(
                ".period-end-time"
            ).value
        }));
    }

    // =====================================================
    // SAVE PERIOD SETTINGS
    // =====================================================

    async function savePeriodSettings() {
        if (
            !periodSettingsSection ||
            !periodSettingsRows ||
            !savePeriodSettingsBtn
        ) {
            return;
        }

        if (!isAdmin()) {
            setPeriodSettingsMessage(
                "Admin access is required.",
                true
            );
            return;
        }

        const periods = getPeriodSettingsPayload();
        const section = periodSettingsSection.value.trim();

        if (periods.length === 0) {
            setPeriodSettingsMessage(
                "Add at least one period before saving.",
                true
            );
            return;
        }

       
        // Validate period times and overlaps using minutes.
        function toMinutes(value) {
            if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
                return NaN;
            }

            const [hours, minutes] = value.split(":").map(Number);
            return hours * 60 + minutes;
        }

        for (let i = 0; i < periods.length; i++) {
            const period = periods[i];

            if (!period.start_time || !period.end_time) {
                setPeriodSettingsMessage(
                    `Enter both times for Period ${i + 1}.`,
                    true
                );
                return;
            }

            const startMinutes = toMinutes(period.start_time);
            const endMinutes = toMinutes(period.end_time);

            if (
                !Number.isFinite(startMinutes) ||
                !Number.isFinite(endMinutes)
            ) {
                setPeriodSettingsMessage(
                    `Invalid time format in Period ${i + 1}.`,
                    true
                );
                return;
            }

            if (endMinutes <= startMinutes) {
                setPeriodSettingsMessage(
                    `Period ${i + 1} must end after it starts.`,
                    true
                );
                return;
            }

            if (i > 0) {
                const previousEnd = toMinutes(
                    periods[i - 1].end_time
                );

                if (startMinutes < previousEnd) {
                    const suggestedTime =
                        startMinutes < 720
                            ? " If you mean an afternoon time, use 24-hour format, e.g. 13:35 for 1:35 PM."
                            : "";

                    setPeriodSettingsMessage(
                        `Period ${i + 1} starts before the previous period ends.${suggestedTime}`,
                        true
                    );
                    return;
                }
            }
        }

        savePeriodSettingsBtn.disabled = true;
        savePeriodSettingsBtn.textContent = "Saving...";

        try {
            const response = await fetch(
                "/api/admin/timetable/periods",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        section: section,
                        periods: periods
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Could not save period settings."
                );
            }

            if (Array.isArray(data.periods)) {
                displayPeriodSettings(data.periods);
            }

            setPeriodSettingsMessage(
                section
                    ? `Period settings saved for section ${section}.`
                    : "College-wide period settings saved successfully."
            );

            notifyTimetableUpdated();

        } catch (error) {
            console.error(
                "SAVE PERIOD SETTINGS ERROR:",
                error
            );

            setPeriodSettingsMessage(
                error.message || "Could not connect to server.",
                true
            );
        } finally {
            savePeriodSettingsBtn.disabled = false;
            savePeriodSettingsBtn.textContent =
                "Save Period Settings";
        }
    }

    // =====================================================
    // PERIOD SETTINGS EVENT LISTENERS
    // =====================================================

    if (
        periodSettingsSection &&
        periodSettingsRows &&
        loadPeriodSettingsBtn &&
        addPeriodSettingBtn &&
        savePeriodSettingsBtn
    ) {
        loadPeriodSettingsBtn.addEventListener(
            "click",
            loadPeriodSettings
        );

        addPeriodSettingBtn.addEventListener("click", () => {
            const rows = [
                ...periodSettingsRows.querySelectorAll(
                    ".period-setting-row"
                )
            ];

            const lastEnd = rows.length
                ? rows[rows.length - 1]
                    .querySelector(".period-end-time").value
                : "09:05";

            if (!lastEnd) {
                setPeriodSettingsMessage(
                    "Set the previous period's end time first.",
                    true
                );
                return;
            }

            const [hours, minutes] = lastEnd
                .split(":")
                .map(Number);

            const totalMinutes = hours * 60 + minutes;
            const nextTotal = totalMinutes + 55;

            if (nextTotal >= 1440) {
                setPeriodSettingsMessage(
                    "Cannot add a period beyond midnight.",
                    true
                );
                return;
            }

            const nextStart =
                `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:` +
                `${String(totalMinutes % 60).padStart(2, "0")}`;

            const nextEnd =
                `${String(Math.floor(nextTotal / 60)).padStart(2, "0")}:` +
                `${String(nextTotal % 60).padStart(2, "0")}`;

            createPeriodRow(nextStart, nextEnd);
            setPeriodSettingsMessage("");
        });

        savePeriodSettingsBtn.addEventListener(
            "click",
            savePeriodSettings
        );

        periodSettingsSection.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    loadPeriodSettings();
                }
            }
        );
    }

    // =====================================================
    // TIMETABLE EVENT LISTENERS
    // =====================================================

    if (saveButton) {
        saveButton.addEventListener("click", async () => {
            if (!adminCollegeCode) {
                await initializeAdminPanel();
            }

            await saveTimetable();
        });
    }

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            initializeAdminPanel
        );
    }

    if (adminPanelButton) {
        adminPanelButton.addEventListener(
            "click",
            initializeAdminPanel
        );
    }

    // =====================================================
    // STARTUP
    // =====================================================

    if (
        daySelect &&
        periodSelect &&
        roomSelect &&
        saveButton &&
        table
    ) {
        initializeAdminPanel();
    } else {
        console.warn(
            "Some admin timetable elements are missing in index.html."
        );
    }


    // =====================================================
    // USER MANAGEMENT — CREATE, DISPLAY AND DELETE USERS
    // =====================================================

    const newUsernameInput = document.getElementById("newUsername");
    const newPasswordInput = document.getElementById("newPassword");
    const newRoleSelect = document.getElementById("newRole");
    const createUserButton = document.getElementById("createUserBtn");
    const refreshUsersButton = document.getElementById("refreshUsersBtn");
    const usersTable = document.getElementById("usersTable");
    const adminUserMessage = document.getElementById("adminMessage");

    function setUserMessage(text, isError = false) {
        if (!adminUserMessage) return;

        adminUserMessage.textContent = text;
        adminUserMessage.style.color = isError ? "#dc2626" : "#15803d";
    }

    async function loadAdminUsers() {
        if (!usersTable) return;

        if (!isAdmin()) {
            usersTable.textContent = "Admin access is required.";
            return;
        }

        usersTable.textContent = "Loading users...";

        try {
            const response = await fetch("/api/admin/users", {
                method: "GET",
                cache: "no-store"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not load users.");
            }

            if (!Array.isArray(data.users) || data.users.length === 0) {
                usersTable.textContent = "No users found.";
                return;
            }

            const header = `
                <div class="user-row user-row-header">
                    <span>Username</span>
                    <span>Role</span>
                    <span>Action</span>
                </div>
            `;

            const rows = data.users.map(user => `
                <div class="user-row">
                    <span class="user-username">
                        ${escapeHtml(user.username)}
                    </span>
                    <span>${escapeHtml(user.role)}</span>
                    <span>
                        <button
                            type="button"
                            class="delete-user-btn"
                            data-user-id="${Number(user.id)}"
                            data-username="${escapeHtml(user.username)}"
                        >
                            Delete
                        </button>
                    </span>
                </div>
            `).join("");

            usersTable.innerHTML = header + rows;

            usersTable.querySelectorAll(".delete-user-btn")
                .forEach(button => {
                    button.addEventListener("click", async () => {
                        const userId = button.dataset.userId;
                        const username = button.dataset.username;

                        if (!confirm(`Delete user "${username}"?`)) {
                            return;
                        }

                        button.disabled = true;

                        try {
                            const deleteResponse = await fetch(
                                `/api/admin/users/${encodeURIComponent(userId)}`,
                                { method: "DELETE" }
                            );

                            const deleteData = await deleteResponse.json();

                            if (!deleteResponse.ok || !deleteData.success) {
                                throw new Error(
                                    deleteData.message || "Could not delete user."
                                );
                            }

                            setUserMessage("User deleted successfully.");
                            await loadAdminUsers();

                        } catch (error) {
                            setUserMessage(
                                error.message || "Could not connect to server.",
                                true
                            );
                            button.disabled = false;
                        }
                    });
                });

        } catch (error) {
            console.error("LOAD USERS ERROR:", error);
            usersTable.textContent =
                error.message || "Could not connect to server.";
        }
    }

    async function createAdminUser() {
        if (!isAdmin()) {
            setUserMessage("Admin access is required.", true);
            return;
        }

        const username = newUsernameInput?.value.trim() || "";
        const password = newPasswordInput?.value || "";
        const role = newRoleSelect?.value || "student";

        if (!username || !password) {
            setUserMessage("Please enter a username and password.", true);
            return;
        }

        createUserButton.disabled = true;
        createUserButton.textContent = "Creating...";

        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    role: role
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not create user.");
            }

            newUsernameInput.value = "";
            newPasswordInput.value = "";
            newRoleSelect.value = "student";

            setUserMessage("User created successfully!");
            await loadAdminUsers();

        } catch (error) {
            console.error("CREATE USER ERROR:", error);
            setUserMessage(
                error.message || "Could not connect to server.",
                true
            );
        } finally {
            createUserButton.disabled = false;
            createUserButton.textContent = "Create User";
        }
    }

    if (createUserButton) {
        createUserButton.addEventListener("click", createAdminUser);
    }

    if (refreshUsersButton) {
        refreshUsersButton.addEventListener("click", loadAdminUsers);
    }

    if (adminPanelButton) {
        adminPanelButton.addEventListener("click", () => {
            if (isAdmin()) {
                loadAdminUsers();
            }
        });
    }

    // Allow the main application to refresh the user list after login.
    window.loadAdminUsers = loadAdminUsers;
    })();