/**
 * Project name: Task Manager with User Authentication
 * File: Task.js is a file from model which will take the task and do the functionality
 * Author: Shahriar Muktadir
 * Description: This is a task manager app used by mongoDB and env files mid level project
 * Date: 23.03.2026
 */


// dependencies
const mongoose = require('mongoose'); //Mongoose হলো MongoDB-এর সাথে কাজ করার জন্য একটি ODM (Object Data Modeling) লাইব্রেরি।

// Making a task using mongoose schema
const taskSchema = new mongoose.Schema({ // mongoose.Schema দিয়ে আমরা একটি নতুন Schema তৈরি করি। এই Schema-তে fields গুলো ডিফাইন করা হয়।
    title: { type: String, required: true, trim: true },
    description: { type: String,  trim: true },
    completed: { type: Boolean,  default: false },
    dueDate: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    
}, {timestamps: true }); // { timestamps: true } বলছে, MongoDB-তে ডকুমেন্ট তৈরি ও আপডেটের সময় স্বয়ংক্রিয়ভাবে createdAt ও updatedAt ফিল্ড যোগ হবে।

// Exports
module.exports = mongoose.model('Task', taskSchema); // Mongoose-কে বলা হচ্ছে: “আমি Task নামে একটি মডেল তৈরি করতে চাই, যার ডকুমেন্টের কাঠামো হবে taskSchema অনুযায়ী।”