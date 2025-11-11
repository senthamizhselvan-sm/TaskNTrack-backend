require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const tasksRouter = require('./routes/tasks');
const expensesRouter = require('./routes/expenses');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
// Connect DB (if MONGO_URI is not provided, connectDB will start an in-memory MongoDB for dev)
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.warn('MONGO_URI not set — falling back to in-memory MongoDB for development')
}

const start = async () => {
  await connectDB(mongoUri)

  // require models after DB connection to ensure mongoose is ready
  const Task = require('./models/Task')
  const Expense = require('./models/Expense')

  // Routes
  app.use('/api/tasks', tasksRouter)
  app.use('/api/expenses', expensesRouter)

  app.get('/', (req, res) => res.send('TaskNTrack API'))

  // record server start time
  const startedAt = new Date()

  // status endpoint reporting DB counts, uptime, node version and whether in-memory fallback is used
  app.get('/status', async (req, res) => {
    try {
      const tasksCount = await Task.countDocuments()
      const expensesCount = await Expense.countDocuments()
      const usingInMemory = !process.env.MONGO_URI
      const seeded = (tasksCount + expensesCount) > 0
      res.json({
        status: 'ok',
        server: {
          uptimeSeconds: process.uptime(),
          startedAt: startedAt.toISOString(),
          nodeVersion: process.version
        },
        db: { connected: true, inMemory: usingInMemory, tasks: tasksCount, expenses: expensesCount, sampleSeeded: seeded }
      })
    } catch (err) {
      res.status(500).json({ status: 'error', error: err.message })
    }
  })

  // log startup summary
  try {
    const tasksCount = await Task.countDocuments()
    const expensesCount = await Expense.countDocuments()
    const usingInMemory = !process.env.MONGO_URI
    const seeded = (tasksCount + expensesCount) > 0
    console.log(`Startup: DB connected. tasks=${tasksCount}, expenses=${expensesCount}, inMemory=${usingInMemory}, sampleSeeded=${seeded}`)

    // If DB is empty, seed sample data to make the app usable for testing/dev
    if (!seeded) {
      console.log('Seeding sample data...')
      try {
        // sample tasks
        const sampleTasks = [
          { title: 'Buy groceries', completed: false },
          { title: 'Finish project report', completed: false },
          { title: 'Read for 30 minutes', completed: true }
        ]
        await Task.insertMany(sampleTasks)

        // sample expenses
        const now = new Date()
        const sampleExpenses = [
          { title: 'Coffee', amount: 3.5, category: 'Food', date: new Date(now.getFullYear(), now.getMonth(), 2) },
          { title: 'Groceries', amount: 54.23, category: 'Food', date: new Date(now.getFullYear(), now.getMonth(), 3) },
          { title: 'Gas', amount: 40.0, category: 'Transport', date: new Date(now.getFullYear(), now.getMonth(), 5) },
          { title: 'Internet', amount: 60.0, category: 'Utilities', date: new Date(now.getFullYear(), now.getMonth(), 1) },
          { title: 'Book', amount: 12.99, category: 'Education', date: new Date(now.getFullYear(), now.getMonth(), 7) }
        ]
        await Expense.insertMany(sampleExpenses)

        const tCount = await Task.countDocuments()
        const eCount = await Expense.countDocuments()
        console.log(`Seeding complete. tasks=${tCount}, expenses=${eCount}`)
      } catch (seedErr) {
        console.error('Failed to seed sample data:', seedErr.message)
      }
    }
  } catch (err) {
    console.log('Startup: DB connected but failed to read counts', err.message)
  }

  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start().catch(err => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})
