    let app = require('express');
    let router = app.Router();
    let fs = require('fs-extra');
    let path = require('path');
    let cmd = require('node-cmd');
    OmxManager = require('omx-manager')
    let appPath = '/home/pi/jp/SmartPlay';
    let splashImage = appPath + '/assets/logosmartplay.png';
    let isImage = require('is-image');

    let mediaList = [];
    let mediaDuration = -1;
    let mediaDisplayImage;
    let mediaType = 'r3' +
        'q- -o' +
        '§';
    let mediaPlayingStatus = 'Stop'; // Start/Play/Pause
    let playingMediaThumbnailPath = '';
    let manager = new OmxManager();
    let player;

    router.post('/init', function (req, res) {
        console.log('init');
        initScreen();
        res.send(true)
    });
    router.post('/file/pause', function(req, res) {
        console.log('request: pause');
        if(player != null)
        {
            if(mediaPlayingStatus === 'Pause')
                mediaPlayingStatus = 'Play';
            else
            {
                mediaPlayingStatus = 'Pause';
                playingMediaThumbnailPath = 'logosmartplaypause.png';
            }

            if(mediaType === 'video')
            {
                let status = player.getStatus();
                if(status.playing)
                    player.pause();
                else
                    player.play();
            }
        }
        res.sendStatus(200);
    });

    router.post('/file/play', function(req, res) {
        console.log('request: play');
        if(player != null)
        {
            mediaPlayingStatus = 'Play';
            if(mediaType === 'video')
            {
                player.pause();
            }
        }
        res.sendStatus(200);
    });

    router.post('/file/stop', function(req, res) {
        console.log('request: stop');
        stopMedia();
        initScreen();

        playingMediaThumbnailPath = 'logosmartplaystop.png';
        res.sendStatus(200);

    });


    router.post('/file/next', function(req, res) {
        console.log('request: next');
        if(player != null)
        {
            if(mediaPlayingStatus !== 'Stop')
            {
                stopMedia();

                sleep.msleep(500);

                mediaPlayingStatus = 'Start';
                if(mediaType === 'image')
                    playMedia();
//			mediaPlayingStatus = 'Start';
//			let newMediaType = 'video'
//			if(isImage(mediaList[0].file))
//			    newMediaType = 'image'
//			console.log(newMediaType);

//			if(mediaType === 'image' && newMediaType === 'image')
//			    playMedia();		
            }else
                playMedia();
        }

        res.sendStatus(200);
    });

    router.post('/file/previous', function(req, res) {
        console.log('request: previous');
        if(player != null)
        {
            let file = mediaList.pop();
            mediaList.unshift(file);

            if(mediaPlayingStatus != 'Stop')
            {
                stopMedia();

                sleep.msleep(500);

                mediaPlayingStatus = 'Start';
                if(mediaType === 'image')
                    playMedia();
//			let newMediaType = 'video'
//			if(isImage(mediaList[0].file))
//			    newMediaType = 'image'
//			if(mediaType === 'image' && newMediaType === 'image')
//			    playMedia();		
            }else
                playMedia();
        }

        res.sendStatus(200);
    });

    function stopMedia()
    {
        console.log('stopMedia');
//    keysender.sendKey('escape')

        if(player != null && mediaPlayingStatus != 'Stop')
        {
            clearTimeout(mediaDisplayImage);

            mediaPlayingStatus = 'Stop';
            /*        if(mediaType === 'image')	
                {
                    cmd.get('pkill -9 omx');
            //	    keysender.sendKey('escape');
                }else if(mediaType === 'video')
                {
                    player.stop();
                }
            */    }
        console.log('killed omx');
        cmd.get('pkill -9 omx');
    }

    function playMedia()
    {
        console.log('playMedia');
        if(mediaList.length < 1)
            return;

        let file = mediaList.shift();
        mediaList.push(file);

//    console.log(file);

        player = manager.create(file.file, {'-o':'alsa', '-b':true});

        mediaPlayingStatus = 'Start';

        console.log('play : ' + file.file);
        playingMediaThumbnailPath = new Buffer(file.file.split(mediaPathUSB + '/').pop()).toString('base64') + '.png';

        if(isImage(file.file))
        {
            mediaType = 'image';
            console.log('display a image');
            displayImage(file);
        }else
        {

            mediaType = 'video'
            console.log('play a video');
            player.play();

            player.on('end', function(video)
            {
                console.log('end of paying a video');
                if(mediaPlayingStatus != 'Stop')
                    playMedia();
            });

        }
    }

    function displayImage(file)
    {
        console.log('displayImage');
        let fn = file.file;
        mediaDuration = file.duration;

        if(mediaPlayingStatus != 'Pause')
        {
            playingMediaThumbnailPath = new Buffer(fn.split(mediaPathUSB + '/').pop()).toString('base64') + '.png';
            cmd.get('omxiv --blank --duration 300 ' + fn);
        }else
            playingMediaThumbnailPath = 'logosmartplaypause.png';

        clearTimeout(mediaDisplayImage);

        mediaDisplayImage = setTimeout(function(){
            if(mediaPlayingStatus != 'Pause')
            {
                console.log('pkilled of omxiv');
                cmd.get('pkill -9 omxiv');
                if(mediaPlayingStatus != 'Stop')
                {
                    playMedia();
                }
//		keysender.sendKey('escape');
            }else
            {
                displayImage(file);
            }

        }, mediaDuration * 1000);

    }

    // Setting up the background screen for omx image viewer
    function initScreen()
    {
        cmd.get('omxiv -b ' + splashImage);
    }

    module.exports = router;


