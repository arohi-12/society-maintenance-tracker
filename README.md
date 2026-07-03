# Society Maintenance Tracker

A modern full-stack web application designed for apartment societies to streamline maintenance complaint workflows and manage community communications. Residents can report issues, upload photos, and monitor detailed resolution timelines. Administrators can prioritize complaints, transition statuses, track overdue tickets, and publish important announcements to a pinned notice board.

---

## Repository Structure

```text
├── backend/                  # Node.js + Express API Backend
│   ├── config/               # Database connection settings
│   ├── controllers/          # Request-response routers controllers
│   ├── middleware/           # JWT and Role verification middleware
│   ├── models/               # Mongoose schema definitions
│   ├── routes/               # API route definitions
│   ├── services/             # Email services (Nodemailer)
│   ├── uploads/              # Local storage folder for complaint images
│   ├── app.js                # Express app setup
│   ├── server.js             # HTTP Server entry, DB connection & seeding
│   ├── .env.example          # Environment variables template
│   └── package.json          # Backend dependencies
│
├── frontend/                 # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/       # Shared UI buttons & inputs
│   │   ├── context/          # Auth state provider
│   │   ├── layouts/          # Responsive Sidebar layout
│   │   ├── pages/            # Resident & Admin view screens
│   │   ├── services/         # Axios client and route endpoints
│   │   ├── App.jsx           # App routes & role protections
│   │   ├── index.css         # CSS entry & custom scrollbars
│   │   └── main.jsx          # Entry point
│   ├── index.html            # Main HTML document
│   ├── vite.config.js        # Vite configurations & API proxies
│   ├── tailwind.config.js    # Tailwind color configurations
│   ├── postcss.config.js     # PostCSS configurations
│   └── package.json          # Frontend dependencies
│
├── system-design.md          # Architectural and operational writeup
└── README.md                 # Project instructions manual
```

---

## Tech Stack

* **Frontend**: React.js (Vite compiler), Tailwind CSS, React Router DOM, Axios, Lucide React Icons.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB, Mongoose ODM.
* **Authentication**: JSON Web Token (JWT) with bcryptjs password encryption.
* **File Uploads**: Multer (disk storage engine with image verification).
* **Email Notification**: Nodemailer (SMTP transport).

---

## Getting Started: Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/en/) (v16.0.0 or higher)
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on port 27017)

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to create your local `.env` configuration:
   ```bash
   cp .env.example .env
   ```
4. If you have a local MongoDB running, the default `MONGO_URI` is ready to go. You can optionally configure SMTP credentials (like Mailtrap) to test email notifications.
5. Start the backend development server (using nodemon):
   ```bash
   npm run dev
   ```
   *Note: Upon startup, the system automatically checks if an Admin user exists. If not, it seeds the database with the default Admin user:*
   * **Email**: `admin@society.com`
   * **Password**: `admin123`

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL shown in your terminal (typically [http://localhost:3000](http://localhost:3000)).

---

## Database Schemas (Mongoose)

### 1. User
Tracks account credentials and roles.
* `name` (String, required): Resident/Admin name.
* `email` (String, required, unique, lowercase): User email login username.
* `password` (String, required, select: false): Hashed password.
* `role` (String, enum: `['Resident', 'Admin']`, default: `Resident`).
* `createdAt` (Date): Account creation timestamp.

### 2. Complaint
Manages filed service requests.
* `residentId` (ObjectId, ref: `User`, required): The resident who raised the complaint.
* `category` (String, required): Categorization (e.g. Plumbing, Electrical).
* `description` (String, required): Details of the issue.
* `photoUrl` (String, default: empty): Static server link pointing to the uploaded image.
* `priority` (String, enum: `['Low', 'Medium', 'High']`, default: `Medium`).
* `currentStatus` (String, enum: `['Open', 'In Progress', 'Resolved']`, default: `Open`).
* `isOverdue` (Boolean, default: `false`): Checked dynamically based on creation date.
* `createdAt` (Date, default: Date.now): Registration date.
* `resolvedAt` (Date, optional): Resolution timestamp.

### 3. ComplaintHistory
Audits states transitions of complaints.
* `complaintId` (ObjectId, ref: `Complaint`, required): Parent complaint reference.
* `status` (String, required, enum: `['Open', 'In Progress', 'Resolved']`).
* `actorId` (ObjectId, ref: `User`, required): Person who updated the status.
* `note` (String, default: empty): Explanatory message regarding the status change.
* `timestamp` (Date, default: Date.now): Time of action.

### 4. Notice
Community announcements published by administrators.
* `title` (String, required): Header text.
* `description` (String, required): Announcement content body.
* `isImportant` (Boolean, default: `false`): If flagged `true`, notice remains pinned at the top and residents receive notifications.
* `createdAt` (Date, default: Date.now).

---

## API Documentation

All request payloads and response payloads are in `application/json` format. Protected endpoints require the `Authorization: Bearer <JWT_TOKEN>` header.

### 1. Authentication
* `POST /api/auth/register` (Public - Resident only)
  * Payload: `{ "name": "Jane Doe", "email": "jane@gmail.com", "password": "securepassword123" }`
  * Response: Returns user details and signed JWT `token`.
* `POST /api/auth/login` (Public - Resident & Admin)
  * Payload: `{ "email": "admin@society.com", "password": "admin123" }`
  * Response: Returns user profile and signed JWT `token`.

### 2. Complaints
* `POST /api/complaints` (Protected - Resident only)
  * Request: Multi-part form data containing fields `category`, `description` and optional file attachment `photo`.
  * Response: Returns the newly logged complaint.
* `GET /api/complaints` (Protected - Resident & Admin)
  * Filter Query Options (Admin only): `?category=Plumbing`, `?status=Open`, `?date=2026-07-03`
  * Response: Residents receive their raised complaints. Admins receive all complaints. Overdue tickets appear at the top sorted chronologically.
* `GET /api/complaints/:id` (Protected - Resident & Admin)
  * Response: Returns detailed complaint document and its full `history` list (sorted oldest to newest).
* `PATCH /api/complaints/:id/priority` (Protected - Admin only)
  * Payload: `{ "priority": "High" }`
  * Response: Returns updated complaint.
* `PATCH /api/complaints/:id/status` (Protected - Admin only)
  * Payload: `{ "status": "In Progress", "note": "Technician scheduled for Monday morning" }`
  * Response: Returns updated complaint (and appends to `ComplaintHistory`). Dispatches status update email.

### 3. Notices (Notice Board)
* `POST /api/notices` (Protected - Admin only)
  * Payload: `{ "title": "Annual Society Meeting", "description": "The meeting will start at 10 AM.", "isImportant": true }`
  * Response: Returns new notice. Dispatches broadcast notices email to all residents if `isImportant: true`.
* `GET /api/notices` (Protected - Resident & Admin)
  * Response: List of all notices. Pinned (important) notices appear at the top.
* `DELETE /api/notices/:id` (Protected - Admin only)
  * Response: `{ "success": true, "message": "Notice removed successfully" }`

### 4. Admin Dashboard
* `GET /api/dashboard/stats` (Protected - Admin only)
  * Response: Summarized metrics: total complaints, count by status state, count by category, and total overdue count.