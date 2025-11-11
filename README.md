# TaskNTrack - Server

Express + Mongoose backend for the TaskNTrack app.

Environment

Copy `.env.example` to `.env` and set `MONGO_URI`.

Run

- npm install
- npm run dev

API

- GET /api/tasks
- POST /api/tasks { title }
- PUT /api/tasks/:id { title, completed }
- DELETE /api/tasks/:id

- GET /api/expenses
- POST /api/expenses { title, amount, category, date }
- DELETE /api/expenses/:id
- GET /api/expenses/summary/month?month=YYYY-MM
