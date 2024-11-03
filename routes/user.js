const {Router} = require('express');
const User = require('../models/user');


const router = Router();

router.get('/signin', (req,res) => {
    return res.render('signin');
});

router.get('/signup', (req,res) => {
    return res.render('signup');
});

router.post('/signup', async (req,res) => {
    const {fullName, email, password} = req.body;
    await User.create({
        fullName,
        email,
        password,
    });
    return res.redirect('/');
});
const express = require('express');
const app = express();
const session = require('express-session');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

router.post('/signin', async (req,res) => {
    const { email, password } = req.body;
    const user = await User.findOne({email});
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        req.session.user = user; 
        return res.cookie('token', token).redirect('/');
    } catch (error) {
        // console.error(error);
        return res.render("signin", {error: "Invalid email or password"});
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.redirect('/'); // Handle error appropriately
        }
        res.clearCookie("token"); // Clear the token cookie
        return res.redirect('/'); // Redirect after logout
    });
});


module.exports = router;