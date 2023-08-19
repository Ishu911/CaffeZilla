if(process.env.NODE_ENV !=="production"){
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Joi = require("joi");
const Campground = require("./models/campground");
const Review = require("./models/review");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const {campgroundSchema, reviewSchema} = require("./schemas.js");
const catchAsync = require("./utils/CatchAsync");
const ExpressError = require("./utils/ExpressError");
const campgrounds = require("./router/campgrounds");
const reviews = require("./router/reviews");
const userRoute = require("./router/users");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const dbUrl = process.env.DB_URL;
const MongoStore = require('connect-mongo')(session);


mongoose.connect( dbUrl || 'mongodb://127.0.0.1/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", ()=>{
    console.log("database connected")
});


const app = express();
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(mongoSanitize());


const store = new MongoStore({
    url : dbUrl,
    secret : "myfirstsecretforsession",
    touchAfter : 24 * 60 * 60
});

store.on("error", function(){
    console.log("ohh noo session error");
})

const sessionConfig ={
    store,
    name: "session",
    secret : "myfirstsecretforsession",
    resave : false,
    saveUninitialized : true,
    
    cookie:{
        httpOnly : true,
        // secure: true;
        expires : Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge : 1000 * 60 * 60 *24 * 7
    }
    
}
app.use(session(sessionConfig));
app.use(flash());

app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgkgn6mce/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next)=>{

    res.locals.currentUser = req.user;
    res.locals.success  = req.flash("success");
    res.locals.error  = req.flash("error");
    next();
})




app.use("/cafes", campgrounds);
app.use("/cafes/:id/reviews", reviews);
app.use("/", userRoute);
app.use(express.static(path.join(__dirname,"public")));


app.get("/", (req, res)=>{
    res.render("home");
});


app.all("*", (req, res, next)=>{
    next( new ExpressError("Page Not Found!", 404));
});

app.use((err, req, res, next)=>{
    const {statusCode = 500, message="Something went wrong"} = err;
    res.status(statusCode).render("error", {statusCode, message, err});
});

app.listen(3000, ()=>{
    // console.log("jai shree ganesha");
});