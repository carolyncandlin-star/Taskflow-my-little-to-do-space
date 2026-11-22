# TaskFlow – My Little To-Do Space 🌸

TaskFlow is a simple, responsive to-do list application designed to help users organize everyday tasks in a friendly workspace. Users can add tasks, describe them, assign categories and priorities, set due dates, mark important tasks, and track their progress.

## ✨ Features

- Add, view, edit, and manage tasks.
- Mark tasks as completed or keep them pending.
- Filter tasks by All, Pending, and Done.
- Organize tasks using categories and priorities.
- Set due dates and mark important tasks.
- View dashboard statistics and task progress.
- Explore additional sections such as Calendar, Diary, Memory Garden, and Sticker Studio.
- Responsive interface for desktop and mobile screens.
- Store tasks in MongoDB so they can be retrieved after refreshing the application.

## 🛠️ Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **API Integration:** HTTP requests between frontend and backend
- **Development Tool:** Visual Studio Code

## 📂 Project Structure

```text
TaskFlow-To-Do-List/
│
├── backend/
│   └── Server-side code and API routes
│
├── frontend/
│   └── User interface files
│
├── screenshots/
│   └── Application screenshots
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 📋 Requirements

Before running the application, make sure you have:

- Node.js installed
- npm installed
- MongoDB running locally or an available MongoDB connection URI
- A modern web browser

## 🚀 Setup and Run

### 1. Clone the Repository

```bash
git clone https://github.com/carolyncandlin-star/Taskflow-my-little-to-do-space.git
```

### 2. Navigate to the Project Folder

```bash
cd Taskflow-my-little-to-do-space
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and add your own configuration:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

Replace the placeholder with your actual MongoDB connection string.

**Important:** Never upload your actual `.env` file, database password, or private credentials to GitHub.

### 5. Start the Application

```bash
npm start
```

When the terminal confirms that MongoDB is connected and the server is running, open your browser and visit:

`http://localhost:5000`

Follow the actual commands and environment variable names defined in the project configuration if they differ from these examples.

## 🔗 API Integration Verification

The frontend communicates with the backend through HTTP API requests.

To verify the integration:

1. Open TaskFlow in your browser.
2. Open Developer Tools.
3. Select the Network tab.
4. Choose Fetch/XHR.
5. Add a new task or refresh the task list.
6. Check the task-related API requests and their HTTP status codes.

Successful requests may include:
- **200 OK:** Successful request.
- **201 Created:** Successful resource creation.

## 💾 Database Persistence Verification

TaskFlow uses MongoDB to store task information.

To verify database persistence:

1. Add a uniquely named test task.
2. Confirm that it appears in the task list.
3. Refresh the browser.
4. Check whether the same task is still displayed.
5. For additional verification, inspect the saved task document in MongoDB.

This helps verify that task information is saved and retrieved rather than being displayed only temporarily.

## 📱 Responsive Design Verification

TaskFlow is designed to support desktop and mobile screen sizes.

The responsive interface can be checked using the browser's Developer Tools device toolbar.

Check that:
- Task lists and forms fit the screen.
- Text and buttons remain readable.
- Navigation and task actions are accessible.
- The page does not overflow horizontally.

## 📸 Screenshots

The `screenshots/` folder contains visual evidence of the application's features and functionality, including:

- Main Dashboard
- All Tasks
- Pending Tasks
- Completed Tasks
- Add Task Form
- Mobile Responsive View
- API Integration
- Database Connection
- Database Persistence
- Dark Theme
- My Calendar
- My Diary
- Memory Garden
- Sticker Studio

## 📌 Project Status

TaskFlow – My Little To-Do Space has been developed as a full-stack task management web application.

The project includes task creation, editing, completion, priority management, category filtering, due-date tracking, and progress monitoring.

Frontend and backend integration has been verified through successful API requests. MongoDB connectivity and database persistence have also been tested to ensure that tasks remain available after refreshing the application.

The application features a responsive interface for desktop and mobile screen sizes, along with additional sections such as My Calendar, My Diary, Memory Garden, and Sticker Studio.

Screenshots demonstrating the application's functionality, API integration, database connection, and responsive design are included in the `screenshots/` folder.

**Project Status: Completed and Tested.**

---

## 👩‍💻 Developed By

**Carolyn Gurindapalli**

**TaskFlow – My Little To-Do Space**

*Small steps count too. 🌸*