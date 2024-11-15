const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('./auth');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

require('dotenv').config();//comment this while deploying it on cloud...

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Auth middleware to verify JWT
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Helper functions to read and write JSON files
const readJSON = (fileName) => {
    const filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(filePath));
};

const writeJSON = (fileName, data) => {
    fs.writeFileSync(path.join(__dirname, fileName), JSON.stringify(data, null, 2));
};

// Routes
app.get('/', (req, res) => {
    res.send('JWT and Google OAuth Authentication server running');
});

// Signup route
app.post('/auth/signup', async (req, res) => {
    const { username, password } = req.body;
    const users = readJSON('users.json');

    // Check if user already exists
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user
    users.push({ username, password: hashedPassword });
    writeJSON('users.json', users);

    res.status(201).json({ message: 'User created' });
});

// Signin route
app.post('/auth/signin', async (req, res) => {
    const { username, password } = req.body;
    const users = readJSON('users.json');

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Logged in successfully' });
});

// Google OAuth routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        const token = jwt.sign({ id: req.user.id, email: req.user.emails[0].value }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect(process.env.CLIENT_URL);
    }
);

app.get('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

// Get all courses
app.get('/courses', authenticateJWT, (req, res) => {
    const courses = readJSON('courses.json');
    res.json(courses);
});

// Get a specific course by ID
app.get('/course/:id', authenticateJWT, (req, res) => {
    const courses = readJSON('courses.json');
    const course = courses.find(c => c.id === req.params.id);
    if (course) {
        res.json(course);
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
});

// Add a new course
app.post('/course', authenticateJWT, (req, res) => {
    const courses = readJSON('courses.json');
    const newCourse = {
        id: Date.now().toString(), // Simple unique ID
        title: req.body.title,
        details: req.body.details,
        semester: req.body.semester,
        enrollStatus: req.body.enrollStatus || false,
    };
    courses.push(newCourse);
    writeJSON('courses.json', courses);
    res.status(201).json(newCourse);
});

// Update an existing course
app.put('/course/:id', authenticateJWT, (req, res) => {
    const courses = readJSON('courses.json');
    const index = courses.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        courses[index] = {
            ...courses[index],
            title: req.body.title,
            details: req.body.details,
            semester: req.body.semester,
            enrollStatus: req.body.enrollStatus,
        };
        writeJSON('courses.json', courses);
        res.json(courses[index]);
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
});

// Delete a course
app.delete('/course/:id', authenticateJWT, (req, res) => {
    let courses = readJSON('courses.json');
    const index = courses.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        const deletedCourse = courses.splice(index, 1);
        writeJSON('courses.json', courses);
        res.json(deletedCourse[0]);
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
