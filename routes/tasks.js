/**
 * Project name: Task Manager with User Authentication
 * File: tasks file in routes which will do the routing for tasks
 * Author: Shahriar Muktadir
 * Description: This is a task manager app used by mongoDB and env files mid level project
 * Date: 23.03.2026
 */


// dependencies
const express = require('express');
const router = express.Router(); // I don't know anyting about this
const Task = require('../models/Task.js');
const { isLoggedIn } = require('../middlewares/authMiddleware.js');

// All task routes require authentication
router.use(isLoggedIn);

// Get all tasks for logeed in user
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.session.userId }).sort({ createdAt: -1});
        res.json(tasks);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new task
router.post('/', async (req, res) =>{
    try {
        const { title, description, dueDate } = req.body;
        if(!title) return res.status(400).json({error: 'Title is reqired'});
        const task = new Task({
            title,
            description,
            dueDate,
            user: req.session.userId
        });
        await task.save();
        res.status(201).json(task);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, user: req.session.userId});
        if(!task) return res.status(404).json({error: 'Task not found'});
        const { title, description, completed, dueDate } = req.body;
        if(title !== undefined) task.title = title;
        if(description !== undefined) task.description = description;
        if(completed !== undefined) task.completed = completed;
        if (dueDate !== undefined) task.dueDate = dueDate;
        await task.save();
        res.json(task);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const result = await Task.findOneAndDelete({_id: req.params.id, user: req.session.userId});
        if(!result) return res.status(404).json({error: 'Task not found'});
        res.json({ message: 'Task deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Exports
module.exports = router;
