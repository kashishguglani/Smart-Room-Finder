import re
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from werkzeug.security import check_password_hash, generate_password_hash
import os

# =========================================================
# DATABASE CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "room_finder.db"

# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_connection():
    conn = sqlite3.connect(str(DATABASE), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def database_connection():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# =========================================================
# COLLEGES
# =========================================================

def init_colleges_table():
    with database_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS colleges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                code TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            INSERT OR IGNORE INTO colleges (name, code)
            VALUES (?, ?)
        """, (
            "Panipat Institute of Engineering and Technology",
            "PIET"
        ))


def init_college_settings_table():
    """Store display settings separately for each college."""
    with database_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS college_settings (
                college_id INTEGER PRIMARY KEY,
                department TEXT NOT NULL DEFAULT '',
                semester TEXT NOT NULL DEFAULT '',
                academic_year TEXT NOT NULL DEFAULT '',
                FOREIGN KEY (college_id)
                    REFERENCES colleges(id)
                    ON DELETE CASCADE
            )
        """)

        # Add default settings only for colleges that don't have them.
        colleges = conn.execute(
            "SELECT id, code FROM colleges"
        ).fetchall()

        for college in colleges:
            if college["code"] == "PIET":
                defaults = (
                    "CSE (AI & ML)",
                    "Odd Semester",
                    "2026–27",
                )
            else:
                defaults = ("", "", "")

            conn.execute("""
                INSERT OR IGNORE INTO college_settings (
                    college_id, department, semester, academic_year
                )
                VALUES (?, ?, ?, ?)
            """, (college["id"], *defaults))


def get_college_settings(college_id):
    with database_connection() as conn:
        row = conn.execute("""
            SELECT c.id AS college_id, c.name, c.code,
                   s.department, s.semester, s.academic_year
            FROM colleges c
            LEFT JOIN college_settings s ON s.college_id = c.id
            WHERE c.id = ?
        """, (int(college_id),)).fetchone()

        return dict(row) if row else None


def save_college_settings(
    college_id, department, semester, academic_year
):
    department = (department or "").strip()
    semester = (semester or "").strip()
    academic_year = (academic_year or "").strip()

    if not department or not semester or not academic_year:
        raise ValueError(
            "Department, semester and academic year are required."
        )

    with database_connection() as conn:
        conn.execute("""
            INSERT INTO college_settings (
                college_id, department, semester, academic_year
            )
            VALUES (?, ?, ?, ?)
            ON CONFLICT(college_id) DO UPDATE SET
                department = excluded.department,
                semester = excluded.semester,
                academic_year = excluded.academic_year
        """, (
            int(college_id), department, semester, academic_year
        ))

    return get_college_settings(college_id)

def get_all_colleges():
    with database_connection() as conn:
        rows = conn.execute("""
            SELECT id, name, code, created_at
            FROM colleges
            ORDER BY name
        """).fetchall()
        return [dict(row) for row in rows]


def get_college_by_id(college_id):
    with database_connection() as conn:
        row = conn.execute("""
            SELECT id, name, code, created_at
            FROM colleges
            WHERE id = ?
        """, (int(college_id),)).fetchone()
        return dict(row) if row else None


def get_college_by_code(code):
    if not code:
        return None
    with database_connection() as conn:
        row = conn.execute("""
            SELECT id, name, code, created_at
            FROM colleges
            WHERE code = ?
        """, (code.strip().upper(),)).fetchone()
        return dict(row) if row else None


def create_college(name, code):
    name = (name or "").strip()
    code = (code or "").strip().upper()

    if not name or not code:
        raise ValueError("College name and college code are required.")

    if not re.fullmatch(r"[A-Z0-9_-]{2,20}", code):
        raise ValueError(
            "College code must contain 2–20 letters, numbers, "
            "hyphens or underscores."
        )

    with database_connection() as conn:
        existing = conn.execute("""
            SELECT id FROM colleges
            WHERE name = ? OR code = ?
        """, (name, code)).fetchone()

        if existing:
            raise ValueError("College name or code already exists.")

        cursor = conn.execute("""
            INSERT INTO colleges (name, code)
            VALUES (?, ?)
        """, (name, code))
        return cursor.lastrowid

# =========================================================
# DATABASE MIGRATIONS
# =========================================================

def _table_exists(conn, table_name):
    return conn.execute("""
        SELECT name FROM sqlite_master
        WHERE type = 'table' AND name = ?
    """, (table_name,)).fetchone() is not None


def _columns(conn, table_name):
    return {
        row["name"]
        for row in conn.execute(
            f"PRAGMA table_info({table_name})"
        ).fetchall()
    }


def _has_single_column_unique_index(conn, table_name, column_name):
    for index in conn.execute(
        f"PRAGMA index_list({table_name})"
    ).fetchall():
        if not index["unique"]:
            continue

        index_name = index["name"].replace('"', '""')
        index_columns = conn.execute(
            f'PRAGMA index_info("{index_name}")'
        ).fetchall()

        if [item["name"] for item in index_columns] == [column_name]:
            return True

    return False


def _migrate_users(conn, default_college_id):
    """
    Migrate usernames from globally unique to unique per college.
    Existing user IDs, passwords, roles, college IDs and timestamps
    are preserved.
    """
    if not _table_exists(conn, "users"):
        conn.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                college_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(username, college_id)
            )
        """)
        return

    columns = _columns(conn, "users")

    if "college_id" not in columns:
        conn.execute(f"""
            ALTER TABLE users
            ADD COLUMN college_id INTEGER NOT NULL
            DEFAULT {int(default_college_id)}
        """)

    if "created_at" not in _columns(conn, "users"):
        conn.execute("""
            ALTER TABLE users
            ADD COLUMN created_at TIMESTAMP
        """)

    if not _has_single_column_unique_index(conn, "users", "username"):
        conn.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS
            idx_users_username_college
            ON users (username, college_id)
        """)
        return

    # Replace the old global username constraint.
    conn.execute("DROP INDEX IF EXISTS idx_users_username_college")

    conn.execute("""
        CREATE TABLE users_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            college_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(username, college_id)
        )
    """)

    conn.execute("""
        INSERT INTO users_new (
            id, username, password, role, college_id, created_at
        )
        SELECT id, username, password, role, college_id, created_at
        FROM users
    """)

    conn.execute("DROP TABLE users")
    conn.execute("ALTER TABLE users_new RENAME TO users")


def _migrate_room_updates(conn, default_college_id):
    if not _table_exists(conn, "room_updates"):
        conn.execute("""
            CREATE TABLE room_updates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room TEXT NOT NULL,
                day INTEGER NOT NULL,
                period INTEGER NOT NULL,
                update_type TEXT NOT NULL,
                person TEXT,
                college_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(college_id, room, day, period)
            )
        """)
        return

    if "college_id" in _columns(conn, "room_updates"):
        return

    conn.execute(
        "ALTER TABLE room_updates RENAME TO room_updates_legacy"
    )

    conn.execute("""
        CREATE TABLE room_updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room TEXT NOT NULL,
            day INTEGER NOT NULL,
            period INTEGER NOT NULL,
            update_type TEXT NOT NULL,
            person TEXT,
            college_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(college_id, room, day, period)
        )
    """)

    old_columns = _columns(conn, "room_updates_legacy")
    person_col = "person" if "person" in old_columns else "NULL"
    created_col = (
        "created_at"
        if "created_at" in old_columns
        else "CURRENT_TIMESTAMP"
    )

    conn.execute(f"""
        INSERT INTO room_updates (
            id, room, day, period, update_type,
            person, college_id, created_at
        )
        SELECT id, room, day, period, update_type,
               {person_col}, {int(default_college_id)}, {created_col}
        FROM room_updates_legacy
    """)

    conn.execute("DROP TABLE room_updates_legacy")


def _migrate_timetable(conn, default_college_id):
    if not _table_exists(conn, "timetable"):
        conn.execute("""
            CREATE TABLE timetable (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                day INTEGER NOT NULL,
                period INTEGER NOT NULL,
                room TEXT NOT NULL,
                section TEXT NOT NULL,
                subject TEXT NOT NULL,
                teacher TEXT NOT NULL,
                college_id INTEGER NOT NULL,
                UNIQUE(college_id, day, period, room)
            )
        """)
        return

    if "college_id" in _columns(conn, "timetable"):
        return

    conn.execute("ALTER TABLE timetable RENAME TO timetable_legacy")

    conn.execute("""
        CREATE TABLE timetable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day INTEGER NOT NULL,
            period INTEGER NOT NULL,
            room TEXT NOT NULL,
            section TEXT NOT NULL,
            subject TEXT NOT NULL,
            teacher TEXT NOT NULL,
            college_id INTEGER NOT NULL,
            UNIQUE(college_id, day, period, room)
        )
    """)

    conn.execute("""
        INSERT INTO timetable (
            id, day, period, room, section,
            subject, teacher, college_id
        )
        SELECT id, day, period, room, section,
               subject, teacher, ?
        FROM timetable_legacy
    """, (int(default_college_id),))

    conn.execute("DROP TABLE timetable_legacy")

    old_columns = _columns(conn, "room_updates_legacy")
    person_col = "person" if "person" in old_columns else "NULL"
    created_col = (
        "created_at" if "created_at" in old_columns
        else "CURRENT_TIMESTAMP"
    )

    conn.execute(f"""
        INSERT INTO room_updates (
            id, room, day, period, update_type,
            person, college_id, created_at
        )
        SELECT id, room, day, period, update_type,
               {person_col}, {int(default_college_id)}, {created_col}
        FROM room_updates_legacy
    """)
    conn.execute("DROP TABLE room_updates_legacy")


def _migrate_timetable(conn, default_college_id):
    if not _table_exists(conn, "timetable"):
        conn.execute("""
            CREATE TABLE timetable (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                day INTEGER NOT NULL,
                period INTEGER NOT NULL,
                room TEXT NOT NULL,
                section TEXT NOT NULL,
                subject TEXT NOT NULL,
                teacher TEXT NOT NULL,
                college_id INTEGER NOT NULL,
                UNIQUE(college_id, day, period, room)
            )
        """)
        return

    if "college_id" in _columns(conn, "timetable"):
        return

    conn.execute("ALTER TABLE timetable RENAME TO timetable_legacy")
    conn.execute("""
        CREATE TABLE timetable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day INTEGER NOT NULL,
            period INTEGER NOT NULL,
            room TEXT NOT NULL,
            section TEXT NOT NULL,
            subject TEXT NOT NULL,
            teacher TEXT NOT NULL,
            college_id INTEGER NOT NULL,
            UNIQUE(college_id, day, period, room)
        )
    """)

    conn.execute("""
        INSERT INTO timetable (
            id, day, period, room, section,
            subject, teacher, college_id
        )
        SELECT id, day, period, room, section,
               subject, teacher, ?
        FROM timetable_legacy
    """, (int(default_college_id),))
    conn.execute("DROP TABLE timetable_legacy")


# =========================================================
# INITIALIZATION
# =========================================================

def _default_college_id(conn):
    row = conn.execute("""
        SELECT id FROM colleges WHERE code = 'PIET'
    """).fetchone()
    return int(row["id"]) if row else 1


def init_db():
    init_colleges_table()
    with database_connection() as conn:
        _migrate_room_updates(conn, _default_college_id(conn))



def init_users_table():
    """
    Ensure the users table exists and optionally bootstrap the PIET admin.
    Existing users and passwords are never deleted or overwritten.
    """
    init_colleges_table()

    with database_connection() as conn:
        college_rows = conn.execute(
            "SELECT id, code FROM colleges"
        ).fetchall()

        for college in college_rows:
            if college["code"] != "PIET":
                continue

            # Fresh deployments can create the initial PIET admin through
            # environment variables. Existing PIET accounts remain untouched.
            admin_username = (os.environ.get("INITIAL_ADMIN_USERNAME") or "").strip()
            admin_password = os.environ.get("INITIAL_ADMIN_PASSWORD") or ""

            if not admin_username or not admin_password:
                continue

            exists = conn.execute(
                "SELECT id FROM users WHERE username = ? AND college_id = ?",
                (admin_username, college["id"]),
            ).fetchone()

            if not exists:
                conn.execute(
                    """
                    INSERT INTO users (username, password, role, college_id)
                    VALUES (?, ?, 'admin', ?)
                    """,
                    (
                        admin_username,
                        generate_password_hash(admin_password),
                        college["id"],
                    ),
                )


def init_timetable_table():
    init_colleges_table()
    with database_connection() as conn:
        _migrate_timetable(conn, _default_college_id(conn))


def init_multi_college_schema():
    init_timetable_periods_table()
    init_colleges_table()
    init_college_settings_table()
    init_db()
    init_users_table()
    init_timetable_table()

    with database_connection() as conn:
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_updates_college
            ON room_updates (college_id)
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_college
            ON users (college_id)
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_timetable_college
            ON timetable (college_id)
        """)
        conn.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_college
            ON users (username, college_id)
        """)
        # =========================================================
# ROOM UPDATES
# =========================================================

def get_all_updates(college_id=1):
    with database_connection() as conn:
        rows = conn.execute("""
            SELECT id, room, day, period, update_type,
                   person, college_id, created_at
            FROM room_updates
            WHERE college_id = ?
            ORDER BY day, period, room
        """, (int(college_id),)).fetchall()
        return [dict(row) for row in rows]


def save_update(
    room, day, period, update_type, person=None, college_id=1
):
    room = (room or "").strip()
    update_type = (update_type or "").strip()

    if not room:
        raise ValueError("Room is required.")

    if not update_type:
        raise ValueError("Update type is required.")

    with database_connection() as conn:
        conn.execute("""
            INSERT INTO room_updates (
                room, day, period, update_type, person, college_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(college_id, room, day, period)
            DO UPDATE SET
                update_type = excluded.update_type,
                person = excluded.person,
                created_at = CURRENT_TIMESTAMP
        """, (
            room, int(day), int(period), update_type,
            person, int(college_id)
        ))

    return True


def delete_update(room, day, period, college_id=1):
    with database_connection() as conn:
        cursor = conn.execute("""
            DELETE FROM room_updates
            WHERE room = ? AND day = ? AND period = ?
              AND college_id = ?
        """, (room, int(day), int(period), int(college_id)))
        return cursor.rowcount > 0


# =========================================================
# USERS AND AUTHENTICATION
# =========================================================

def _password_matches(stored_password, supplied_password):
    if not stored_password:
        return False

    if stored_password.startswith(("scrypt:", "pbkdf2:")):
        try:
            return check_password_hash(stored_password, supplied_password)
        except (ValueError, TypeError):
            return False

    # Support old plaintext passwords until the user logs in successfully.
    return stored_password == supplied_password


def get_user(username, password, college_id=None):
    username = (username or "").strip()

    if not username or password is None:
        return None

    with database_connection() as conn:
        if college_id is None:
            rows = conn.execute("""
                SELECT id, username, password, role, college_id, created_at
                FROM users
                WHERE username = ?
                ORDER BY college_id
            """, (username,)).fetchall()
        else:
            rows = conn.execute("""
                SELECT id, username, password, role, college_id, created_at
                FROM users
                WHERE username = ? AND college_id = ?
                LIMIT 1
            """, (username, int(college_id))).fetchall()

        if college_id is None and len(rows) > 1:
            matches = [
                row for row in rows
                if _password_matches(row["password"], password)
            ]

            if len(matches) != 1:
                return None

            row = matches[0]
        else:
            if not rows or not _password_matches(
                rows[0]["password"], password
            ):
                return None

            row = rows[0]

        stored_password = row["password"]

        # Upgrade legacy plaintext passwords after successful authentication.
        if not stored_password.startswith(("scrypt:", "pbkdf2:")):
            conn.execute("""
                UPDATE users SET password = ? WHERE id = ?
            """, (generate_password_hash(password), row["id"]))

        user = dict(row)
        user["password"] = None
        return user


def get_all_users(college_id=1):
    with database_connection() as conn:
        rows = conn.execute("""
            SELECT id, username, role, college_id, created_at
            FROM users
            WHERE college_id = ?
            ORDER BY id
        """, (int(college_id),)).fetchall()
        return [dict(row) for row in rows]


def create_user(username, password, role, college_id=1):
    username = (username or "").strip()
    password = password or ""
    role = (role or "student").strip().lower()
    college_id = int(college_id)

    if not username or not password:
        raise ValueError("Username and password are required.")

    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters.")

    if role not in ("student", "teacher", "admin"):
        raise ValueError("Invalid user role.")

    with database_connection() as conn:
        existing = conn.execute("""
            SELECT id FROM users
            WHERE username = ? AND college_id = ?
        """, (username, college_id)).fetchone()

        if existing:
            raise ValueError(
                "That username already exists in this college. "
                "Please choose another."
            )

        cursor = conn.execute("""
            INSERT INTO users (username, password, role, college_id)
            VALUES (?, ?, ?, ?)
        """, (
            username,
            generate_password_hash(password),
            role,
            college_id
        ))

        return cursor.lastrowid


def delete_user(user_id, college_id=1):
    with database_connection() as conn:
        admin = conn.execute("""
            SELECT id FROM users
            WHERE id = ? AND college_id = ?
              AND role = 'admin' AND username = 'admin'
        """, (int(user_id), int(college_id))).fetchone()

        if admin and int(college_id) == _default_college_id(conn):
            raise ValueError("The default admin account cannot be deleted.")

        cursor = conn.execute("""
            DELETE FROM users
            WHERE id = ? AND college_id = ?
        """, (int(user_id), int(college_id)))

        return cursor.rowcount > 0
        # =========================================================
# TIMETABLE MANAGEMENT
# =========================================================

def get_all_timetable(college_id=1):
    with database_connection() as conn:
        rows = conn.execute("""
            SELECT id, day, period, room, section,
                   subject, teacher, college_id
            FROM timetable
            WHERE college_id = ?
            ORDER BY day, period, room
        """, (int(college_id),)).fetchall()
        return [dict(row) for row in rows]


def save_timetable_entry(
    day, period, room, section, subject, teacher, college_id=1
):
    room = (room or "").strip()
    section = (section or "").strip()
    subject = (subject or "").strip()
    teacher = (teacher or "").strip()

    day = int(day)
    period = int(period)
    college_id = int(college_id)

    if not room or not section or not subject or not teacher:
        raise ValueError(
            "Room, section, subject and teacher are required."
        )

    if not 0 <= day <= 5:
        raise ValueError("Day must be between 0 and 5.")

    if not 0 <= period <= 7:
        raise ValueError("Period must be between 0 and 7.")

    with database_connection() as conn:
        conn.execute("""
            INSERT INTO timetable (
                day, period, room, section, subject, teacher, college_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(college_id, day, period, room)
            DO UPDATE SET
                section = excluded.section,
                subject = excluded.subject,
                teacher = excluded.teacher
        """, (
            day, period, room, section, subject, teacher, college_id
        ))

        row = conn.execute("""
            SELECT id FROM timetable
            WHERE college_id = ? AND day = ? AND period = ? AND room = ?
        """, (college_id, day, period, room)).fetchone()

        return row["id"] if row else None


def delete_timetable_entry(entry_id, college_id=1):
    with database_connection() as conn:
        cursor = conn.execute("""
            DELETE FROM timetable
            WHERE id = ? AND college_id = ?
        """, (int(entry_id), int(college_id)))
        return cursor.rowcount > 0


# =========================================================
# COLLEGE REGISTRATION
# =========================================================

def register_college(name, code, username, password):
    name = (name or "").strip()
    code = (code or "").strip().upper()
    username = (username or "").strip()
    password = password or ""

    if not name or not code or not username or not password:
        raise ValueError("All registration fields are required.")

    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters.")

    if not re.fullmatch(r"[A-Z0-9_-]{2,20}", code):
        raise ValueError(
            "College code must contain 2–20 letters, numbers, "
            "hyphens or underscores."
        )

    with database_connection() as conn:
        existing = conn.execute("""
            SELECT id FROM colleges
            WHERE name = ? OR code = ?
        """, (name, code)).fetchone()

        if existing:
            raise ValueError(
                "A college with this name or code already exists."
            )

        cursor = conn.execute("""
            INSERT INTO colleges (name, code)
            VALUES (?, ?)
        """, (name, code))

        college_id = cursor.lastrowid

        # Create the college administrator.
        conn.execute("""
            INSERT INTO users (username, password, role, college_id)
            VALUES (?, ?, 'admin', ?)
        """, (
            username,
            generate_password_hash(password),
            college_id
        ))

        return {
            "college_id": college_id,
            "college_name": name,
            "college_code": code,
            "admin_username": username
        }


# =========================================================
# CUSTOMIZABLE TIMETABLE PERIODS
# =========================================================

DEFAULT_PERIODS = [
    ("09:05", "10:00"),
    ("10:00", "10:55"),
    ("10:55", "11:50"),
    ("11:50", "12:45"),
    ("12:45", "13:40"),
    ("13:40", "14:35"),
    ("14:35", "15:30"),
    ("15:30", "16:25"),
]


def init_timetable_periods_table():
    """
    Add customizable period timings without changing existing data.
    An empty section means college-wide default timings.
    A named section means section-specific timings.
    """
    init_colleges_table()

    with database_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS timetable_periods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                college_id INTEGER NOT NULL,
                section TEXT NOT NULL DEFAULT '',
                period_index INTEGER NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                UNIQUE(college_id, section, period_index)
        )
        """)

        colleges = conn.execute(
            "SELECT id FROM colleges"
        ).fetchall()

        # Seed default timings only where a college has none.
        for college in colleges:
            college_id = int(college["id"])

            existing = conn.execute("""
                SELECT COUNT(*) AS total
                FROM timetable_periods
                WHERE college_id = ? AND section = ''
            """, (college_id,)).fetchone()["total"]

            if existing == 0:
                conn.executemany("""
                    INSERT OR IGNORE INTO timetable_periods (
                        college_id, section, period_index,
                        start_time, end_time
                    )
                    VALUES (?, '', ?, ?, ?)
                """, [
                    (college_id, index, start, end)
                    for index, (start, end)
                    in enumerate(DEFAULT_PERIODS)
                ])


def get_timetable_periods(college_id=1, section=None):
    """
    Return section-specific timings when configured;
    otherwise return the college-wide defaults.
    """
    college_id = int(college_id)
    section = (section or "").strip()

    with database_connection() as conn:
        if section:
            rows = conn.execute("""
                SELECT period_index, start_time, end_time
                FROM timetable_periods
                WHERE college_id = ? AND section = ?
                ORDER BY period_index
            """, (college_id, section)).fetchall()

            if rows:
                return [dict(row) for row in rows]

        rows = conn.execute("""
            SELECT period_index, start_time, end_time
            FROM timetable_periods
            WHERE college_id = ? AND section = ''
            ORDER BY period_index
        """, (college_id,)).fetchall()

        return [dict(row) for row in rows]


def save_timetable_periods(college_id=1, section="", periods=None):
    """Replace timings for a college or a specific section."""
    college_id = int(college_id)
    section = (section or "").strip()
    periods = periods or []

    if not periods:
        raise ValueError("Add at least one period.")

    normalized = []

    for index, period in enumerate(periods):
        start = (period.get("start_time") or "").strip()
        end = (period.get("end_time") or "").strip()

        try:
            if (
                len(start) != 5
                or len(end) != 5
                or start[2] != ":"
                or end[2] != ":"
                or not start[:2].isdigit()
                or not start[3:].isdigit()
                or not end[:2].isdigit()
                or not end[3:].isdigit()
            ):
                raise ValueError

            start_minutes = int(start[:2]) * 60 + int(start[3:])
            end_minutes = int(end[:2]) * 60 + int(end[3:])

            if not (
                0 <= start_minutes < 1440
                and 0 <= end_minutes < 1440
                and end_minutes > start_minutes
            ):
                raise ValueError

        except (ValueError, TypeError):
            raise ValueError(
                f"Invalid start or end time for period {index + 1}."
            )

        if normalized and start_minutes < normalized[-1][3]:
            raise ValueError(
                "Periods must be in chronological order and must not overlap."
            )

        normalized.append((index, start, end, end_minutes))

    with database_connection() as conn:
        conn.execute("""
            DELETE FROM timetable_periods
            WHERE college_id = ? AND section = ?
        """, (college_id, section))

        conn.executemany("""
            INSERT INTO timetable_periods (
                college_id, section, period_index,
                start_time, end_time
            )
            VALUES (?, ?, ?, ?, ?)
        """, [
            (college_id, section, index, start, end)
            for index, start, end, _ in normalized
        ])

    return get_timetable_periods(college_id, section or None)


def repair_piet_default_periods():
    """Restore missing PIET default periods without overwriting existing ones."""
    defaults = [
        ("09:05", "10:00"),
        ("10:00", "10:55"),
        ("10:55", "11:50"),
        ("11:50", "12:45"),
        ("12:45", "13:40"),
        ("13:40", "14:35"),
        ("14:35", "15:30"),
        ("15:30", "16:25"),
    ]

    with database_connection() as conn:
        piet = conn.execute(
            "SELECT id FROM colleges WHERE code = 'PIET'"
        ).fetchone()

        if not piet:
            raise ValueError("PIET college was not found.")

        college_id = piet["id"]

        for index, (start, end) in enumerate(defaults):
            conn.execute("""
                INSERT OR IGNORE INTO timetable_periods
                    (college_id, section, period_index, start_time, end_time)
                VALUES (?, '', ?, ?, ?)
            """, (college_id, index, start, end))

    return get_timetable_periods(college_id, None)

# =========================================================
# RUN THIS FILE DIRECTLY
# =========================================================


if __name__ == "__main__":
    init_multi_college_schema()
    print("Database initialized successfully.")
