var express = require('express');
var router = express.Router();
var wifi = require('node-wifi');

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
router.get('/wifiNetworks', (req, res) => {

  wifi.scan(function(err, networks) {
    if (err) {
      console.log(err);
    } else {
      console.log(networks);
      res.send({data: networks, success: true});
      /*
      networks = [
          {
            ssid: '...',
            bssid: '...',
            mac: '...', // equals to bssid (for retrocompatibility)
            channel: <number>,
            frequency: <number>, // in MHz
            signal_level: <number>, // in dB
            quality: <number>, // same as signal level but in %
            security: 'WPA WPA2' // format depending on locale for open networks in Windows
            security_flags: '...' // encryption protocols (format currently depending of the OS)
            mode: '...' // network mode like Infra (format currently depending of the OS)
          },
          ...
      ];
      */
    }
  });
});

module.exports = router;
