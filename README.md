# Smart Room Finder

Smart Room Finder is a web-based application built with Flask that helps students and teachers identify room availability within a college.

## Features

- **Room Availability:** View room availability and room status updates.
- **Role-Based Access:** Separate access for students, teachers, and administrators.
- **Room Status Updates:** Authorized teachers and administrators can mark rooms as occupied or available.
- **Timetable Management:** Manage timetable entries and period timings.
- **User Management:** Administrators can create, view, and delete user accounts.
- **College Management:** Supports college-specific data and settings.
- **Persistent Storage:** Uses SQLite for storing application data.

## Technologies Used

- Python
- Flask
- SQLite
- HTML
- CSS
- JavaScript

## Project Structure

```text
Room-Finder/
├── app.py
├── database.py
├── requirements.txt
├── README.md
├── static/
│   ├── css/
│   └── js/
└── templates/
    └── index.html
```

## Installation and Setup

1. Install Python.
2. Clone the repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   ```

3. Navigate to the project directory:

   ```bash
   cd Room-Finder
   ```

4. Create a virtual environment:

   ```bash
   python -m venv .venv
   ```

5. Activate it on Windows:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

6. Install the dependencies:

   ```bash
   pip install -r requirements.txt
   ```

7. Configure the `FLASK_SECRET_KEY` environment variable before deployment.

8. Start the application:

   ```bash
   python app.py
   ```

9. Open the local address shown in the terminal in your browser.

## Database

The application uses SQLite. The database is initialized by the application, and database files should not be committed to the public repository.

## Security

- Keep secret keys and credentials out of source control.
- Use appropriate permissions for each user role.
- Configure secure cookies and persistent database storage for production deployment.

## License

Choose an appropriate open-source license before redistributing this project.
