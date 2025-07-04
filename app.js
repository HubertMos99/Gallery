var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// import routers - zadania temat8
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// import routers - zadania temat9
var galleriesRouter = require('./routes/galleries');
var imagesRouter = require('./routes/images');
var statsRouter = require('./routes/stats');
const imageRouter = require('./routes/images');

// app object
var app = express();
app.use(cookieParser());

const jwt = require("jsonwebtoken");

app.use((req, res, next) => {
  const token = req.cookies.mytoken;
  if (token) {
    try {
      const decoded = jwt.verify(token, 'kodSzyfrujacy');
      req.loggedUser = decoded.username;
    } catch (err) {
      req.loggedUser = null;
    }
  } else {
    req.loggedUser = null;
  }

  res.locals.loggedUser = req.loggedUser; // dostępne w PUG
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/galleries', express.static(path.join(__dirname, 'public/images')));

// use routers - zadania temat8
app.use('/', indexRouter);
app.use('/users', usersRouter);

// use routers - zadania temat9
app.use('/galleries', galleriesRouter);
app.use('/images', imagesRouter);
app.use('/stats', statsRouter);
app.use('/images', imageRouter);


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

// MongoDB/Mongoose connection setup...
const mongoose = require("mongoose");

// blokuje wyświetlanie warningów w przypadku pewnych zapytań nie do końca zgodnych ze zdefiniowanymi schematami
mongoose.set("strictQuery", false);

const mongoDB = "mongodb://localhost:27017/GalleryDB";

async function main() {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

// synchronicznie
// function main() {
//   mongoose.connect(mongoDB);
// }
// main();
// ...MongoDB/Mongoose connection setup

module.exports = app;
