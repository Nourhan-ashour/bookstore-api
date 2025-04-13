const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


const JWT_SECRET_KEY = 'your_actual_secret_key_here';

let users = [];

const isValid = (username) => {
  // Check if username is a non-empty string and doesn't already exist in users array
  return username && !users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  // Find the user in the users array
  const user = users.find(user => user.username === username);
  if (user && user.password === password) {
    return true; // User is authenticated
  }
  return false; // Invalid credentials
}

const secretKey = 'your_secure_secret_key_here';



//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username: enteredUsername, password: enteredPassword } = req.body;

  // تحقق من وجود اسم المستخدم وكلمة المرور في البيانات المدخلة
  if (!enteredUsername || !enteredPassword) {
    return res.status(400).json({ message: "Username and Password are required" });
  }

  if (!authenticatedUser(enteredUsername, enteredPassword)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // إذا كانت البيانات صحيحة، نولد JWT وتخزينه في الجلسة
  const token = jwt.sign({ username: enteredUsername }, JWT_SECRET_KEY, {expiresIn: '9h' });

  // تخزين التوكن في الجلسة
  req.session.accessToken = token;
  if (!req.session.accessToken) {
    return res.status(401).json({ message: "Unauthorized. Please log in first." });
  }

  return res.status(200).json({ message: "Login successful",token });
  });






// Add a book review

// Update or Add a Book Review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Check if the user is logged in by verifying the session accessToken
  const accessToken = req.session.accessToken ;
  const { isbn } = req.params;
const { review } = req.body;
const username = req.user;
  if (!accessToken) {
    return res.status(401).json({ message: "Authentication required: No token found" });
  }
    if (!review) {
      return res.status(400).json({ message: "Review text is required" });
    }
    // Find the book by ISBN
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the book already has reviews, and if the user has already reviewed it
    if (books[isbn].reviews[username]) {
      // User has already reviewed this book, so update the review
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully", review });
    } else {
      // User has not reviewed this book, so add the review
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review added successfully", review });
    }
  });



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
