const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());

// Middleware
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '', // Replace with your MySQL password
    database: 'aura_db',
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// ------------------- POSTS -------------------

// Create a new post
app.post('/api/posts', (req, res) => {
    const { post_name, post_category } = req.body;
    
    // Validate post_category
    if (!['blog', 'questionnaire'].includes(post_category)) {
        return res.status(400).json({ error: 'Invalid post category' });
    }

    const sql = 'INSERT INTO post (post_name, post_category, post_commentcount) VALUES (?, ?, 0)';
    db.query(sql, [post_name, post_category], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ post_id: result.insertId });
    });
});

// Fetch all posts with their comments
app.get('/api/posts', (req, res) => {
    // Fetch all posts
    db.query('SELECT post_id, post_name, post_category, post_commentcount FROM post', (err, posts) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).json({ error: err.message });
        }

        // Fetch all comments
        db.query('SELECT comment_id, post_id, comment_text FROM comment', (err, comments) => {
            // Add default likes value since the column doesn't exist
            comments = comments.map(comment => ({
                ...comment,
                likes: 0
            }));
            if (err) {
                console.error('Error fetching comments:', err);
                return res.status(500).json({ error: err.message });
            }

            // Group comments by post_id
            const commentsByPost = comments.reduce((acc, comment) => {
                if (!acc[comment.post_id]) {
                    acc[comment.post_id] = [];
                }
                acc[comment.post_id].push({
                    comment_id: comment.comment_id,
                    text: comment.comment_text,
                    likes: comment.likes
                });
                return acc;
            }, {});

            // Combine posts with their comments
            const postsWithComments = posts.map(post => ({
                ...post,
                comments: commentsByPost[post.post_id] || []
            }));

            console.log('Successfully fetched posts with comments');
            res.status(200).json(postsWithComments);
        });
    });
});

// ------------------- COMMENTS -------------------

// Add a new comment & update post_commentcount
app.post('/api/comments', (req, res) => {
    console.log('Received comment data:', req.body);
    const { comment_text, post_id } = req.body;

    if (typeof comment_text !== "string" || typeof post_id !== "number") {
        return res.status(400).json({ error: "Invalid data types for comment_text or post_id" });
    }

    // Insert the new comment
    const insertCommentSQL = 'INSERT INTO comment (comment_text, post_id) VALUES (?, ?)';
    db.query(insertCommentSQL, [comment_text, post_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        console.log('Inserted comment:', { comment_text, post_id });

        // Update post_commentcount
        const updatePostSQL = 'UPDATE post SET post_commentcount = post_commentcount + 1 WHERE post_id = ?';
        db.query(updatePostSQL, [post_id], (err, updateResult) => {
            if (err) {
                return res.status(500).json({ error: "Failed to update post_commentcount" });
            }

            console.log('Updated post_commentcount for post_id:', post_id);
            res.status(201).json({ comment_id: result.insertId });
        });
    });
});

// Fetch all comments for a specific post
app.get('/api/comments/:post_id', (req, res) => {
    const { post_id } = req.params;
    const sql = 'SELECT * FROM comment WHERE post_id = ?';
    db.query(sql, [post_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});

// ------------------- START SERVER -------------------
app.listen(5000 , () => {
  console.log('Server running on port 5000');
});