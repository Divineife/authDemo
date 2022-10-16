const { application } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path");
const User = require('./models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/authDemo', { useNewUrlParser: true})
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", ()=> {
        console.log("Database connected");
    });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(session({secret: 'Not a good secret'}));

const requireLogin = (req, res, next) => {
    if(!req.session.user_id){
        return res.redirect('/login')
    }
    next();
}

app.get('/', (req, res)=>{
    res.send('This is the homepage')
})

app.get('/register', (req, res)=>{
    res.render('register')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.post('/register', async(req, res)=>{
    const {password, username} = req.body; 
    const user = new User({username,password})
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/');
})

app.post('/logout', (req,res)=>{
    req.session.user_id = null;
    res.redirect('/login')
})

app.post('/login',async(req, res)=>{
    const {password, username} = req.body;
    const foundUser = await User.findAndValidate(username, password)
    if(foundUser){
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    }else{
        res.redirect('/login');
    }
})

app.get('/secret', requireLogin, (req, res)=>{
    res.render("secret")
})

app.listen(3000,()=>{
    console.log('Serving your app')
})