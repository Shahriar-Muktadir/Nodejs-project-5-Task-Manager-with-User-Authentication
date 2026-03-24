/**
 * Project name: Task Manager with User Authentication
 * File: Authentication Middleware which is used for checking login
 * Author: Shahriar Muktadir
 * Description: This is a task manager app used by mongoDB and env files mid level project
 * Date: 23.03.2026
 */


// Checking for logged in
function isLoggedIn( req, res, next) { // এটি একটি মিডলওয়্যার ফাংশন। Express-এ মিডলওয়্যার ফাংশন তিনটি প্যারামিটার পায়: req (request), res (response), এবং next (একটি কলব্যাক ফাংশন)।
    if(req.session.userId) {
        return next(); // it is a callback function provided by Express to middleware functions. When you define a middleware function with parameters (req, res, next), Express automatically passes a reference to the next function as the third argument. 
    }
    res.status(401).json({error: 'Unauthorized: Please log in'});
}

// Exports
module.exports = {isLoggedIn}; // module.exports = { isLoggedIn }; এর মানে হলো, আমরা একটি অবজেক্ট এক্সপোর্ট করছি যার একটি প্রপার্টি isLoggedIn। 
