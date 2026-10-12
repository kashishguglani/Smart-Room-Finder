/* =========================================================
   ROOM DATA — MULTI-COLLEGE SUPPORT
   ========================================================= */

const COLLEGE_ROOMS = {
    PIET: [
        { number: "G-408", type: "Lab" },
        { number: "G-411", type: "Classroom" },
        { number: "G-405", type: "Classroom" },
        { number: "G-406", type: "Classroom" },
        { number: "G-409", type: "Lab" },
        { number: "G-410", type: "Lab" },
        { number: "G-413", type: "Lab" },
        { number: "G-414", type: "Lab" },
        { number: "G-415", type: "Lab" },
        { number: "G-416", type: "Classroom" },
        { number: "G-417", type: "Classroom" },
        { number: "G-418", type: "Lab" },
        { number: "G-419", type: "Lab" }
    ],

    // Temporary test rooms for college code 678.
    // Replace these with the college's actual room numbers.
    "678": [
        { number: "A-101", type: "Classroom" },
        { number: "A-102", type: "Classroom" },
        { number: "A-103", type: "Lab" },
        { number: "A-104", type: "Lab" }
    ]
};

/* =========================================================
   CURRENT COLLEGE
   ========================================================= */

function getCurrentCollegeCode() {
    return window.currentCollegeCode || "PIET";
}

/* =========================================================
   GET ROOMS FOR A COLLEGE
   ========================================================= */

function getRoomsForCollege(collegeCode) {
    const code = String(collegeCode || "PIET")
        .trim()
        .toUpperCase();

    const rooms = COLLEGE_ROOMS[code] || [];

    return rooms.map(room => ({ ...room }));
}

/* =========================================================
   BACKWARD COMPATIBILITY
   ========================================================= */

const ROOMS = getRoomsForCollege("PIET");

/* =========================================================
   ROOM LOOKUP
   ========================================================= */

function getRoomByNumber(
    roomNumber,
    collegeCode = getCurrentCollegeCode()
) {
    const target = String(roomNumber || "").trim();

    return getRoomsForCollege(collegeCode).find(
        room => room.number === target
    ) || null;
}