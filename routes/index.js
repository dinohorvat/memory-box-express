var express = require('express');
var router = express.Router();
var wifi = require('node-wifi');
const simpleGit = require('simple-git');
var piWifi = require('pi-wifi');
var request = require('request');

wifi.init({
  iface : null // network interface, choose a random wifi interface if set to null
});

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
  console.log('wifiSetup');
  const { spawn } = require('child_process');
  const pyProg = spawn('python', ['/home/pi/jp/SmartPlay/pythons/WifiAuto.py']);
  console.log('pass');

  pyProg.stdout.on('data', function(data) {
    console.log(data.toString());
    res.send({data: data.toString(), success: true});
    res.end('end');
  });
});

/* SETUP wifi auto script. */
router.get('/updateApp', (req, res) => {
  require('simple-git')()
      .exec(() => console.log('Starting pull...'))
      .pull((err, update) => {
        if(update && update.summary.changes > 0) {
          res.send({updated: true})
        }
        res.send({updated: false})
      })
      .exec(() => console.log('Pull done.'));
});

router.get('/isRunning', (req, res) => {
  res.send({success: true});
});

/* SETUP wifi auto script. */
router.get('/wifiNetworks', (req, res) => {
  wifi.scan(function(err, networks) {
    if (err) {
      console.log(err);
    } else {
      console.log(networks);
      res.send({data: networks, success: true});
    }
  });
});

router.post('/connectWifi',  (req, res) => {
  let wifiInfo = req.body;

//A simple connection
  piWifi.connect(wifiInfo.ssid, wifiInfo.password, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log('Successful connection!');
    piWifi.status('wlan0', function(err, status) {
      if (err) {
        return console.error(err.message);
      }
      console.log(status);
      const ip = status.ip;
      const mac = status.mac;

      console.log('http://67.227.156.25/memorybox/read.php?serial='+mac+'&wlan0=' + ip);
      request.post(
          'http://67.227.156.25/memorybox/read.php?serial='+mac+'&wlan0=' + ip,
          { json: { } },
          function (error, response, body) {
            console.log(body);
            res.send({mac: mac, ip: ip});
          }
      );
    });
  });
//   wifi.connect({ ssid : wifiInfo.ssid, password : wifiInfo.password}, function(err) {
//     if (err) {
//       console.log(err);
//     }
//     console.log('Connected');
//     res.send({success: true})
//   });
});
module.exports = router;
