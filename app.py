import os
import secrets

from flask import Flask, render_template, jsonify, request, session

from database import (
    init_multi_college_schema,
    get_all_updates,
    save_update,
    delete_update,
    get_user,
    get_all_users,
    create_user,
    delete_user,
    get_all_timetable,
    save_timetable_entry,
    delete_timetable_entry,
    get_all_colleges,
    get_college_by_id,
    get_college_by_code,
    register_college,
    get_timetable_periods,
save_timetable_periods,
get_college_settings,
save_college_settings,
)


# =========================================================
# APP CONFIGURATION
# =========================================================

app = Flask(__name__)

app.config["SECRET_KEY"] = (
    os.environ.get("FLASK_SECRET_KEY")
    or secrets.token_hex(32)
)

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = (
    os.environ.get("COOKIE_SECURE", "0") == "1"
)

# Initialize the existing database and migrations.
init_multi_college_schema()


# =========================================================
# HELPERS
# =========================================================

def has_role(*allowed_roles):
    return (
        "user_id" in session
        and session.get("role") in allowed_roles
        and session.get("college_id") is not None
    )


def current_college_id():
    return session.get("college_id")


def login_required():
    return (
        "user_id" in session
        and session.get("college_id") is not None
    )


def error_response(message, status=400):
    return jsonify({
        "success": False,
        "message": message,
    }), status


def public_user(user):
    """Return safe user information without a password."""
    return {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "college_id": user["college_id"],
    }


# =========================================================
# MAIN PAGE
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# PUBLIC COLLEGE LIST
# =========================================================

@app.route("/api/colleges", methods=["GET"])
def api_colleges():
    colleges = get_all_colleges()

    return jsonify({
        "success": True,
        "colleges": [
            {
                "id": college["id"],
                "name": college["name"],
                "code": college["code"],
            }
            for college in colleges
        ],
    })


# =========================================================
# REGISTER A NEW COLLEGE
# =========================================================

@app.route("/register-college", methods=["POST"])
def register_new_college():
    data = request.get_json(silent=True) or {}

    name = (data.get("college_name") or "").strip()
    code = (data.get("college_code") or "").strip().upper()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not all([name, code, username, password]):
        return error_response(
            "College name, college code, username and password are required."
        )

    try:
        result = register_college(
            name=name,
            code=code,
            username=username,
            password=password,
        )

        return jsonify({
            "success": True,
            "message": (
                "College registered successfully. You can now log in."
            ),
            "college": {
                "id": result["college_id"],
                "name": result["college_name"],
                "code": result["college_code"],
            },
            "username": result["admin_username"],
        }), 201

    except ValueError as error:
        return error_response(str(error), 409)

    except Exception:
        app.logger.exception("College registration failed")
        return error_response(
            "Could not register the college. Please try again.",
            500,
        )


# =========================================================
# LOGIN
# =========================================================

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    college_code = (
        data.get("college_code") or "PIET"
    ).strip().upper()

    if not username or not password:
        return error_response(
            "Username and password are required."
        )

    college = get_college_by_code(college_code)

    if not college:
        return error_response(
            "College not found. Check your college code.",
            401,
        )

    user = get_user(
        username,
        password,
        college_id=college["id"],
    )

    if not user:
        return error_response(
            "Invalid username, password or college code.",
            401,
        )

    # Clear any previous session before creating a new one.
    session.clear()

    session["user_id"] = user["id"]
    session["username"] = user["username"]
    session["role"] = user["role"]
    session["college_id"] = user["college_id"]

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "user": public_user(user),
        "college": {
            "id": college["id"],
            "name": college["name"],
            "code": college["code"],
        },
    })


# =========================================================
# LOGOUT
# =========================================================

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully.",
    })


# =========================================================
# CURRENT USER
# =========================================================

@app.route("/api/me", methods=["GET"])
def current_user():
    if not login_required():
        return jsonify({"logged_in": False}), 200

    college = get_college_by_id(current_college_id())

    if not college:
        session.clear()
        return jsonify({"logged_in": False}), 200

    return jsonify({
        "logged_in": True,
        "user": {
            "id": session["user_id"],
            "username": session["username"],
            "role": session["role"],
            "college_id": current_college_id(),
        },
        "college": college,
    })


# =========================================================
# GET ROOM UPDATES
# =========================================================

@app.route("/api/updates", methods=["GET"])
def api_get_updates():
    if not login_required():
        return error_response("Please log in first.", 401)

    updates = get_all_updates(
        college_id=current_college_id()
    )

    return jsonify({
        "success": True,
        "updates": updates,
    })


# =========================================================
# CREATE OR UPDATE ROOM OCCUPANCY
# =========================================================

@app.route("/api/updates", methods=["POST"])
def api_save_update():
    if not has_role("admin","teacher"):
        return error_response(
            "Admin access is required to change room availability.",
            403,
        )


    data = request.get_json(silent=True) or {}
    required = ["room", "day", "period", "update_type"]

    for field in required:
        if field not in data:
            return error_response(f"Missing field: {field}")

    try:
        save_update(
            room=data["room"],
            day=int(data["day"]),
            period=int(data["period"]),
            update_type=data["update_type"],
            person=data.get("person", session["username"]),
            college_id=current_college_id(),
        )

        return jsonify({
            "success": True,
            "message": "Room update saved.",
        })

    except (ValueError, TypeError):
        return error_response(
            "Invalid day, period or room update."
        )

    except Exception:
        app.logger.exception("Room update failed")
        return error_response(
            "Could not save room update.",
            500,
        )


# =========================================================
# DELETE ROOM UPDATE
# =========================================================

@app.route("/api/updates", methods=["DELETE"])
def api_delete_update(): 
    if not has_role("admin","teacher"):
        return error_response(
            "Admin access is required to change room availability.",
            403,
        )

    data = request.get_json(silent=True) or {}

    if not all(
        field in data
        for field in ("room", "day", "period")
    ):
        return error_response(
            "Room, day and period are required."
        )

    try:
        deleted = delete_update(
            room=data["room"],
            day=int(data["day"]),
            period=int(data["period"]),
            college_id=current_college_id(),
        )

        if not deleted:
            return error_response(
                "Room update not found.",
                404,
            )

        return jsonify({
            "success": True,
            "message": "Room update deleted.",
        })

    except (ValueError, TypeError):
        return error_response(
            "Invalid room, day or period."
        )

    except Exception:
        app.logger.exception("Deleting room update failed")
        return error_response(
            "Could not delete room update.",
            500,
        )


# =========================================================
# ADMIN - GET USERS
# =========================================================

@app.route("/api/admin/users", methods=["GET"])
def admin_get_users():
    if not has_role("admin"):
        return error_response(
            "Admin access required.",
            403,
        )

    users = get_all_users(
        college_id=current_college_id()
    )

    return jsonify({
        "success": True,
        "users": [
            {
                "id": user["id"],
                "username": user["username"],
                "role": user["role"],
                "college_id": user["college_id"],
            }
            for user in users
        ],
    })


# =========================================================
# ADMIN - CREATE USER
# =========================================================

@app.route("/api/admin/users", methods=["POST"])
def admin_create_user():
    if not has_role("admin"):
        return error_response(
            "Admin access required.",
            403,
        )

    data = request.get_json(silent=True) or {}

    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    role = (data.get("role") or "student").strip().lower()

    if not username or not password:
        return error_response(
            "Username and password are required."
        )

    if role not in ("student", "teacher", "admin"):
        return error_response("Invalid user role.")

    try:
        create_user(
            username=username,
            password=password,
            role=role,
            college_id=current_college_id(),
        )

        return jsonify({
            "success": True,
            "message": "User created successfully.",
        }), 201

    except ValueError as error:
        return error_response(str(error), 409)

    except Exception:
        app.logger.exception("Creating user failed")
        return error_response(
            "Could not create user.",
            500,
        )


# =========================================================
# ADMIN - DELETE USER
# =========================================================

@app.route(
    "/api/admin/users/<int:user_id>",
    methods=["DELETE"],
)
def admin_delete_user(user_id):
    if not has_role("admin"):
        return error_response(
            "Admin access required.",
            403,
        )

    if session.get("user_id") == user_id:
        return error_response(
            "You cannot delete your own account."
        )

    try:
        deleted = delete_user(
            user_id,
            college_id=current_college_id(),
        )

        if not deleted:
            return error_response(
                "User not found in your college.",
                404,
            )

        return jsonify({
            "success": True,
            "message": "User deleted successfully.",
        })

    except ValueError as error:
        return error_response(str(error), 400)

    except Exception:
        app.logger.exception("Deleting user failed")
        return error_response(
            "Could not delete user.",
            500,
        )


# =========================================================
# TIMETABLE - CURRENT COLLEGE
# Available to logged-in students, teachers and admins
# =========================================================

@app.route("/api/timetable", methods=["GET"])
def api_get_college_timetable():
    if not login_required():
        return error_response("Please log in first.", 401)

    timetable = get_all_timetable(
        college_id=current_college_id()
    )

    return jsonify({
        "success": True,
        "timetable": timetable,
    })


# =========================================================
# ADMIN - GET TIMETABLE
# =========================================================

@app.route("/api/admin/timetable", methods=["GET"])
def admin_get_timetable():
    if not has_role("admin"):
        return error_response(
            "Admin access required.",
            403,
        )

    timetable = get_all_timetable(
        college_id=current_college_id()
    )

    return jsonify({
        "success": True,
        "timetable": timetable,
    })

# =========================================================
# TIMETABLE PERIOD SETTINGS
# =========================================================

@app.route("/api/timetable/periods", methods=["GET"])
def api_get_timetable_periods():
    if not login_required():
        return error_response("Please log in first.", 401)

    section = (request.args.get("section") or "").strip()

    periods = get_timetable_periods(
        college_id=current_college_id(),
        section=section or None
    )

    return jsonify({
        "success": True,
        "periods": periods
    })


@app.route("/api/admin/timetable/periods", methods=["POST"])
def api_save_timetable_periods():
    if not has_role("admin"):
        return error_response("Admin access required.", 403)

    data = request.get_json(silent=True) or {}
    section = (data.get("section") or "").strip()
    periods = data.get("periods")

    if not isinstance(periods, list):
        return error_response("Periods must be provided as a list.")

    try:
        saved = save_timetable_periods(
            college_id=current_college_id(),
            section=section,
            periods=periods
        )

        return jsonify({
            "success": True,
            "message": "Timetable settings saved.",
            "periods": saved
        })

    except ValueError as error:
        return error_response(str(error))
    except Exception:
        app.logger.exception("Saving period settings failed")
        return error_response("Could not save timetable settings.", 500)
# =========================================================
# ADMIN - SAVE TIMETABLE
# =========================================================

@app.route("/api/admin/timetable", methods=["POST"])
def admin_save_timetable():
    if not has_role("admin"):
        return error_response(
            "Admin access required.",
            403,
        )

    data = request.get_json(silent=True) or {}

    required = [
        "day",
        "period",
        "room",
        "section",
        "subject",
        "teacher",
    ]

    for field in required:
        if field not in data:
            return error_response(f"Missing field: {field}")

    try:
        day = int(data["day"])
        period = int(data["period"])

        if not 0 <= day <= 5:
            raise ValueError("Day must be between 0 and 5.")

        if not 0 <= period <= 7:
            raise ValueError("Period must be between 0 and 7.")

        save_timetable_entry(
            day=day,
            period=period,
            room=data["room"],
            section=data["section"],
            subject=data["subject"],
            teacher=data["teacher"],
            college_id=current_college_id(),
        )

        return jsonify({
            "success": True,
            "message": "Timetable entry saved.",
        })

    except (ValueError, TypeError):
        return error_response(
            "Please check the timetable fields."
        )

    except Exception:
        app.logger.exception("Saving timetable failed")
        return error_response(
            "Could not save timetable entry.",
            500,
        )


# =========================================================
# ADMIN - DELETE TIMETABLE ENTRY
# =========================================================

@app.route(
    "/api/admin/timetable/<int:entry_id>",
    methods=["DELETE"],
)
def admin_delete_timetable(entry_id):
    if not has_role("admin"):
        return error_response(
            "Admin access required.",
            403,
        )

    try:
        deleted = delete_timetable_entry(
            entry_id,
            college_id=current_college_id(),
        )

        if not deleted:
            return error_response(
                "Timetable entry not found in your college.",
                404,
            )

        return jsonify({
            "success": True,
            "message": "Timetable entry deleted.",
        })

    except Exception:
        app.logger.exception("Deleting timetable failed")
        return error_response(
            "Could not delete timetable entry.",
            500,
        )



@app.route("/api/college-settings", methods=["GET"])
def college_settings():
    if not login_required():
        return jsonify({"success": False, "message": "Please log in."}), 401

    settings = get_college_settings(current_college_id())

    if not settings:
        return jsonify({
            "success": False,
            "message": "College settings not found."
        }), 404

    return jsonify({"success": True, "settings": settings})


@app.route("/api/admin/college-settings", methods=["POST"])
def update_college_settings():
    if not has_role("admin"):
        return jsonify({
            "success": False,
            "message": "Admin access required."
        }), 403

    data = request.get_json(silent=True) or {}

    try:
        settings = save_college_settings(
            current_college_id(),
            data.get("department", ""),
            data.get("semester", ""),
            data.get("academic_year", "")
        )
    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    return jsonify({
        "success": True,
        "message": "College settings saved successfully.",
        "settings": settings
    })

# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":
    app.run(debug=False)
