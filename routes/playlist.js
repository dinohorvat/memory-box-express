module.exports = function(io) {
    var app = require('express');
    var router = app.Router();
    var fs = require('fs-extra');
    var path = require('path');

    /* GET current playlist files. */
    router.post('/', function (req, res) {
        let body = req.body; // type: photo | video, path: string

        // let obj = [
        //     {type: 'photo', path:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Zagreb_%2829255640143%29.jpg/365px-Zagreb_%2829255640143%29.jpg'},
        //     {type: 'video', path: 'https://mdbootstrap.com/img/video/Lines-min.mp4'},
        //     {type: 'photo', path:'https://www.foreo.com/mysa/wp-content/uploads/sites/2/2017/09/FOREO_MYSA_Zagreb-City_Guide_170922-850x477.jpg'},
        //     {type: 'photo',path:'https://www.zagreb.com/media/img/zagreb/activities/main-activity-3.jpg'}
        // ];
        io.sockets.emit('playlist', body);
        res.send(body);
    });

    router.get('/next', function (req, res) {
        io.sockets.emit('next', true);
        res.send({success: true});
    });
    router.get('/prev', function (req, res) {
        io.sockets.emit('prev', true);
        res.send({success: true});
    });

    router.get('/play', function (req, res) {
        io.sockets.emit('play', true);
        res.send({success: true});
    });
    router.get('/stop', function (req, res) {
        io.sockets.emit('stop', true);
        res.send({success: true});
    });
    router.get('/pause', function (req, res) {
        io.sockets.emit('pause', true);
        res.send({success: true});
    });

    /* GET current playlist files. */
    router.post('/createTemp', function (req, res) {
        let selectedFiles = req.body;
        fs.removeSync('/home/pi/jp/SmartPlay/express-server/assets/data/tempPlaylist');
        fs.ensureDirSync('/home/pi/jp/SmartPlay/express-server/assets/data/tempPlaylist', err => {
            console.log(err) // => null
        });

        for (let i = 0; i < selectedFiles.length; i++) {
            console.log('Starting creating temp playlist...');
            fs.copyFileSync(selectedFiles[i].path, '/home/pi/jp/SmartPlay/express-server/assets/data/tempPlaylist/'+selectedFiles[i].name, (err) => {
                if (err) {
                    console.log('error');
                    console.log(err);
                    res.send('error');
                }
                console.log('File was copied to destination');
            });
        }
        console.log('Async done');
        res.send({success: true});
    });

    return router;
};


