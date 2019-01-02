var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });;
  console.log('emitted');
});

router.post('/connect/:pin', function (req, res) {
  console.log('reading pin');
  fs.readFile('/home/pi/jp/SmartPlay/device_configuration/pin.conf', 'utf8', function (err, data) {
    console.log("Pin=" + req.params.pin);
    console.log(data);
    if (req.params.pin === data) {
      res.send({success: true});
    } else{
      res.send({success: false});
    }
  });

});

// io.on('connection', function (socket) {
//   socket.emit('title', { title: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });

/* SETUP wifi auto script. */
router.get('/wifi', (req, res) => {
  const { spawn } = require('child_process');
  const pyProg = spawn('python', ['/home/pi/jp/SmartPlay/pythons/WifiAuto.py']);

  pyProg.stdout.on('data', function(data) {
    console.log(data);
    res.send({data: data, success: true});
    res.end('end');
    return;
  });
});

module.exports = router;
