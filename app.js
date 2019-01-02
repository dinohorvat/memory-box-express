var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socket_io = require( "socket.io" );
const fileUpload = require('express-fileupload');

var app = express();
var serveIndex = require('serve-index');

// Socket.io
var io = socket_io();
app.io = io;

/* GLOBAL VARIABLES */
mediaPathUSB = '';
directoryRoot = '';
/* !! END GLOBAL VARIABLES */

// Routes
var indexRouter = require('./routes/index');
var albumsRouter = require('./routes/albums');
var mediaRouter = require('./routes/media');
var devicesRouter = require('./routes/devices');
var playlistRouter = require('./routes/playlist')(io);

app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static('assets/data'), serveIndex('assets/data', {'icons': true}))

app.use('/', indexRouter);
app.use('/albums', albumsRouter);
app.use('/media', mediaRouter);
app.use('/devices', devicesRouter);
app.use('/playlist', playlistRouter);

// socket.io events
io.on( "connection", function( socket )
{
  console.log( "A user connected" );
  socket.emit('playlist');
});

module.exports = app;
