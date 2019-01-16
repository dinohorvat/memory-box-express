module.exports = function(io) {
    var app = require('express');
    var router = app.Router();
    var fs = require('fs-extra');
    var path = require('path');
    cmd = require('node-cmd');

    var vlcXmlStart = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<playlist xmlns="http://xspf.org/ns/0/" xmlns:vlc="http://www.videolan.org/vlc/playlist/ns/0/" version="1">\n' +
        '        <title>Playlist</title>\n' +
        '        <trackList>\n';

    var vlcXmlEnd = '        </trackList>\n' +
        '</playlist>';

    /* SocetIO Browser Soltuion */
    // router.post('/', function (req, res) {
    //     let body = req.body; // type: photo | video, path: string

        // let obj = [
        //     {type: 'photo', path:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Zagreb_%2829255640143%29.jpg/365px-Zagreb_%2829255640143%29.jpg'},
        //     {type: 'video', path: 'https://mdbootstrap.com/img/video/Lines-min.mp4'},
        //     {type: 'photo', path:'https://www.foreo.com/mysa/wp-content/uploads/sites/2/2017/09/FOREO_MYSA_Zagreb-City_Guide_170922-850x477.jpg'},
        //     {type: 'photo',path:'https://www.zagreb.com/media/img/zagreb/activities/main-activity-3.jpg'}
        // ];
    //     io.sockets.emit('playlist', body);
    //     res.send(body);
    // });
    router.post('/', function (req, res) {
        let spawn = require('child_process').spawn;
        // let vlc = spawn('vlc' ,    {env: {DISPLAY: '0'}});
        let vlc = spawn('vlc' ,    ['/home/pi/jp/SmartPlay/assets/data/tempPlaylist/tempPlaylist.xspf']);

        // { env: DISPLAY: displayEnv }
        vlc.stderr.on('data', function(data) {
            console.log(data.toString());
        });

        vlc.on('exit', function(code){
            console.log('Exit code: ' + code);
            //EXIT TEST HERE
        });

        res.send({success: true})

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
        let playlistData = '';
        let playlistDataStart = vlcXmlStart;
        let playlistDataEnd = vlcXmlEnd;
        playlistData = playlistDataStart;
        let selectedFiles = req.body;
        fs.removeSync('/home/pi/jp/SmartPlay/assets/data/tempPlaylist');
        fs.ensureDirSync('/home/pi/jp/SmartPlay/assets/data/tempPlaylist', 0o777);

        for (let i = 0; i < selectedFiles.length; i++) {
            console.log('Starting creating temp playlist...');
            fs.copyFileSync(selectedFiles[i].path, '/home/pi/jp/SmartPlay/assets/data/tempPlaylist/'+selectedFiles[i].name, (err) => {
                if (err) {
                    console.log('error');
                    console.log(err);
                    res.send('error');
                }
            });
            console.log('File was copied to destination');
            playlistData += '                <track>\n' +
                '                        <location>file:///home/pi/jp/SmartPlay/assets/data/tempPlaylist/' + selectedFiles[i].name + '</location>\n' +
                '                        <duration>10000</duration>\n' +
                '                </track>\n';
        }
        playlistData += playlistDataEnd;
        fs.writeFile('/home/pi/jp/SmartPlay/assets/data/tempPlaylist/tempPlaylist.xspf', playlistData, function(err, data){
            if (err) console.log(err);
            console.log("Successfully Written to File.");
        });
        console.log('Asyncs done');
        res.send({success: true});
    });


    return router;
};


