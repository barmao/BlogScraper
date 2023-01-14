var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
const  redis = require('redis');
const  client = redis.createClient();
const pretty = require("pretty");
const rssParser = require('rss-parser');

client.on("error", function(error) {
  console.error(error);
});


require('dotenv').config();  

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post('/signup', (req, res) => {
  const { email } = req.body;
  client.sadd('emails', email);
  res.send(`${email} has been signed up`);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const websites = [
  'https://engineering.linkedin.com/blog.rss.html'
];

const {EMAIL_USER} = process.env;
const {EMAIL_PASS} = process.env;
const {EMAIL_FROM} = process.env;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});


const sendEmail = (email, blog) => {
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'Blog Recommendations',
    text: `Here are your daily blog recommendations: ${blog.title} - ${blog.link}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

const scrapeBlogs = () => {
  websites.forEach(website => {
    const parser = new rssParser();
    parser.parseURL(website, (err, feed) => {
      if (!err) {
        feed.items.forEach(item => {
          client.sadd('blogs', JSON.stringify({ title: item.title, link: item.link }));
        });
      }
    });
  });
};

const sendRecommendations = () => {
  client.smembers('emails', (err, emails) => {
    emails.forEach(email => {
      for (let i = 0; i < 5; i++) {
        client.spop('blogs', (err, blog) => {
          if (blog) {
            const parsedBlog = JSON.parse(blog);
            sendEmail(email, parsedBlog);
            client.sadd(`${email}_blogs`, JSON.stringify(parsedBlog));
          }
        });
      }
    });
  });
};

scrapeBlogs();
setInterval(sendRecommendations, 30000); // sends email every day

module.exports = app;
