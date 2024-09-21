require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const expressSession = require('express-session');
const mongoose = require('mongoose');

const connectDB = require('./server/config/db')
const { isActiveRoute } =  require('./server/helpers/routeHelpers');

//connnect to DB
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
}))



// Templating engine
app.use(expressLayout);
app.set('layout', './layouts/main')
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require("./server/routes/main"));
app.use('/', require("./server/routes/admin"));

const PORT = 3000 || process.env.PORT; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});