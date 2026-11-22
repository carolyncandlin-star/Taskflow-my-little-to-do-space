## TaskFlow -- My Little To-Do Space

TaskFlow is a simple, responsive to-do list application designed to help
users organize everyday tasks in a friendly workspace. Users can add
tasks, describe them, assign categories and priorities, set due dates,
mark important tasks, and track their progress.

# Features
- Add, view, edit, and manage tasks.
- Mark tasks as completed or keep them pending.
- Filter tasks by All, Pending, and Done.
- Organize tasks using categories and priorities.
- Set due dates and mark important tasks.
- View dashboard statistics and task progress.
- Explore additional sections such as calendar, diary, memory garden,
  and sticker studio.
- Use a responsive interface designed for desktop and mobile screens.
- Store tasks in MongoDB so they can be retrieved after refreshing the
  application.

# Technology
- Frontend: HTML, CSS, and JavaScript
- Backend: Node.js and Express
- Database: MongoDB
- Integration: HTTP API requests between the frontend and backend
Check package.json and the source files for exact package versions and
any additional libraries.

# Project Structure
TaskFlow-To-Do-List/
├── backend/             # Server-side code and API routes
├── frontend/            # User interface files
├── screenshots/         # Application screenshots
├── .env                 # Local environment configuration (keep private)
├── .env.example         # Example environment configuration
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
The exact files inside backend and frontend may vary.

# Requirements
- Node.js and npm
- MongoDB running locally or a MongoDB connection URI
- A modern web browser
Setup and Run
1. Open the project folder in a terminal.
2. Install dependencies:
   npm install
3. Create a .env file in the project root and add your own
   configuration:
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   Replace the placeholder with your real MongoDB URI. Never publish
   passwords or secrets.
4. Start the application:
   npm start
5. When the terminal confirms that MongoDB is connected and the server
   is running, open:
   http://localhost:5000
If your package.json or backend code uses a different start command or
environment variable name, follow the project's actual configuration.

# API Integration Verification
1. Open TaskFlow in your browser.
2. Open Developer Tools and select the Network tab.
3. Select Fetch/XHR.
4. Add a test task or refresh the task list.
5. Check that task-related requests appear and return successful HTTP
   status codes (for example, 200 for a successful read or 201 for a
   successful creation, depending on the implementation).

# Database Persistence Verification
1. Add a uniquely named test task.
2. Confirm that it appears in TaskFlow.
3. Refresh the browser page, or close and reopen the application.
4. Confirm that the task is still displayed.
5. For stronger verification, inspect the saved task document in
   MongoDB.
                    
 A successful MongoDB connection message confirms that the server can
reach the database. The refresh test provides evidence that task data is
being saved and retrieved.
Responsive Design Verification
Use the browser Developer Tools device toolbar to preview the
application at mobile dimensions. Check that:
- Task lists and forms fit the screen.
- Text and buttons remain readable and usable.
- Navigation and task actions are accessible.
- The page does not overflow horizontally.
Capture a desktop view as well, and test on an actual phone when
possible.

# Screenshots
The screenshots/ folder can contain evidence of:
- Main dashboard
- All tasks, pending tasks, and completed tasks
- Add-task form
- Calendar and other workspace sections
- Mobile layout
- API integration in the Network tab
- MongoDB connection and database persistence verification

# Project Status

TaskFlow – My Little To-Do Space has been successfully developed and tested as a full-stack task management web application.

The project includes task creation, editing, completion, priority management, category filtering, due-date tracking, and progress monitoring. Frontend and backend integration has been verified through successful API requests. MongoDB connectivity and data persistence have also been tested to ensure tasks remain saved after refreshing the application.

The application features a responsive interface for desktop and mobile screen sizes, along with additional sections such as My Calendar, My Diary, Memory Garden, and Sticker Studio.

Screenshots demonstrating the application's functionality, API integration, database connection, and responsive design are included in the `screenshots/` folder.

**Project Status: Completed and Tested.**

**TaskFlow -- My Little To-Do Space**
----Small steps count too.----


## developed by
Carolyn Gurindapalli