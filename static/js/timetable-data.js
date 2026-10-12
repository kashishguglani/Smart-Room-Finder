
/* =========================================================
   CSE (AI & ML) TIMETABLE
   Odd Semester 2026–27

   Structure:

   room
   day
   periods
   subject
   teacher
   batch
   section
   ========================================================= */


const TIMETABLE = [

    /* =====================================================
       3A
       ===================================================== */

    {
        room: "G-406",
        day: 1,
        periods: [0, 1],
        subject: "DSA + Lab",
        teacher: "DP",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 1,
        periods: [2],
        subject: "DSD Lec",
        teacher: "DRK",
        batch: "",
        section: "3A"
    },

    {
        room: "B-211",
        day: 1,
        periods: [4, 5],
        subject: "DSD Lab",
        teacher: "DRK",
        batch: "A3",
        section: "3A"
    },

    {
        room: "G-413",
        day: 1,
        periods: [4, 5],
        subject: "OOPS Lab",
        teacher: "MUK",
        batch: "A1",
        section: "3A"
    },

    {
        room: "G-414",
        day: 1,
        periods: [4, 5],
        subject: "AI Lab",
        teacher: "PG",
        batch: "A2",
        section: "3A"
    },

    {
        room: "G-406",
        day: 1,
        periods: [6],
        subject: "OOPS Lec",
        teacher: "MUK",
        batch: "",
        section: "3A"
    },

    {
        room: "G-410",
        day: 1,
        periods: [7],
        subject: "LA Tutorial",
        teacher: "",
        batch: "A1",
        section: "3A"
    },


    {
        room: "G-406",
        day: 2,
        periods: [0, 1],
        subject: "DSA + Lab",
        teacher: "DP",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 2,
        periods: [2],
        subject: "Communication",
        teacher: "PP",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 2,
        periods: [3],
        subject: "OOPS Lec",
        teacher: "MUK",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 2,
        periods: [5],
        subject: "Technical",
        teacher: "PKG",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 2,
        periods: [6],
        subject: "OOPS Lec",
        teacher: "MUK",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 2,
        periods: [7],
        subject: "LA Lec",
        teacher: "DRA",
        batch: "",
        section: "3A"
    },


    {
        room: "G-406",
        day: 3,
        periods: [0, 1],
        subject: "DSA + Lab",
        teacher: "DP",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 3,
        periods: [2],
        subject: "DSD Lec",
        teacher: "DRK",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 3,
        periods: [3],
        subject: "OOPS Lec",
        teacher: "MUK",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 3,
        periods: [5],
        subject: "AI Lec",
        teacher: "PG",
        batch: "",
        section: "3A"
    },

    {
        room: "B-211",
        day: 3,
        periods: [6, 7],
        subject: "DSD Lab",
        teacher: "DRK",
        batch: "A2",
        section: "3A"
    },

    {
        room: "G-413",
        day: 3,
        periods: [6, 7],
        subject: "OOPS Lab",
        teacher: "MUK",
        batch: "A3",
        section: "3A"
    },

    {
        room: "G-414",
        day: 3,
        periods: [6, 7],
        subject: "AI Lab",
        teacher: "PG",
        batch: "A1",
        section: "3A"
    },


    {
        room: "G-406",
        day: 4,
        periods: [0, 1],
        subject: "DSA + Lab",
        teacher: "DP",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 4,
        periods: [2],
        subject: "Communication",
        teacher: "PP",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 4,
        periods: [3],
        subject: "DSD Lec",
        teacher: "DRK",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 4,
        periods: [5],
        subject: "Technical",
        teacher: "PKG",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 4,
        periods: [6],
        subject: "AI Lec",
        teacher: "PG",
        batch: "",
        section: "3A"
    },

    {
        room: "G-410",
        day: 4,
        periods: [7],
        subject: "LA Tutorial",
        teacher: "",
        batch: "A3",
        section: "3A"
    },


    {
        room: "G-406",
        day: 5,
        periods: [0],
        subject: "LA Lec",
        teacher: "DRA",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 5,
        periods: [1],
        subject: "DSA + Lab",
        teacher: "DP",
        batch: "",
        section: "3A"
    },

    {
        room: "B-208",
        day: 5,
        periods: [2, 3],
        subject: "DSD Lab",
        teacher: "DRK",
        batch: "A1",
        section: "3A"
    },

    {
        room: "G-413",
        day: 5,
        periods: [2, 3],
        subject: "OOPS Lab",
        teacher: "MUK",
        batch: "A2",
        section: "3A"
    },

    {
        room: "G-414",
        day: 5,
        periods: [2, 3],
        subject: "AI Lab",
        teacher: "PG",
        batch: "A3",
        section: "3A"
    },

    {
        room: "G-406",
        day: 5,
        periods: [5],
        subject: "AI Lec",
        teacher: "PG",
        batch: "",
        section: "3A"
    },

    {
        room: "G-406",
        day: 5,
        periods: [6],
        subject: "LA Lec",
        teacher: "DRA",
        batch: "",
        section: "3A"
    },

    {
        room: "G-410",
        day: 5,
        periods: [7],
        subject: "LA Tutorial",
        teacher: "Sanjeev Sir",
        batch: "A2",
        section: "3A"
    },


    /* =====================================================
       3B
       ===================================================== */

    {
        room: "G-411",
        day: 1,
        periods: [0, 1],
        subject: "DSA + Lab",
        teacher: "NBHD",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 1,
        periods: [2],
        subject: "AI Lec",
        teacher: "RD",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 1,
        periods: [3],
        subject: "LA Lec",
        teacher: "DAN",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 1,
        periods: [5],
        subject: "OOPS Lec",
        teacher: "MH",
        batch: "",
        section: "3B"
    },

    {
        room: "B-211",
        day: 1,
        periods: [6, 7],
        subject: "DSD Lab",
        teacher: "SS",
        batch: "B1",
        section: "3B"
    },

    {
        room: "G-413",
        day: 1,
        periods: [6, 7],
        subject: "OOPS Lab",
        teacher: "MH",
        batch: "B2",
        section: "3B"
    },

    {
        room: "G-414",
        day: 1,
        periods: [6, 7],
        subject: "AI Lab",
        teacher: "RD",
        batch: "B3",
        section: "3B"
    },


    {
        room: "G-411",
        day: 2,
        periods: [0, 1],
        subject: "DSA + Lab",
        teacher: "NBHD",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 2,
        periods: [2],
        subject: "OOPS Lec",
        teacher: "MH",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 2,
        periods: [4],
        subject: "DSD Lec",
        teacher: "SS",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 2,
        periods: [5],
        subject: "LA Lec",
        teacher: "DAN",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 2,
        periods: [6],
        subject: "OOPS Lec",
        teacher: "MH",
        batch: "",
        section: "3B"
    },

    {
        room: "G-410",
        day: 2,
        periods: [7],
        subject: "LA Tutorial",
        teacher: "DAN",
        batch: "B1",
        section: "3B"
    },


    {
        room: "G-411",
        day: 3,
        periods: [0, 1],
        subject: "DSA + Lab",
        teacher: "NBHD",
        batch: "",
        section: "3B"
    },

    {
        room: "G-410",
        day: 3,
        periods: [2],
        subject: "LA Tutorial",
        teacher: "DAN",
        batch: "B3",
        section: "3B"
    },

    {
        room: "B-211",
        day: 3,
        periods: [4, 5],
        subject: "DSD Lab",
        teacher: "SS",
        batch: "B2",
        section: "3B"
    },

    {
        room: "G-413",
        day: 3,
        periods: [4, 5],
        subject: "OOPS Lab",
        teacher: "MH",
        batch: "B3",
        section: "3B"
    },

    {
        room: "G-414",
        day: 3,
        periods: [4, 5],
        subject: "AI Lab",
        teacher: "RD",
        batch: "B1",
        section: "3B"
    },

    {
        room: "G-411",
        day: 3,
        periods: [6],
        subject: "Technical",
        teacher: "PKG",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 3,
        periods: [7],
        subject: "DSD Lec",
        teacher: "SS",
        batch: "",
        section: "3B"
    },


    {
        room: "G-411",
        day: 4,
        periods: [0],
        subject: "Communication",
        teacher: "PP",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 4,
        periods: [1],
        subject: "Technical",
        teacher: "PKG",
        batch: "",
        section: "3B"
    },

    {
        room: "B-211",
        day: 4,
        periods: [2, 3],
        subject: "DSD Lab",
        teacher: "SS",
        batch: "B3",
        section: "3B"
    },

    {
        room: "G-413",
        day: 4,
        periods: [2, 3],
        subject: "OOPS Lab",
        teacher: "MH",
        batch: "B1",
        section: "3B"
    },

    {
        room: "G-414",
        day: 4,
        periods: [2, 3],
        subject: "AI Lab",
        teacher: "RD",
        batch: "B2",
        section: "3B"
    },

    {
        room: "G-411",
        day: 4,
        periods: [5],
        subject: "DSD Lec",
        teacher: "SS",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 4,
        periods: [6],
        subject: "OOPS Lec",
        teacher: "MH",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 4,
        periods: [7],
        subject: "AI Lec",
        teacher: "RD",
        batch: "",
        section: "3B"
    },


    {
        room: "G-411",
        day: 5,
        periods: [0],
        subject: "DSA + Lab",
        teacher: "NBHD",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 5,
        periods: [1],
        subject: "AI Lec",
        teacher: "RD",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 5,
        periods: [2],
        subject: "LA Lec",
        teacher: "DAN",
        batch: "",
        section: "3B"
    },

    {
        room: "G-411",
        day: 5,
        periods: [3],
        subject: "Communication",
        teacher: "PP",
        batch: "",
        section: "3B"
    },

    {
        room: "G-410",
        day: 5,
        periods: [5],
        subject: "LA Tutorial",
        teacher: "DAN",
        batch: "B2",
        section: "3B"
    },

    {
        room: "G-405",
        day: 5,
        periods: [6, 7],
        subject: "DSA + Lab",
        teacher: "NBHD",
        batch: "",
        section: "3B"
    },


    /* =====================================================
       5A
       ===================================================== */

    {
        room: "G-417",
        day: 1,
        periods: [0],
        subject: "CN Lec",
        teacher: "NV",
        batch: "",
        section: "5A"
    },

    {
        room: "G-405",
        day: 1,
        periods: [1, 2],
        subject: "Aptitude",
        teacher: "MND",
        batch: "",
        section: "5A"
    },

    {
        room: "G-415",
        day: 1,
        periods: [4, 5],
        subject: "ANN Lab",
        teacher: "NS",
        batch: "A2",
        section: "5A"
    },

    {
        room: "G-419",
        day: 1,
        periods: [4, 5],
        subject: "DBMS Lab",
        teacher: "PS",
        batch: "A1",
        section: "5A"
    },

    {
        room: "G-405",
        day: 1,
        periods: [6],
        subject: "DBMS Lec",
        teacher: "PS",
        batch: "",
        section: "5A"
    },

    {
        room: "G-415",
        day: 1,
        periods: [7],
        subject: "Project",
        teacher: "DV",
        batch: "A1",
        section: "5A"
    },


    {
        room: "G-405",
        day: 2,
        periods: [0],
        subject: "COA Lec",
        teacher: "MH",
        batch: "",
        section: "5A"
    },

    {
        room: "G-405",
        day: 2,
        periods: [1],
        subject: "Technical",
        teacher: "AB",
        batch: "",
        section: "5A"
    },

    {
        room: "G-413",
        day: 2,
        periods: [2, 3],
        subject: "ANN Lab",
        teacher: "NS",
        batch: "A3",
        section: "5A"
    },

    {
        room: "G-410",
        day: 2,
        periods: [2, 3],
        subject: "Project",
        teacher: "PG",
        batch: "A2",
        section: "5A"
    },

    {
        room: "G-405",
        day: 2,
        periods: [5],
        subject: "ANN Lec",
        teacher: "NS",
        batch: "",
        section: "5A"
    },

    {
        room: "G-405",
        day: 2,
        periods: [6],
        subject: "DBMS Lec",
        teacher: "PS",
        batch: "",
        section: "5A"
    },

    {
        room: "G-418",
        day: 2,
        periods: [7],
        subject: "Coding Class",
        teacher: "DK",
        batch: "A1",
        section: "5A"
    },


    {
        room: "G-405",
        day: 3,
        periods: [0],
        subject: "CN Lec",
        teacher: "NV",
        batch: "",
        section: "5A"
    },

    {
        room: "G-405",
        day: 3,
        periods: [1],
        subject: "Communication",
        teacher: "RR",
        batch: "",
        section: "5A"
    },

    {
        room: "G-405",
        day: 3,
        periods: [2],
        subject: "ANN Lec",
        teacher: "NS",
        batch: "",
        section: "5A"
    },

    {
        room: "G-415",
        day: 3,
        periods: [4, 5],
        subject: "ANN Lab",
        teacher: "NS",
        batch: "A3",
        section: "5A"
    },

    {
        room: "G-409",
        day: 3,
        periods: [4, 5],
        subject: "Project",
        teacher: "RH",
        batch: "A2",
        section: "5A"
    },

    {
        room: "G-405",
        day: 3,
        periods: [6],
        subject: "DBMS Lec",
        teacher: "PS",
        batch: "",
        section: "5A"
    },

    {
        room: "G-405",
        day: 3,
        periods: [7],
        subject: "COA Lec",
        teacher: "MH",
        batch: "",
        section: "5A"
    },


    {
        room: "G-413",
        day: 4,
        periods: [0, 1],
        subject: "ANN Lab",
        teacher: "NS",
        batch: "A1",
        section: "5A"
    },

    {
        room: "G-414",
        day: 4,
        periods: [0, 1],
        subject: "DBMS Lab",
        teacher: "PS",
        batch: "A2",
        section: "5A"
    },

    {
        room: "G-410",
        day: 4,
        periods: [0, 1],
        subject: "Project",
        teacher: "PG",
        batch: "A3",
        section: "5A"
    },

    {
        room: "G-405",
        day: 4,
        periods: [2],
        subject: "Technical",
        teacher: "AB",
        batch: "",
        section: "5A"
    },

    {
        room: "G-415",
        day: 4,
        periods: [4, 5],
        subject: "ANN Lab",
        teacher: "NS",
        batch: "A2",
        section: "5A"
    },

    {
        room: "G-414",
        day: 4,
        periods: [4, 5],
        subject: "DBMS Lab",
        teacher: "PS",
        batch: "A3",
        section: "5A"
    },

    {
        room: "G-409",
        day: 4,
        periods: [4, 5],
        subject: "Project",
        teacher: "JYS",
        batch: "A1",
        section: "5A"
    },

    {
        room: "G-410",
        day: 4,
        periods: [6],
        subject: "Coding Class",
        teacher: "DK",
        batch: "A2",
        section: "5A"
    },

    {
        room: "G-405",
        day: 4,
        periods: [7],
        subject: "COA Lec",
        teacher: "MH",
        batch: "",
        section: "5A"
    },


    {
        room: "G-405",
        day: 5,
        periods: [0],
        subject: "CN Lec",
        teacher: "NV",
        batch: "",
        section: "5A"
    },

    {
        room: "G-405",
        day: 5,
        periods: [1],
        subject: "Communication",
        teacher: "RR",
        batch: "",
        section: "5A"
    },

    {
        room: "G-415",
        day: 5,
        periods: [2, 3],
        subject: "ANN Lab",
        teacher: "NS",
        batch: "A1",
        section: "5A"
    },

    {
        room: "G-409",
        day: 5,
        periods: [2, 3],
        subject: "Project",
        teacher: "RH",
        batch: "A3",
        section: "5A"
    },

    {
        room: "G-405",
        day: 5,
        periods: [5],
        subject: "ANN Lec",
        teacher: "NS",
        batch: "",
        section: "5A"
    },

    {
        room: "G-410",
        day: 5,
        periods: [6],
        subject: "Coding Class",
        teacher: "DK",
        batch: "A3",
        section: "5A"
    },

    {
        room: "G-418",
        day: 5,
        periods: [7],
        subject: "Project",
        teacher: "DV",
        batch: "A1",
        section: "5A"
    },


    /* =====================================================
       5B
       ===================================================== */

    {
        room: "G-416",
        day: 1,
        periods: [0, 1],
        subject: "Technical",
        teacher: "AB",
        batch: "",
        section: "5B"
    },

    {
        room: "G-415",
        day: 1,
        periods: [2, 3],
        subject: "ANN Lab",
        teacher: "NC",
        batch: "B2",
        section: "5B"
    },

    {
        room: "G-414",
        day: 1,
        periods: [2, 3],
        subject: "DBMS Lab",
        teacher: "TC",
        batch: "B3",
        section: "5B"
    },

    {
        room: "G-413",
        day: 1,
        periods: [2, 3],
        subject: "Project",
        teacher: "GG",
        batch: "B1",
        section: "5B"
    },

    {
        room: "G-416",
        day: 1,
        periods: [5],
        subject: "COA Lec",
        teacher: "NBHD",
        batch: "",
        section: "5B"
    },

    {
        room: "G-416",
        day: 1,
        periods: [6],
        subject: "DBMS Lec",
        teacher: "TC",
        batch: "",
        section: "5B"
    },

    {
        room: "G-409",
        day: 1,
        periods: [7],
        subject: "Coding Class",
        teacher: "NBH",
        batch: "B3",
        section: "5B"
    },


    {
        room: "G-417",
        day: 2,
        periods: [0],
        subject: "CN Lec",
        teacher: "NV",
        batch: "",
        section: "5B"
    },

    {
        room: "G-416",
        day: 2,
        periods: [1],
        subject: "Communication",
        teacher: "RR",
        batch: "",
        section: "5B"
    },

    {
        room: "G-419",
        day: 2,
        periods: [2, 3],
        subject: "ANN Lab",
        teacher: "NC",
        batch: "B1",
        section: "5B"
    },

    {
        room: "G-418",
        day: 2,
        periods: [2, 3],
        subject: "DBMS Lab",
        teacher: "TC",
        batch: "B2",
        section: "5B"
    },

    {
        room: "G-409",
        day: 2,
        periods: [5],
        subject: "Coding Class",
        teacher: "DV",
        batch: "B2",
        section: "5B"
    },

    {
        room: "G-416",
        day: 2,
        periods: [6],
        subject: "ANN Lec",
        teacher: "NC",
        batch: "",
        section: "5B"
    },

    {
        room: "G-413",
        day: 2,
        periods: [7],
        subject: "Minor Project",
        teacher: "GG",
        batch: "B3",
        section: "5B"
    },


    {
        room: "G-416",
        day: 3,
        periods: [0],
        subject: "ANN Lec",
        teacher: "NC",
        batch: "",
        section: "5B"
    },

    {
        room: "G-416",
        day: 3,
        periods: [1, 2],
        subject: "Aptitude",
        teacher: "MND",
        batch: "",
        section: "5B"
    },

    {
        room: "G-418",
        day: 3,
        periods: [4, 5],
        subject: "ANN Lab",
        teacher: "NC",
        batch: "B3",
        section: "5B"
    },

    {
        room: "G-419",
        day: 3,
        periods: [4, 5],
        subject: "DBMS Lab",
        teacher: "TC",
        batch: "B1",
        section: "5B"
    },

    {
        room: "G-410",
        day: 3,
        periods: [4, 5],
        subject: "Project",
        teacher: "JB",
        batch: "B2",
        section: "5B"
    },

    {
        room: "G-415",
        day: 3,
        periods: [6, 7],
        subject: "ANN Lab",
        teacher: "NC",
        batch: "B2",
        section: "5B"
    },

    {
        room: "G-418",
        day: 3,
        periods: [6, 7],
        subject: "Project",
        teacher: "ARTI",
        batch: "B1",
        section: "5B"
    },


    {
        room: "G-416",
        day: 4,
        periods: [0],
        subject: "CN Lec",
        teacher: "NV",
        batch: "",
        section: "5B"
    },

    {
        room: "G-416",
        day: 4,
        periods: [1],
        subject: "ANN Lec",
        teacher: "NC",
        batch: "",
        section: "5B"
    },

    {
        room: "G-416",
        day: 4,
        periods: [2],
        subject: "Communication",
        teacher: "RR",
        batch: "",
        section: "5B"
    },

    {
        room: "G-416",
        day: 4,
        periods: [3],
        subject: "DBMS Lec",
        teacher: "TC",
        batch: "",
        section: "5B"
    },

    {
        room: "G-416",
        day: 4,
        periods: [5],
        subject: "COA Lec",
        teacher: "NBHD",
        batch: "",
        section: "5B"
    },

    {
        room: "G-413",
        day: 4,
        periods: [6, 7],
        subject: "ANN Lab",
        teacher: "NC",
        batch: "B1",
        section: "5B"
    },

    {
        room: "G-414",
        day: 4,
        periods: [6, 7],
        subject: "Project",
        teacher: "ARTI",
        batch: "B3",
        section: "5B"
    },


    {
        room: "G-413",
        day: 5,
        periods: [0, 1],
        subject: "ANN Lab",
        teacher: "NC",
        batch: "B3",
        section: "5B"
    },

    {
        room: "G-414",
        day: 5,
        periods: [0, 1],
        subject: "Project",
        teacher: "PS",
        batch: "B2",
        section: "5B"
    },

    {
        room: "G-416",
        day: 5,
        periods: [2],
        subject: "COA Lec",
        teacher: "NBHD",
        batch: "",
        section: "5B"
    },

    {
        room: "G-416",
        day: 5,
        periods: [3],
        subject: "DBMS Lec",
        teacher: "TC",
        batch: "",
        section: "5B"
    },

    {
        room: "G-416",
        day: 5,
        periods: [5],
        subject: "CN Lec",
        teacher: "JYS",
        batch: "",
        section: "5B"
    },

    {
        room: "G-414",
        day: 5,
        periods: [6],
        subject: "Minor Project",
        teacher: "GG",
        batch: "B3",
        section: "5B"
    },

    {
        room: "G-409",
        day: 5,
        periods: [7],
        subject: "Coding Class",
        teacher: "ARTI",
        batch: "B1",
        section: "5B"
    },


    /* =====================================================
       7A
       ===================================================== */

    {
        room: "G-405",
        day: 1,
        periods: [0],
        subject: "DSRP Lec",
        teacher: "RH",
        batch: "",
        section: "7A"
    },

    {
        room: "G-417",
        day: 1,
        periods: [1],
        subject: "SC Lec",
        teacher: "GG",
        batch: "",
        section: "7A"
    },

    {
        room: "G-416",
        day: 1,
        periods: [2],
        subject: "DL Lec",
        teacher: "DPS",
        batch: "",
        section: "7A"
    },

    {
        room: "G-416",
        day: 1,
        periods: [4],
        subject: "R&IS Lec",
        teacher: "ARTI",
        batch: "",
        section: "7A"
    },

    {
        room: "G-417",
        day: 1,
        periods: [5],
        subject: "UHV-II Lec",
        teacher: "",
        batch: "",
        section: "7A"
    },

    {
        room: "G-418",
        day: 1,
        periods: [6, 7],
        subject: "DSRP Lab",
        teacher: "RH",
        batch: "A3",
        section: "7A"
    },

    {
        room: "G-419",
        day: 1,
        periods: [6, 7],
        subject: "DL Lab",
        teacher: "DPS",
        batch: "A1",
        section: "7A"
    },


    {
        room: "G-416",
        day: 2,
        periods: [0],
        subject: "SC Lec",
        teacher: "GG",
        batch: "",
        section: "7A"
    },

    {
        room: "G-417",
        day: 2,
        periods: [1],
        subject: "UHV-II Lec",
        teacher: "",
        batch: "",
        section: "7A"
    },

    {
        room: "G-416",
        day: 2,
        periods: [2],
        subject: "DL Lec",
        teacher: "DPS",
        batch: "",
        section: "7A"
    },

    {
        room: "G-416",
        day: 2,
        periods: [4],
        subject: "R&IS Lec",
        teacher: "ARTI",
        batch: "",
        section: "7A"
    },

    {
        room: "G-416",
        day: 2,
        periods: [5],
        subject: "DSRP Lec",
        teacher: "RH",
        batch: "",
        section: "7A"
    },

    {
        room: "G-409",
        day: 2,
        periods: [6, 7],
        subject: "Project",
        teacher: "DPS",
        batch: "A1",
        section: "7A"
    },

    {
        room: "G-419",
        day: 2,
        periods: [6, 7],
        subject: "Project",
        teacher: "TC",
        batch: "A2",
        section: "7A"
    },


    {
        room: "G-417",
        day: 3,
        periods: [0],
        subject: "DSRP Lec",
        teacher: "RH",
        batch: "",
        section: "7A"
    },

    {
        room: "G-417",
        day: 3,
        periods: [1],
        subject: "SC Lec",
        teacher: "GG",
        batch: "",
        section: "7A"
    },

    {
        room: "G-417",
        day: 3,
        periods: [2],
        subject: "DL Lec",
        teacher: "DPS",
        batch: "",
        section: "7A"
    },

    {
        room: "G-416",
        day: 3,
        periods: [4],
        subject: "R&IS Lec",
        teacher: "ARTI",
        batch: "",
        section: "7A"
    },

    {
        room: "G-417",
        day: 3,
        periods: [5],
        subject: "UHV-II Lec",
        teacher: "",
        batch: "",
        section: "7A"
    },

    {
        room: "G-409",
        day: 3,
        periods: [6, 7],
        subject: "Project",
        teacher: "TC",
        batch: "A3",
        section: "7A"
    },


    {
        room: "G-415",
        day: 4,
        periods: [0, 1],
        subject: "DSRP Lab",
        teacher: "RH",
        batch: "A1",
        section: "7A"
    },

    {
        room: "G-418",
        day: 4,
        periods: [0, 1],
        subject: "DL Lab",
        teacher: "DPS",
        batch: "A2",
        section: "7A"
    },

    {
        room: "G-419",
        day: 4,
        periods: [0, 1],
        subject: "Project",
        teacher: "MH",
        batch: "A3",
        section: "7A"
    },

    {
        room: "G-418",
        day: 4,
        periods: [2, 3],
        subject: "Project",
        teacher: "MUK",
        batch: "A1",
        section: "7A"
    },

    {
        room: "G-419",
        day: 4,
        periods: [2, 3],
        subject: "Project",
        teacher: "DK",
        batch: "A2",
        section: "7A"
    },

    {
        room: "G-409",
        day: 4,
        periods: [2, 3],
        subject: "Project",
        teacher: "NV",
        batch: "A3",
        section: "7A"
    },

    {
        room: "G-418",
        day: 4,
        periods: [5, 6],
        subject: "Project",
        teacher: "RH",
        batch: "A2",
        section: "7A"
    },

    {
        room: "G-419",
        day: 4,
        periods: [5, 6],
        subject: "Project",
        teacher: "DPS",
        batch: "A3",
        section: "7A"
    },


    {
        room: "G-418",
        day: 5,
        periods: [0, 1],
        subject: "DSRP Lab",
        teacher: "RH",
        batch: "A2",
        section: "7A"
    },

    {
        room: "G-419",
        day: 5,
        periods: [0, 1],
        subject: "DL Lab",
        teacher: "DPS",
        batch: "A3",
        section: "7A"
    },

    {
        room: "G-415",
        day: 5,
        periods: [0, 1],
        subject: "Project",
        teacher: "DV",
        batch: "A1",
        section: "7A"
    },

    {
        room: "G-418",
        day: 5,
        periods: [2, 3],
        subject: "Project",
        teacher: "JYS",
        batch: "A1",
        section: "7A"
    },

    {
        room: "G-419",
        day: 5,
        periods: [2, 3],
        subject: "Project",
        teacher: "PS",
        batch: "A2",
        section: "7A"
    },

    {
        room: "G-410",
        day: 5,
        periods: [2, 3],
        subject: "Project",
        teacher: "RV",
        batch: "A3",
        section: "7A"
    },

    {
        room: "G-409",
        day: 5,
        periods: [5, 6],
        subject: "Project",
        teacher: "JB",
        batch: "A1",
        section: "7A"
    },

    {
        room: "G-418",
        day: 5,
        periods: [5, 6],
        subject: "Project",
        teacher: "DPS",
        batch: "A2",
        section: "7A"
    },


    /* =====================================================
       7B
       ===================================================== */

    {
        room: "G-418",
        day: 1,
        periods: [0, 1],
        subject: "DSRP Lab",
        teacher: "DV",
        batch: "B1",
        section: "7B"
    },

    {
        room: "G-419",
        day: 1,
        periods: [0, 1],
        subject: "DL Lab",
        teacher: "JB",
        batch: "B2",
        section: "7B"
    },

    {
        room: "G-409",
        day: 1,
        periods: [0, 1],
        subject: "Project",
        teacher: "JYS",
        batch: "B3",
        section: "7B"
    },

    {
        room: "G-417",
        day: 1,
        periods: [2],
        subject: "UHV-II Lec",
        teacher: "",
        batch: "",
        section: "7B"
    },

    {
        room: "G-405",
        day: 1,
        periods: [5],
        subject: "SC Lec",
        teacher: "GG",
        batch: "",
        section: "7B"
    },

    {
        room: "G-417",
        day: 1,
        periods: [6],
        subject: "DL Lec",
        teacher: "JB",
        batch: "",
        section: "7B"
    },

    {
        room: "G-411",
        day: 1,
        periods: [7],
        subject: "R&IS Lec",
        teacher: "DK",
        batch: "",
        section: "7B"
    },


    {
        room: "G-418",
        day: 2,
        periods: [0, 1],
        subject: "DSRP Lab",
        teacher: "DV",
        batch: "B3",
        section: "7B"
    },

    {
        room: "G-419",
        day: 2,
        periods: [0, 1],
        subject: "DL Lab",
        teacher: "JB",
        batch: "B1",
        section: "7B"
    },

    {
        room: "G-409",
        day: 2,
        periods: [0, 1],
        subject: "Project",
        teacher: "RD",
        batch: "B2",
        section: "7B"
    },

    {
        room: "G-414",
        day: 2,
        periods: [2, 3],
        subject: "Project",
        teacher: "PS",
        batch: "B1",
        section: "7B"
    },

    {
        room: "G-415",
        day: 2,
        periods: [2, 3],
        subject: "Project",
        teacher: "DK",
        batch: "B2",
        section: "7B"
    },

    {
        room: "G-409",
        day: 2,
        periods: [2, 3],
        subject: "Project",
        teacher: "NBHD",
        batch: "B3",
        section: "7B"
    },

    {
        room: "G-414",
        day: 2,
        periods: [5, 6],
        subject: "Project",
        teacher: "PG",
        batch: "B3",
        section: "7B"
    },

    {
        room: "G-416",
        day: 2,
        periods: [7],
        subject: "DSRP Lec",
        teacher: "DV",
        batch: "",
        section: "7B"
    },


    {
        room: "G-415",
        day: 3,
        periods: [0, 1],
        subject: "DSRP Lab",
        teacher: "DV",
        batch: "B2",
        section: "7B"
    },

    {
        room: "G-413",
        day: 3,
        periods: [0, 1],
        subject: "DL Lab",
        teacher: "JB",
        batch: "B3",
        section: "7B"
    },

    {
        room: "G-409",
        day: 3,
        periods: [0, 1],
        subject: "Project",
        teacher: "RD",
        batch: "B1",
        section: "7B"
    },

    {
        room: "G-418",
        day: 3,
        periods: [2, 3],
        subject: "Project",
        teacher: "DV",
        batch: "B1",
        section: "7B"
    },

    {
        room: "G-419",
        day: 3,
        periods: [2, 3],
        subject: "Project",
        teacher: "NBHD",
        batch: "B2",
        section: "7B"
    },

    {
        room: "G-415",
        day: 3,
        periods: [2, 3],
        subject: "Project",
        teacher: "GG",
        batch: "B3",
        section: "7B"
    },

    {
        room: "G-419",
        day: 3,
        periods: [6, 7],
        subject: "Project",
        teacher: "JB",
        batch: "B2",
        section: "7B"
    },

    {
        room: "G-410",
        day: 3,
        periods: [6, 7],
        subject: "Project",
        teacher: "RV",
        batch: "B3",
        section: "7B"
    },


    {
        room: "G-417",
        day: 4,
        periods: [0],
        subject: "DL Lec",
        teacher: "JB",
        batch: "",
        section: "7B"
    },

    {
        room: "G-405",
        day: 4,
        periods: [1],
        subject: "SC Lec",
        teacher: "GG",
        batch: "",
        section: "7B"
    },

    {
        room: "G-417",
        day: 4,
        periods: [2],
        subject: "UHV-II Lec",
        teacher: "",
        batch: "",
        section: "7B"
    },

    {
        room: "G-416",
        day: 4,
        periods: [4],
        subject: "DSRP Lec",
        teacher: "DV",
        batch: "",
        section: "7B"
    },

    {
        room: "G-405",
        day: 4,
        periods: [5],
        subject: "R&IS Lec",
        teacher: "DK",
        batch: "",
        section: "7B"
    },

    {
        room: "G-409",
        day: 4,
        periods: [6, 7],
        subject: "Project",
        teacher: "DV",
        batch: "B1",
        section: "7B"
    },

    {
        room: "G-415",
        day: 4,
        periods: [6, 7],
        subject: "Project",
        teacher: "NS",
        batch: "B2",
        section: "7B"
    },


    {
        room: "G-416",
        day: 5,
        periods: [0],
        subject: "DL Lec",
        teacher: "JB",
        batch: "",
        section: "7B"
    },

    {
        room: "G-416",
        day: 5,
        periods: [1],
        subject: "SC Lec",
        teacher: "GG",
        batch: "",
        section: "7B"
    },

    {
        room: "G-417",
        day: 5,
        periods: [2],
        subject: "UHV-II Lec",
        teacher: "",
        batch: "",
        section: "7B"
    },

    {
        room: "G-416",
        day: 5,
        periods: [4],
        subject: "DSRP Lec",
        teacher: "DV",
        batch: "",
        section: "7B"
    },

    {
        room: "G-411",
        day: 5,
        periods: [5],
        subject: "R&IS Lec",
        teacher: "DK",
        batch: "",
        section: "7B"
    },

    {
        room: "G-415",
        day: 5,
        periods: [6, 7],
        subject: "Project",
        teacher: "TC",
        batch: "B3",
        section: "7B"
    },

    {
        room: "G-419",
        day: 5,
        periods: [6, 7],
        subject: "Project",
        teacher: "PS",
        batch: "B1",
        section: "7B"
    }

];

