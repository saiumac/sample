const express = require('express');
const multer = require('multer');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const newsRouter = require('./routes/newsRoutes');
const userRouter = require('./routes/userRoutes');
const likesRouter = require('./routes/likesRoutes');
const dislikesRouter = require('./routes/dislikeRoutes');
const languageRouter = require('./routes/languageRoutes');
const placeRouter = require('./routes/placeRoutes');
const locationRouter = require('./routes/locationRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const contactusRouter = require('./routes/contactusRoutes');
const commentRouter = require('./routes/commentRoutes');
const subcommentRouter = require('./routes/subcommentRoutes');
const feedbackRouter = require('./routes/feedbackRoutes');
const allRouter = require('./routes/allRoutes');
const sightsRoutes = require('./routes/sightsRoutes');
const notificationsRouter = require('./routes/notificationsRoutes');
const dashBoardRouter = require('./routes/dashBoardRoutes');
const storiesRoutes = require('./routes/storiesRoutes');

dotenv.config({ path: './config.env' });

const app = express();

// const formdataParser = multer().fields([])

// app.use(formdataParser)


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors({ origin: "*" }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/public', express.static(__dirname + '/public'));

app.use('/api/v1/news', newsRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/like', likesRouter);
app.use('/api/v1/dislike', dislikesRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/subcomment', subcommentRouter);
app.use('/api/v1/languages', languageRouter);
app.use('/api/v1/places', placeRouter);
app.use('/api/v1/locations', locationRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/contactus', contactusRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1', allRouter);
app.use('/api/v1/sights', sightsRoutes);
app.use('/api/v1/dashBoard', dashBoardRouter);
app.use('/api/v1/stories', storiesRoutes);


app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

const DB = process.env.DATABASE

// Connect to database
mongoose.connect(DB)
    .then(() => { console.log("Successfully connected to database") })
    .catch(error => {
        console.log("[-] Mongoose error")
        console.log(error)
    })

const port = 7072;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
})
const TZ = 'Asia/Calcutta';
const now = moment.tz(Date.now(), TZ);

const formattedDate = now.format("YYYY-MM-DD hh:mm:ss A");

console.log(formattedDate);

app.get('/', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, Welcome to Quick2News!\n');
});

app.listen(port, () => {
  console.log(`app is running on the port ${port}`);
});
