var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var path = require('path');

// 3rd party packages
var dirTree = require("directory-tree");

/* GET albums listing. */
router.get('/', function (req, res) {
    let albumRoot = dirTree('/home/pi/jp/SmartPlay/assets/data/albums', {
        extensions: /\.(mp4|jpg|JPG|png|jpeg|avi|mov)$/
    });
    res.send(albumRoot);
});

router.get('/album/:name', function (req, res) {
    let albumName = req.params.name;
    let albumRoot = dirTree('/home/pi/jp/SmartPlay/assets/data/albums/' + albumName, {
        extensions: /\.(mp4|jpg|JPG|png|jpeg|avi|mov)$/
    });
    res.send(albumRoot);
});

router.post('/createAlbum/:name',  (req, res) => {
    let albumName = req.params.name;
    let selectedFiles = req.body;

    fs.ensureDirSync('/home/pi/jp/SmartPlay/assets/data/albums/'+albumName, err => {
        console.log(err) // => null
    });
    for (let i = 0; i < selectedFiles.length; i++) {
        console.log('Starting creating album...');
        console.log(selectedFiles.length);
        fs.copyFileSync(selectedFiles[i].path, '/home/pi/jp/SmartPlay/assets/data/albums/'+albumName+'/'+selectedFiles[i].name, (err) => {
            if (err) {
                console.log(err);
                res.send('error');
            }
            console.log('source.txt was copied to destination.txt');
        });
    }
    res.send({success: true});

});

router.post('/deleteAlbum', function (req, res) {
    console.log(req.query.name);
    deleteFolder('/home/pi/jp/SmartPlay/assets/data/albums/'+req.query.name);
    res.send({success: true});
});

deleteFolder = function (folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(function (entry) {
            var entry_path = path.join(folderPath, entry);
            if (fs.lstatSync(entry_path).isDirectory()) {
                rimraf(entry_path);
            } else {
                fs.unlinkSync(entry_path);
            }
        });
        fs.rmdirSync(folderPath);
        return true;
    } else {
        return false;
    }
};

module.exports = router;
