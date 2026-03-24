/**
 * Project name: Task Manager with User Authentication
 * File: User.js is a file from model which will take the user and do the functionality
 * Author: Shahriar Muktadir
 * Description: This is a task manager app used by mongoDB and env files mid level project
 * Date: 23.03.2026
 */

// dependencies
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // bcrypt – পাসওয়ার্ড হ্যাশ (এনক্রিপ্ট) করার জন্য।
// const { uniq, lowerCase } = require('lodash'); // removed – not needed

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true }, // fixed spelling
    password: { type: String, required: true }
}, { timestamps: true });

// Hash password before saving – using async function (no next argument)
userSchema.pre('save', async function() {
    // Only hash if password is modified
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * pre('save') – প্রতিবার save() কল করার আগে এই ফাংশনটি চালায়।

this.isModified('password') – পাসওয়ার্ড ফিল্ডটি পরিবর্তন হয়েছে কিনা চেক করে। যদি পরিবর্তন না হয়,
 তাহলে early return করে (হ্যাশিং এড়িয়ে)।

নতুন পাসওয়ার্ড থাকলে bcrypt.genSalt(10) দিয়ে একটি salt তৈরি করে
 (যা হ্যাশিং প্রক্রিয়াকে আরো নিরাপদ করে), তারপর bcrypt.hash() দিয়ে পাসওয়ার্ড হ্যাশ করে this.password-এ সেট করে।
 */

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Exports
module.exports = mongoose.model('User', userSchema);