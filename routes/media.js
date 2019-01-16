var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var archiver = require('archiver');
var dateFormat = require('dateformat');
var thumb = require('node-thumbnail').thumb;
var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var execSync = require('child_process').execSync;

// 3rd party packages
var dirTree = require("directory-tree");

/* GET media files. */
router.get('/', function (req, res) {
    let albumRoot = dirTree(mediaPathUSB, {
        extensions: /\.(|mp4|jpg|JPG|png|jpeg|avi|mov)$/
    });
    res.send(albumRoot);
});


router.post('/files', function (req, res) {
    var walk = function (dir, parent) {
        var results = [];
        var list = fs.readdirSync(dir);
        list.forEach(function (file) {
            if (file.startsWith('.')) {
                return;
            }
            var pass = /\.(|mp4|JPG|jpg|png|jpeg|avi|mov)$/.test(file);
            var imagePass = /\.(|JPG|jpg|png|jpeg)$/.test(file);
            var videoPass = /\.(|mp4|avi|mov)$/.test(file);

            if (!pass) {
                return;
            }
            let _fileName = file;
            file = dir + '/' + file;
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                /* Recurse into a subdirectory */
                results = results.concat(walk(file, true));
            } else {
                console.log(file);
                let fileName = /[^/]*$/.exec(file)[0];
                let _file = {
                    isFolder: false,
                    name: fileName,
                    selected: false,
                    parent: "root",
                    videoPath: '',
                    path: file
                };
                if (videoPass) {
                    console.log('videoPassss');
                    console.log(fileName);
                    let tempFileName = path.parse(fileName).name;
                    console.log(tempFileName);
                    if (fs.existsSync('/home/pi/jp/SmartPlay/assets/data/mediaThumbs/' + tempFileName +'.png')) {
                        // Do something
                        console.log('File exists');
                    }
                    else {
                        console.log('Creating thumbnai');
                        execSync('ffmpeg -i ' + file + ' -ss 00:00:02 -vframes 1 ' +
                            '/home/pi/jp/SmartPlay/assets/data/mediaThumbs/' + tempFileName +'.png');
                    }
                    _file.videoPath = '/data/mediaThumbs/' + tempFileName +'.png';
                        // ffmpeg(file)
                        //     .on('end', function () {
                        //         console.log('Screenshots taken');
                        //     })
                        //     .screenshots({
                        //         count: 1,
                        //         filename: tempFileName + '.png',
                        //         folder: '/home/pi/jp/SmartPlay/assets/mediaThumbs'
                        //     });
                }
                /* Is a file */
                results.push(_file);
            }
        });
        return results;
    };
    if (!mediaPathUSB) {
        res.send([]);
    }
    let body = req.body;
    if (body.specific) {
        var fileList = walk(body.mediaPath, false);
    }
    else {
        var fileList = walk(mediaPathUSB, false);
    }
    res.send(fileList);
});

router.post('/upload', function (req, res) {
    console.log('upload');
    console.log(req.files);
    let file = req.files.mediaFile;
    console.log(mediaPathUSB + '/' + file.name)
    file.mv(mediaPathUSB + '/' + file.name, function (err) {
        if (err)
            return res.status(500).send(err);
        res.send({success: true});
    });
});

router.post('/download', function(req, res){
    let fileName = req.body.name;
    var file = mediaPathUSB + '/' + fileName;
    res.download(file); //
});

router.post('/downloadAll', function(req, res){
    var now = new Date();
    let fileName = "MemoryBox-" +  dateFormat(now, "mm-dd-yyyy-h-mm-ss");

    let output = fs.createWriteStream(mediaPathUSB + '/' + fileName + '.zip');
    let archive = archiver('zip', {
        gzip: true,
        zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        var file = mediaPathUSB + '/' +  fileName + '.zip';
        res.download(file); //
    });

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function() {
        console.log('Data has been drained');
    });

// good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            console.log(err);
            res.send({success:false});
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

// good practice to catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

// pipe archive data to the file
    archive.pipe(output);


// append a file
    for (let file of req.body.media) {
        archive.file(file.path, { name: file.name });
    }

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
    // var file = mediaPathUSB + '/' + fileName;
    //
});


router.post('/delete', function (req, res) {
    console.log('delete starting');
    let files = req.body;
    for(let file of files) {
        console.log('file');
        console.log(file);
        fs.removeSync(file.path);
    }
    res.send({success: true});
});

router.post('/rename', function (req, res) {
    let file = req.body;
    fs.rename(file.oldPath, file.newPath, function(err) {
        if ( err ) {
            console.log('ERROR: ' + err);
            res.send({success: false});
        }
    });
    res.send({success: true});
});

router.post('/backup', function(req, res){
    let source = req.body.source;
    let dest = req.body.dest;

    var now = new Date();
    let fileName = dateFormat(now, "mm-dd-yyyy-h-mm-ss");

    let output = fs.createWriteStream(dest + '/' + fileName + '.zip');
    let archive = archiver('zip', {
        gzip: true,
        zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        res.send({success:true});
    });

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function() {
        console.log('Data has been drained');
    });

// good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            console.log(err);
            res.send({success:false});
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

// good practice to catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

// pipe archive data to the file
    archive.pipe(output);


// append a file
    for (let file of req.body.media) {
        archive.file(file.path, { name: file.name });
    }

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
    // var file = mediaPathUSB + '/' + fileName;
    //
});

module.exports = router;
