// server.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passportSetup = require('./auth');  // Changed variable name to avoid conflict
// require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passportSetup.initialize());
app.use(passportSetup.session());

// Auth middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

// Routes
app.get('/', (req, res) => {
    res.send('Authentication server running');
});

app.get('/auth/google',
    passportSetup.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/google/callback',
    passportSetup.authenticate('google', { failureRedirect: '/login-failed' }),
    (req, res) => {
        res.redirect(process.env.CLIENT_URL);
    }
);

app.get('/auth/status', (req, res) => {
    res.json({
        authenticated: req.isAuthenticated(),
        user: req.user
    });
});

// Protected route example
app.get('/api/protected', isAuthenticated, (req, res) => {
    res.json({
        message: 'This is protected data',
        user: req.user
    });
});

app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.json({ message: 'Logged out successfully' });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

