require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./src/models/Task');
const Expense = require('./src/models/Expense');

const seedData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI not found in .env file');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✅ MongoDB connected successfully!');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('\nClearing existing data...');
    await Task.deleteMany({});
    await Expense.deleteMany({});
    console.log('✅ Existing data cleared');

    // Sample Tasks
    console.log('\nAdding sample tasks...');
    const sampleTasks = [
      { title: 'Buy groceries for the week', completed: false },
      { title: 'Finish project documentation', completed: false },
      { title: 'Call the dentist for appointment', completed: false },
      { title: 'Read "Atomic Habits" for 30 minutes', completed: true },
      { title: 'Prepare presentation slides', completed: false },
      { title: 'Review pull requests on GitHub', completed: true },
      { title: 'Water the plants', completed: true },
      { title: 'Plan weekend trip', completed: false },
      { title: 'Update resume', completed: false },
      { title: 'Learn React hooks', completed: true }
    ];

    const tasks = await Task.insertMany(sampleTasks);
    console.log(`✅ Added ${tasks.length} tasks`);

    // Sample Expenses
    console.log('\nAdding sample expenses...');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const sampleExpenses = [
      // This month's expenses
      { 
        title: 'Morning Coffee', 
        amount: 150, 
        category: 'Food', 
        date: new Date(currentYear, currentMonth, 2) 
      },
      { 
        title: 'Weekly Groceries', 
        amount: 2500, 
        category: 'Food', 
        date: new Date(currentYear, currentMonth, 3) 
      },
      { 
        title: 'Petrol', 
        amount: 1200, 
        category: 'Transport', 
        date: new Date(currentYear, currentMonth, 4) 
      },
      { 
        title: 'Electricity Bill', 
        amount: 1800, 
        category: 'Utilities', 
        date: new Date(currentYear, currentMonth, 1) 
      },
      { 
        title: 'Internet Bill', 
        amount: 999, 
        category: 'Utilities', 
        date: new Date(currentYear, currentMonth, 1) 
      },
      { 
        title: 'Online Course - Udemy', 
        amount: 499, 
        category: 'Education', 
        date: new Date(currentYear, currentMonth, 5) 
      },
      { 
        title: 'Lunch at Restaurant', 
        amount: 450, 
        category: 'Food', 
        date: new Date(currentYear, currentMonth, 6) 
      },
      { 
        title: 'Movie Tickets', 
        amount: 600, 
        category: 'Entertainment', 
        date: new Date(currentYear, currentMonth, 7) 
      },
      { 
        title: 'Gym Membership', 
        amount: 1500, 
        category: 'Health', 
        date: new Date(currentYear, currentMonth, 1) 
      },
      { 
        title: 'Mobile Recharge', 
        amount: 399, 
        category: 'Utilities', 
        date: new Date(currentYear, currentMonth, 8) 
      },
      { 
        title: 'Uber Ride', 
        amount: 250, 
        category: 'Transport', 
        date: new Date(currentYear, currentMonth, 9) 
      },
      { 
        title: 'Books from Amazon', 
        amount: 899, 
        category: 'Education', 
        date: new Date(currentYear, currentMonth, 10) 
      },
      { 
        title: 'Birthday Gift', 
        amount: 1200, 
        category: 'Shopping', 
        date: new Date(currentYear, currentMonth, 5) 
      },
      { 
        title: 'Spotify Premium', 
        amount: 119, 
        category: 'Entertainment', 
        date: new Date(currentYear, currentMonth, 1) 
      },
      { 
        title: 'Vegetables', 
        amount: 350, 
        category: 'Food', 
        date: new Date(currentYear, currentMonth, 8) 
      },
      // Last month's expenses for comparison
      { 
        title: 'Groceries', 
        amount: 3200, 
        category: 'Food', 
        date: new Date(currentYear, currentMonth - 1, 15) 
      },
      { 
        title: 'Petrol', 
        amount: 1500, 
        category: 'Transport', 
        date: new Date(currentYear, currentMonth - 1, 20) 
      },
      { 
        title: 'Netflix Subscription', 
        amount: 649, 
        category: 'Entertainment', 
        date: new Date(currentYear, currentMonth - 1, 1) 
      }
    ];

    const expenses = await Expense.insertMany(sampleExpenses);
    console.log(`✅ Added ${expenses.length} expenses`);

    // Summary
    console.log('\n📊 Database Summary:');
    const taskCount = await Task.countDocuments();
    const expenseCount = await Expense.countDocuments();
    const totalExpense = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingTasks = await Task.countDocuments({ completed: false });

    console.log(`   Total Tasks: ${taskCount}`);
    console.log(`   Pending Tasks: ${pendingTasks}`);
    console.log(`   Completed Tasks: ${taskCount - pendingTasks}`);
    console.log(`   Total Expenses: ${expenseCount}`);
    console.log(`   Total Amount Spent: ₹${totalExpense[0]?.total || 0}`);

    // Category breakdown
    console.log('\n📈 Expense by Category:');
    const categoryBreakdown = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    
    categoryBreakdown.forEach(cat => {
      console.log(`   ${cat._id}: ₹${cat.total} (${cat.count} transactions)`);
    });

    console.log('\n✅ Sample data seeded successfully!');
    console.log('🚀 You can now start your server and test the app\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

seedData();
