const {Router} = require('express');
const multer = require('multer');
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads/`));
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
});

const upload = multer({ storage: storage });

const express = require('express');
const app = express();
const session = require('express-session');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

router.get('/add-new', (req,res) => {
    return res.render('addBlog', {
        user: req.user,
        user:req.session.user
    });
});

router.post('/', upload.single("coverImage"), async (req,res) => {
    const{ title, body, date } = req.body;
    const blog = await Blog.create({
        body,
        date,
        title,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`
    });
    return res.redirect(`/blog/${blog._id}`);
});

router.get('/:id', async (req,res) => {
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');
    return res.render('blog', {
        blog,
        user: req.user,
        comments,
        user:req.session.user
    });
});

router.post('/comment/:blogId',async (req,res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;