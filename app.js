require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const User = require('./models/user');
const Blog = require('./models/blog');

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');

const { checkForAuthenticationCookie } = require('./middlewares/authentication');

const app = express();
const PORT = process.env.PORT || 8000;

mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => console.log("MongoDB connectet"));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')));

const session = require('express-session');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));
app.get('/', async (req, res) => {
    const allBlogs = await Blog.find({}).sort("createdAt");
    const user = req.session.user;
    // const name = await User.find({});
    res.render("home", {
        user: req.user,
        blogs: allBlogs,
        user
    });
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);
app.listen(PORT,() => console.log(`Server Started at PORT: ${PORT}`));