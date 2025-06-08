// Add this new endpoint near other pill-related endpoints

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const app = express();
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'aura_db',
  connectionLimit: 10 // Adjust as needed
});

// Nodemailer transporter setup (configure with your email service credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aurapp2025@gmail.com',
        pass: 'behappy0147'
    }
});

// Setup multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Image upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl });
});

// Get pills by user_id
app.get('/api/pills/user/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const sql = `
    SELECT p.*, pis.intake_status 
    FROM pill p 
    LEFT JOIN pill_intake_status pis ON p.intake_status_id = pis.id 
    WHERE p.user_id = ? 
    ORDER BY p.date_prescribed DESC
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching pills for user:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// API endpoint to get fertility centers nearby given lat, lng, and radius (km) from database
app.get('/api/fertility-centers-nearby', (req, res) => {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude || !radius) {
        return res.status(400).json({ error: 'latitude, longitude, and radius query parameters are required' });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    // Haversine formula in SQL to calculate distance
    const sql = `
        SELECT id, name, rating, address, latitude, longitude, image,
        (6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(latitude))
        )) AS distance
        FROM fertility_centers
        HAVING distance <= ?
        ORDER BY distance ASC
    `;

    db.query(sql, [lat, lng, lat, rad], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Map results to expected format
        const centers = results.map(row => ({
            id: row.id,
            name: row.name,
            rating: row.rating,
            address: row.address,
            coordinates: { latitude: row.latitude, longitude: row.longitude },
            image: row.image
        }));
        res.json(centers);
    });
});

// Add error logging for transporter verification
transporter.verify(function(error, success) {
    if (error) {
        console.error('Nodemailer transporter verification failed:', error);
    } else {
        console.log('Nodemailer transporter is ready to send emails');
    }
});

// Connect to MySQL
db.getConnection(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// ------------------- LOGIN -------------------

// User registration endpoint
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a secure key and store safely

app.post('/api/register', (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        console.error('Email and password are required');
        return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!email.includes('@')) {
        console.error('Invalid email format:', email);
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6 || !/\d/.test(password)) {
        console.error('Password validation failed');
        return res.status(400).json({ error: 'Password must be at least 6 characters and include a number' });
    }

    // Insert user into users table
    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Email already registered' });
            }
            return res.status(500).json({ error: err.message });
        }
        console.log('User registered with ID:', result.insertId);

        // Generate JWT token
        const token = jwt.sign({ userId: result.insertId, email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ userId: result.insertId, token, message: 'User registered successfully' });
    });
});

app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = 'SELECT user_id AS id, email, password, role_id FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Email doesn't exist" });
        }
        const user = results[0];
        if (user.password !== password) {
            return res.status(401).json({ error: 'Incorrect password' });
        }
        if (user.role_id !== 1) {
            return res.status(403).json({ error: 'Access denied: Not an admin' });
        }

        // Insert login record into admin_logs table
        const loginTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const insertSql = 'INSERT INTO admin_logs (admin_email, login_time, ip_address, user_agent) VALUES (?, ?, ?, ?)';
        db.query(insertSql, [email, loginTime, ipAddress, userAgent], (insertErr) => {
            if (insertErr) {
                console.error('Failed to record admin login:', insertErr);
            }
            // Generate JWT token
            const token = jwt.sign({ userId: user.user_id, email }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ success: true, message: 'Login successful', userId: user.id, token });
        });
    });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const userAgent = req.headers['user-agent'] || null;
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT user_id AS id, email, password, role_id FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Email doesn't exist" });
    }
    const user = results[0];

    // Verify password (if using bcrypt, use bcrypt.compare here)
    if (user.password !== password) { // Replace with bcrypt comparison in production
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // ------------------- Update last_login -------------------
    const updateLastLoginSql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?';
    db.query(updateLastLoginSql, [user.id], (updateErr) => {
      if (updateErr) {
        console.error('Failed to update last_login:', updateErr);
        // Don't fail the login if updating timestamp fails; log the error instead
      }
    });
    // ------------------- End last_login update -------------------

    // Insert login record into user_logs (optional)
    const loginTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const insertSql = 'INSERT INTO user_logs (user_email, login_time, ip_address, user_agent) VALUES (?, ?, ?, ?)';
    db.query(insertSql, [email, loginTime, ipAddress, userAgent], (insertErr) => {
      if (insertErr) {
        console.error('Failed to record user login:', insertErr);
      }
      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ 
        success: true, 
        message: 'Login successful', 
        userId: user.id, 
        email: user.email, 
        token 
      });
    });
  });
});

// Password reset request endpoint
app.post('/api/request-password-reset', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Email doesn't exist" });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

        // Store the reset token and expiry in the database (add columns reset_token and reset_token_expiry to users table)
        const updateSql = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
        db.query(updateSql, [resetToken, resetTokenExpiry, email], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ error: updateErr.message });
            }

            // Send email with reset link
            const resetLink = `http://your-frontend-url/reset-password?token=${resetToken}&email=${email}`;
            const mailOptions = {
                from: 'your-email@gmail.com',
                to: email,
                subject: 'Password Reset Request',
                html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`
            };

            transporter.sendMail(mailOptions, (mailErr, info) => {
                if (mailErr) {
                    return res.status(500).json({ error: mailErr.message });
                }
                res.status(200).json({ message: 'Password reset email sent' });
            });
        });
    });
});

// API endpoint to update user's pregnancy status
app.put('/api/users/:id/pregnancy-status', (req, res) => {
  const userId = req.params.id;
  const { pregnancy_status_id } = req.body;

  if (!pregnancy_status_id) {
    return res.status(400).json({ error: 'pregnancy_status_id is required' });
  }

  const sql = 'UPDATE users SET pregnancy_status_id = ? WHERE user_id = ?';
  db.query(sql, [pregnancy_status_id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Pregnancy status updated successfully' });
  });
});

// ------------------- POSTS -------------------

// Create a new post
app.post('/api/posts', (req, res) => {
    const { post_name, category_id } = req.body;

    console.log('Received category_id:', category_id);
    
    // Validate category_id as category id 1 or 2
    if (![1, 2].includes(category_id)) {
        return res.status(400).json({ error: 'Invalid post category id' });
    }

    const sql = 'INSERT INTO post (post_name, category_id, post_commentcount) VALUES (?, ?, 0)';
    db.query(sql, [post_name, category_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ post_id: result.insertId });
    });
});

// Like a post (increment likes count)
app.post('/api/posts/:post_id/like', (req, res) => {
    const post_id = req.params.post_id;

    // Increment likes count for the post
    const sql = 'UPDATE post SET likes = IFNULL(likes, 0) + 1 WHERE post_id = ?';
    db.query(sql, [post_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post liked successfully' });
    });
});

// Fetch all posts with their comments
app.get('/api/posts', (req, res) => {
    // Fetch all posts
db.query('SELECT post_id, post_name, category_id, post_commentcount FROM post', (err, posts) => {
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

// Delete a post by ID
app.delete('/api/posts/:post_id', (req, res) => {
    const { post_id } = req.params;
    const deleteCommentsSQL = 'DELETE FROM comment WHERE post_id = ?';
    const deletePostSQL = 'DELETE FROM post WHERE post_id = ?';

    // Delete comments first due to foreign key constraints
    db.query(deleteCommentsSQL, [post_id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Delete the post
        db.query(deletePostSQL, [post_id], (err2, result) => {
            if (err2) {
                return res.status(500).json({ error: err2.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json({ message: 'Post deleted successfully' });
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

// Endpoint to save a post for a user
app.post('/api/saved-posts', (req, res) => {
    const { user_id, post_id } = req.body;
    if (!user_id || !post_id) {
        return res.status(400).json({ error: 'user_id and post_id are required' });
    }
    const sql = 'INSERT IGNORE INTO saved_posts (user_id, post_id) VALUES (?, ?)';
    db.query(sql, [user_id, post_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Post saved successfully' });
    });
});

// Endpoint to unsave a post for a user
app.delete('/api/saved-posts', (req, res) => {
    const { user_id, post_id } = req.body;
    if (!user_id || !post_id) {
        return res.status(400).json({ error: 'user_id and post_id are required' });
    }
    const sql = 'DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?';
    db.query(sql, [user_id, post_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Post unsaved successfully' });
    });
});

// Endpoint to get saved posts for a user
app.get('/api/saved-posts/:user_id', (req, res) => {
    const user_id = req.params.user_id;
const sql = `
        SELECT p.post_id, p.post_name, p.category_id, p.post_commentcount FROM post p
        JOIN saved_posts sp ON p.post_id = sp.post_id
        WHERE sp.user_id = ?
    `;
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// Helper function to calculate distance between two lat/lng points in km using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
}

// API endpoint to get fertility centers nearby given lat, lng, and radius (km)
app.get('/api/fertility-centers-nearby', (req, res) => {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude || !radius) {
        return res.status(400).json({ error: 'latitude, longitude, and radius query parameters are required' });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    const nearbyCenters = fertilityCenters.filter(center => {
        const dist = getDistanceFromLatLonInKm(lat, lng, center.coordinates.latitude, center.coordinates.longitude);
        return dist <= rad;
    });

    res.json(nearbyCenters);
});


/**
 * Business Profiles API Endpoints
 */

// Get all businesses
app.get('/api/businesses', (req, res) => {
  const sql = 'SELECT * FROM businesses';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Create a new business
app.post('/api/businesses', (req, res) => {
  const { name, category, price, address, profile_image_url, main_image_url, website_url, whatsapp_number } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Business name is required' });
  }
  const sql = 'INSERT INTO businesses (name, category, price, address, profile_image_url, main_image_url, website_url, whatsapp_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, category, price, address, profile_image_url, main_image_url, website_url, whatsapp_number], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, message: 'Business created successfully' });
  });
});

// Update a business
app.put('/api/businesses/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, price, address, profile_image_url, main_image_url, website_url, whatsapp_number } = req.body;
  const sql = 'UPDATE businesses SET name = ?, category = ?, price = ?, address = ?, profile_image_url = ?, main_image_url = ?, website_url = ?, whatsapp_number = ? WHERE id = ?';
  db.query(sql, [name, category, price, address, profile_image_url, main_image_url, website_url, whatsapp_number, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json({ message: 'Business updated successfully' });
  });
});

// Delete a business
app.delete('/api/businesses/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM businesses WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json({ message: 'Business deleted successfully' });
  });
});

// ------------------- START SERVER -------------------

// Get all users for admin dashboard
app.get('/api/users', (req, res) => {
  console.log('GET /api/users called');
    const sql = 'SELECT user_id, email, password, role_id, pregnancy_status_id, last_login FROM users'; // Include pregnancy_status_id
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error in GET /api/users:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('GET /api/users results:', results);
    // Map results to expected format
    const users = results.map(user => ({
      user_id: user.user_id,
      email: user.email,
      password: user.password,
      last_active: user.last_active || 'unknown',
      pregnancy_status_id: user.pregnancy_status_id || null,
      last_login: user.last_login // Include in response
    }));
    res.json(users);
  });
});

// New endpoint to get user info by id
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT user_id, email, pregnancy_status_id FROM users WHERE user_id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user data from database:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});


// Add a new fertility center
app.post('/api/fertility-centers', (req, res) => {
  const { name, address, latitude, longitude, image } = req.body;
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: 'Name, address, latitude, and longitude are required' });
  }
  const sql = 'INSERT INTO fertility_centers (name, address, latitude, longitude, image) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, address, latitude, longitude, image || ''], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, message: 'Fertility center added successfully' });
  });
});

app.get('/api/fertility-centers/search', (req, res) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ error: 'name query parameter is required' });
    }
    const sql = 'SELECT id, name, rating, address, latitude, longitude, image FROM fertility_centers WHERE name LIKE ?';
    const searchTerm = `%${name}%`;
    db.query(sql, [searchTerm], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const centers = results.map(row => ({
            id: row.id,
            name: row.name,
            rating: row.rating,
            address: row.address,
            coordinates: { latitude: row.latitude, longitude: row.longitude },
            image: row.image
        }));
        res.json(centers);
    });
});

app.post('/api/periods', (req, res) => {
    const { user_id, start_date, end_date } = req.body;
    console.log('Received period data:', req.body);
    if (!user_id || !start_date) {
        console.log('Missing user_id or start_date');
        return res.status(400).json({ error: 'user_id and start_date are required' });
    }
    // If end_date is not provided, set it to start_date + 6 days (7 days total)
    let calculatedEndDate = end_date;
    if (!end_date) {
        const startDateObj = new Date(start_date);
        startDateObj.setDate(startDateObj.getDate() + 6);
        calculatedEndDate = startDateObj.toISOString().split('T')[0];
    }
    const sql = 'INSERT INTO user_periods (user_id, start_date, end_date) VALUES (?, ?, ?)';
    db.query(sql, [user_id, start_date, calculatedEndDate], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Period record inserted with ID:', result.insertId);
        res.status(201).json({ id: result.insertId, message: 'Period record added successfully' });
    });
});

app.get('/api/periods/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const sql = 'SELECT * FROM user_periods WHERE user_id = ? ORDER BY start_date DESC';
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});

app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  db.getConnection((err, connection) => { // This now works with a pool
    if (err) {
      console.error('Error getting DB connection:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }
    connection.beginTransaction((txErr) => {
      if (txErr) {
        connection.release(); // Release the connection if transaction fails
        console.error('Transaction error:', txErr);
        return res.status(500).json({ error: 'Transaction error' });
      }

      const tablesToDeleteFrom = [
        'vaginal_discharge',
        'user_periods',
        'symptoms',
        'saved_posts',
        'pill',
        'menstrual_flow'
      ];

      const deleteNextTable = (index) => {
        if (index >= tablesToDeleteFrom.length) {
          // Delete the user after all related tables are cleared
          connection.query('DELETE FROM users WHERE user_id = ?', [userId], (delErr, result) => {
            if (delErr) {
              return connection.rollback(() => {
                connection.release(); // Release on rollback
                console.error('Error deleting user:', delErr);
                res.status(500).json({ error: 'Error deleting user' });
              });
            }
            connection.commit((commitErr) => {
              connection.release(); // Release after commit
              if (commitErr) {
                console.error('Commit error:', commitErr);
                return res.status(500).json({ error: 'Commit error' });
              }
              res.status(200).json({ message: 'User and related data deleted successfully' });
            });
          });
          return;
        }
        const table = tablesToDeleteFrom[index];
        console.log(`Deleting from ${table} for user ID: ${userId}`);
        connection.query(
          `DELETE FROM ${table} WHERE user_id = ?`,
          [userId],
          (delErr) => {
            if (delErr) {
              return connection.rollback(() => {
                connection.release(); // Release on error
                console.error(`Error deleting from ${table}:`, delErr);
                res.status(500).json({ error: `Error deleting from ${table}` });
              });
            }
            deleteNextTable(index + 1);
          }
        );
      };

      deleteNextTable(0);
    });
  });
});

app.post('/api/businesses', (req, res) => {
  const { name, category, price, address, profile_image_url, main_image_url, website_url, whatsapp_number } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Business name is required' });
  }
  const sql = 'INSERT INTO businesses (name, category, price, address, profile_image_url, main_image_url, website_url, whatsapp_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, category, price, address, profile_image_url, main_image_url, website_url, whatsapp_number], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, message: 'Business created successfully' });
  });
});

app.get('/api/health-records', (req, res) => {
  const { email, record_type, start_date, end_date } = req.query;
  console.log('Received /api/health-records request with:', { email, record_type, start_date, end_date });
  
  if (!email || !start_date || !end_date || !record_type) {
    return res.status(400).json({ error: 'email, start_date, end_date, and record_type are required' });
  }

  const allowedRecordTypes = ['symptoms', 'vaginal_discharge', 'menstrual_flow', 'pill'];
  if (!allowedRecordTypes.includes(record_type)) {
    return res.status(400).json({ error: 'Invalid record_type. Allowed values: symptoms, vaginal_discharge, menstrual_flow, pill' });
  }

  const userSql = 'SELECT user_id FROM users WHERE email = ?';
  db.query(userSql, [email], (userErr, userResults) => {
    if (userErr) {
      return res.status(500).json({ error: userErr.message });
    }
    if (userResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResults[0].user_id;
    console.log('Found userId:', userId);

    const recordConfig = {
      symptoms: {
        table: 'symptoms',
        dateColumn: 'record_date',
        fields: 'nothing, fatigue, cramps, bloating, tenderness, mood_swings, diarrhea, acne, headache, cravings, insomnia, itching_dryness',
        resultKey: 'symptoms'
      },
      vaginal_discharge: {
        table: 'vaginal_discharge',
        dateColumn: 'record_date',
        fields: 'none, egg_white, watery, sticky, creamy, spotting, clumpy_whites, unusual, gray',
        resultKey: ''
      },
      menstrual_flow: {
        table: 'menstrual_flow',
        dateColumn: 'record_date',
        fields: 'light, medium, heavy, blood_clots',
        resultKey: 'menstrual_flow'
      },
      pill: {
        table: 'pill',
        dateColumn: 'date_prescribed',
        fields: 'id, name, intake_no, description, date_prescribed, intake_status_id', // Matches document 6 schema
        resultKey: 'pills'
      }
    };

    const config = recordConfig[record_type];
    if (!config) {
      return res.status(400).json({ error: 'Invalid record_type' });
    }

    // Build and execute the SQL query for the selected record_type
    const sql = `
      SELECT ${config.dateColumn}, ${config.fields} 
      FROM ${config.table} 
      WHERE user_id = ? AND ${config.dateColumn} BETWEEN ? AND ? 
      ORDER BY ${config.dateColumn} DESC
    `;

    db.query(sql, [userId, start_date, end_date], (err, results) => {
      if (err) {
        console.error(`Error querying ${record_type} data:`, err);
        return res.status(500).json({ error: err.message });
      }

      // Format response based on record_type
      if (record_type === 'pill') {
        // Pills: return as an array of prescriptions
        const formattedPills = results.map(pill => {
          // Map intake_status_id to text (e.g., 1 = "on time", 2 = "yesterday", 3 = "not taken")
          const intakeStatus = {
            1: 'taken on time',
            2: 'taken yesterday',
            3: 'not taken'
          }[pill.intake_status_id] || 'unknown';
          
          return {
            pillId: pill.id,
            pillName: pill.name,
            intakeFrequency: pill.intake_no, // "intake_no" from Pill table
            description: pill.description,
            prescribedDate: pill.date_prescribed,
            intakeStatus: intakeStatus,
            date: pill.date_prescribed // Use prescribed date for display
          };
        });
        res.json({ records: formattedPills });
      } else {
        // Date-based records: group by date and nest under resultKey
        const formattedRecords = results.map(row => ({
          date: row[config.dateColumn].toISOString().split('T')[0],
          ...row // e.g., { symptoms: { ... } }
        }));
        res.json({ records: formattedRecords });
      }
    });
  });
});

/**
 * Pill API Endpoints
 */

// Get pill by id
app.put('/api/pills/:id', (req, res) => {
  const pillId = req.params.id;
  const { pillName, intake, description, prescribedDate, intake_status_id } = req.body;
  
  if (!pillName || !intake || !prescribedDate || !intake_status_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    UPDATE pill 
    SET 
      name = ?, 
      intake_no = ?, 
      description = ?, 
      date_prescribed = ?, 
      intake_status_id = ?, 
      last_updated = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  
  db.query(sql, [pillName, intake, description, prescribedDate, intake_status_id, pillId], (err, result) => {
    if (err) {
      console.error('Error updating pill:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pill not found' });
    }
    res.json({ message: 'Pill updated successfully' });
  });
});

// Create new pill
app.post('/api/pills', (req, res) => {
  const { user_id, pillName, intake, description, prescribedDate } = req.body;
  if (!user_id || !pillName || !intake || !prescribedDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const sql = 'INSERT INTO pill (user_id, name, intake_no, description, date_prescribed) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [user_id, pillName, intake, description, prescribedDate], (err, result) => {
    if (err) {
      console.error('Error creating pill:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, message: 'Pill created successfully' });
  });
});

// Update pill
app.put('/api/pills/:id', (req, res) => {
  const pillId = req.params.id;
  const { pillName, intake, description, prescribedDate, intake_status_id } = req.body;
  
  if (!pillName || !intake || !prescribedDate || !intake_status_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    UPDATE pill 
    SET 
      name = ?, 
      intake_no = ?, 
      description = ?, 
      date_prescribed = ?, 
      intake_status_id = ?, 
      last_updated = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  
  const values = [pillName, intake, description, prescribedDate, intake_status_id, pillId];
  console.log('Executing SQL:', sql, 'with values:', values); 

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating pill:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pill not found' });
    }
    res.json({ message: 'Pill updated successfully' });
  });
});

// Delete pill
app.delete('/api/pills/:id', (req, res) => {
  const pillId = req.params.id;
  const sql = 'DELETE FROM pill WHERE id = ?';
  db.query(sql, [pillId], (err, result) => {
    if (err) {
      console.error('Error deleting pill:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pill not found' });
    }
    res.json({ message: 'Pill deleted successfully' });
  });
});


// Add GET endpoint for symptoms by user_id and record_date
app.get('/api/symptoms/:user_id/:record_date', (req, res) => {
  const { user_id, record_date } = req.params;
  const sql = `
    SELECT * FROM symptoms WHERE user_id = ? AND record_date = ?
  `;
  db.query(sql, [user_id, record_date], (err, results) => {
    if (err) {
      console.error('Error fetching symptoms:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No symptoms record found for this date' });
    }
    res.json(results[0]);
  });
});

// Add POST endpoint for symptoms with upsert behavior
app.post('/api/symptoms', (req, res) => {
  const {
    user_id,
    record_date,
    nothing,
    fatigue,
    cramps,
    bloating,
    tenderness,
    mood_swings,
    diarrhea,
    acne,
    headache,
    cravings,
    insomnia,
    itching_dryness
  } = req.body;

  if (!user_id || !record_date) {
    return res.status(400).json({ error: 'user_id and record_date are required' });
  }

  const checkSql = 'SELECT id FROM symptoms WHERE user_id = ? AND record_date = ?';
  db.query(checkSql, [user_id, record_date], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking symptoms record:', checkErr);
      return res.status(500).json({ error: checkErr.message });
    }
    if (checkResults.length > 0) {
      // Update existing record
      const updateSql = `
        UPDATE symptoms SET
          nothing = ?, fatigue = ?, cramps = ?, bloating = ?, tenderness = ?,
          mood_swings = ?, diarrhea = ?, acne = ?, headache = ?, cravings = ?,
          insomnia = ?, itching_dryness = ?
        WHERE user_id = ? AND record_date = ?
      `;
      const updateValues = [
        nothing, fatigue, cramps, bloating, tenderness,
        mood_swings, diarrhea, acne, headache, cravings,
        insomnia, itching_dryness,
        user_id, record_date
      ];
      db.query(updateSql, updateValues, (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating symptoms:', updateErr);
          return res.status(500).json({ error: updateErr.message });
        }
        res.json({ message: 'Symptoms record updated successfully' });
      });
    } else {
      // Insert new record
      const insertSql = `
        INSERT INTO symptoms (
          user_id, record_date, nothing, fatigue, cramps, bloating, tenderness,
          mood_swings, diarrhea, acne, headache, cravings, insomnia, itching_dryness
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const insertValues = [
        user_id, record_date, nothing, fatigue, cramps, bloating, tenderness,
        mood_swings, diarrhea, acne, headache, cravings, insomnia, itching_dryness
      ];
      db.query(insertSql, insertValues, (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error inserting symptoms:', insertErr);
          return res.status(500).json({ error: insertErr.message });
        }
        res.status(201).json({ id: insertResult.insertId, message: 'Symptoms record added successfully' });
      });
    }
  });
});

// Add GET endpoint for menstrual_flow by user_id and record_date
app.get('/api/menstrual_flow/:user_id/:record_date', (req, res) => {
  const { user_id, record_date } = req.params;
  const sql = `
    SELECT * FROM menstrual_flow WHERE user_id = ? AND record_date = ?
  `;
  db.query(sql, [user_id, record_date], (err, results) => {
    if (err) {
      console.error('Error fetching menstrual flow:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No menstrual flow record found for this date' });
    }
    res.json(results[0]);
  });
});

// Add POST endpoint for menstrual_flow with upsert behavior
app.post('/api/menstrual_flow', (req, res) => {
  const {
    user_id,
    record_date,
    light,
    medium,
    heavy,
    blood_clots
  } = req.body;

  if (!user_id || !record_date) {
    return res.status(400).json({ error: 'user_id and record_date are required' });
  }

  const checkSql = 'SELECT id FROM menstrual_flow WHERE user_id = ? AND record_date = ?';
  db.query(checkSql, [user_id, record_date], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking menstrual flow record:', checkErr);
      return res.status(500).json({ error: checkErr.message });
    }
    if (checkResults.length > 0) {
      // Update existing record
      const updateSql = `
        UPDATE menstrual_flow SET
          light = ?, medium = ?, heavy = ?, blood_clots = ?
        WHERE user_id = ? AND record_date = ?
      `;
      const updateValues = [
        light, medium, heavy, blood_clots,
        user_id, record_date
      ];
      db.query(updateSql, updateValues, (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating menstrual flow:', updateErr);
          return res.status(500).json({ error: updateErr.message });
        }
        res.json({ message: 'Menstrual flow record updated successfully' });
      });
    } else {
      // Insert new record
      const insertSql = `
        INSERT INTO menstrual_flow (
          user_id, record_date, light, medium, heavy, blood_clots
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      const insertValues = [
        user_id, record_date, light, medium, heavy, blood_clots
      ];
      db.query(insertSql, insertValues, (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error inserting menstrual flow:', insertErr);
          return res.status(500).json({ error: insertErr.message });
        }
        res.status(201).json({ id: insertResult.insertId, message: 'Menstrual flow record added successfully' });
      });
    }
  });
});

// Add GET endpoint for vaginal_discharge by user_id and record_date
app.get('/api/vaginal_discharge/:user_id/:record_date', (req, res) => {
  const { user_id, record_date } = req.params;
  const sql = `
    SELECT * FROM vaginal_discharge WHERE user_id = ? AND record_date = ?
  `;
  db.query(sql, [user_id, record_date], (err, results) => {
    if (err) {
      console.error('Error fetching vaginal discharge:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No vaginal discharge record found for this date' });
    }
    res.json(results[0]);
  });
});

// Add POST endpoint for vaginal_discharge with upsert behavior
app.post('/api/vaginal_discharge', (req, res) => {
  const {
    user_id,
    record_date,
    none,
    egg_white,
    watery,
    sticky,
    creamy,
    spotting,
    clumpy_whites,
    unusual,
    gray
  } = req.body;

  if (!user_id || !record_date) {
    return res.status(400).json({ error: 'user_id and record_date are required' });
  }

  const checkSql = 'SELECT id FROM vaginal_discharge WHERE user_id = ? AND record_date = ?';
  db.query(checkSql, [user_id, record_date], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking vaginal discharge record:', checkErr);
      return res.status(500).json({ error: checkErr.message });
    }
    if (checkResults.length > 0) {
      // Update existing record
      const updateSql = `
        UPDATE vaginal_discharge SET
          none = ?, egg_white = ?, watery = ?, sticky = ?, creamy = ?,
          spotting = ?, clumpy_whites = ?, unusual = ?, gray = ?
        WHERE user_id = ? AND record_date = ?
      `;
      const updateValues = [
        none, egg_white, watery, sticky, creamy,
        spotting, clumpy_whites, unusual, gray,
        user_id, record_date
      ];
      db.query(updateSql, updateValues, (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating vaginal discharge:', updateErr);
          return res.status(500).json({ error: updateErr.message });
        }
        res.json({ message: 'Vaginal discharge record updated successfully' });
      });
    } else {
      // Insert new record
      const insertSql = `
        INSERT INTO vaginal_discharge (
          user_id, record_date, none, egg_white, watery, sticky, creamy,
          spotting, clumpy_whites, unusual, gray
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const insertValues = [
        user_id, record_date, none, egg_white, watery, sticky, creamy,
        spotting, clumpy_whites, unusual, gray
      ];
      db.query(insertSql, insertValues, (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error inserting vaginal discharge:', insertErr);
          return res.status(500).json({ error: insertErr.message });
        }
        res.status(201).json({ id: insertResult.insertId, message: 'Vaginal discharge record added successfully' });
      });
    }
  });
});

app.put('/api/user_periods/update-start-date', (req, res) => {
  const { user_id, start_date } = req.body;
  if (!user_id || !start_date) {
    return res.status(400).json({ error: 'user_id and start_date are required' });
  }

  // Update the start_date of the latest period record for the user
  const sql = `
    UPDATE user_periods
    SET start_date = ?
    WHERE user_id = ? AND start_date = (
      SELECT start_date FROM (
        SELECT start_date FROM user_periods WHERE user_id = ? ORDER BY start_date DESC LIMIT 1
      ) AS subquery
    )
  `;

  db.query(sql, [start_date, user_id, user_id], (err, result) => {
    if (err) {
      console.error('Error updating period start date:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No period record found to update' });
    }
    res.json({ message: 'Period start date updated successfully' });
  });
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
