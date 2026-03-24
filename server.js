/**
 * Project name: Task Manager with User Authentication
 * Author: Shahriar Muktadir
 * Description: This is a task manager app used by mongoDB and env files mid level project
 * Date: 21.03.2026
 */

// Dependencies
require('dotenv').config(); // dotenv হলো একটা package, যেটা .env ফাইল থেকে data নিয়ে process.env এ দেয়।
const express = require('express'); // taking express mongoose 
const mongoose = require('mongoose');
const session = require('express-session'); // এটা login system maintain করার জন্য Example: user login করলে server মনে রাখে user login করা 👉 এটাকে session বলে
const MongoStore = require('connect-mongo'); // session data MongoDB তে save করার জন্য default session memory তে থাকে → server restart হলে হারিয়ে যায় MongoDB তে রাখলে → persist থাকে ✅
const authRoutes = require('./routes/auth'); // taking routes from the folders like auth and tasks js files
const taskRoutes = require('./routes/tasks');


// Modulescaffoldingd
const app = express(); // calling the whole express framework in app object
const PORT = process.env.PORT || 5000; // এটা production (যেমন hosting) এর জন্য দরকার means if env has port it will run otherwise 5000 does

//MongoDB connection
mongoose.connect(process.env.MONGO_URI) // এখানে MongoDB এর URL দিয়ে connect করা হচ্ছে 
    .then(() => console.log('MongoDB connected'))// connect সফল হলে এইটা run হবে
    .catch(err => console.log('MongoDB connection error: ', err));// এটা Promise system 

// Session middleware
app.use(session({ // The explanation given below
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
   // store: MongoStore.create({mongoUrl: process.env.MONGO_URI}),
    cookie: {maxAge: 1000 * 60 * 60 * 24} //browser-এ কতদিন login থাকবে which means it will be stored as cookie in browser for one day
}));
/**
 * 👉 এখন একে একে বুঝি:

🔸 secret

👉 session encrypt করার key

🔸 resave: false

👉 change না হলে session আবার save করবে না

🔸 saveUninitialized: false

👉 empty session save করবে না
 */

// Middleware
app.use(express.json()); // 👉 JSON data parse করে
app.use(express.static('public')); // Taking the public folder and making the static changes
app.use(express.urlencoded({extended: true})); // 👉 form data handle করে

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/tasks', taskRoutes);

// Server listening

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
