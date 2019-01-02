let express = require('express');
let router = express.Router();
drivelist = require('drivelist');
checkDiskSpace = require('check-disk-space');
fs = require('fs-extra');

// 3rd party packages
let dirTree = require("directory-tree");


// Get drive list
router.post('/', function (req, res) {

    try{
        let _listDrive = [];
        drivelist.list((error, drives) => {
            if (error) {
                throw error;
            }

            drives.forEach((drive) => {
                let _drive = {};
                let obj = drive.mountpoints;
                for (let key in obj) {

                    if (obj.hasOwnProperty(key)) {

                        let val = obj[key];

                        if (val.path.indexOf("/media/pi/") > -1) {

                            _drive.path = val.path;

                            checkDiskSpace(val.path).then((diskSpace) => {
                                diskSpace.free = readableBytes(diskSpace.free);
                                let descript = drive.description.substring(0, drive.description.indexOf('('));
                                diskSpace.size = readableBytes(diskSpace.size);
                                diskSpace.description = descript;
                                _listDrive.push(diskSpace)
                            }).catch(err => {
                                console.log(err)
                            });

                        }

                    }
                }

            });
            setTimeout(function() {
                console.log('_listDrive');
                console.log(_listDrive);
                if(_listDrive.length === 0) {
                    res.send("nodrives");
                }
                else {
                    res.send(_listDrive);
                }
                return;
            }, 100);
        });
        // res.send("no drives");
    }catch (ex)
    {
        console.log("************************* Error   ********************************");
        logger.error(ex);
        console.log("************************* Error   ********************************");
    }


});

/* Set the active USB. */
router.post('/set', function (req, res) {
    mediaPathUSB = req.query.usb;
    // directoryRoot = dirTree(mediaPathUSB, {
    //     extensions: /\.(mp4|jpg|png|jpeg|avi)$/
    // });
    var walk = function (dir, parent) {
        var results = [];
        var list = fs.readdirSync(dir);
        list.forEach(function (file) {
            if (file.startsWith('.')) {
                return;
            }
            file = dir + '/' + file;
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                /* Recurse into a subdirectory */
                results = results.concat(walk(file, true));
            } else {
                let fileName = /[^/]*$/.exec(file)[0];
                let _file = {
                        isFolder: false,
                        selected: false,
                        name: fileName,
                        parent: "root",
                        path: file
                };
                /* Is a file */
                results.push(_file);
            }
        });
        return results;
    };
    if (!mediaPathUSB) {
        res.send([]);
    }
    var fileList = walk(mediaPathUSB, false);

    res.send(fileList);
    // res.send(directoryRoot);
});

router.post('/setDeviceName/:pin', function (req, res) {

    let writeStream = fs.createWriteStream('/home/pi/jp/SmartPlay/device_configuration/name.conf');

    writeStream.write(req.params.pin);

    writeStream.end();

    res.send({success: true});

});

router.post('/changepin', function (req, res) {
    let oldPin = req.query.old;
    let newPin = req.query.new;

    fs.readFile('/home/pi/jp/SmartPlay/device_configuration/pin.conf', 'utf8', function (err, data) {
        console.log(data);
        if(oldPin === data){
            fs.writeFile('/home/pi/jp/SmartPlay/device_configuration/pin.conf', newPin, (err) => {
                // throws an error, you could also catch it here
                if (err) throw err;
                res.send({success: true});
                // success case, the file was saved
                console.log('PIN saved!');
            });
        }
        else{
            res.send({success: false});
        }
    });
});


function readableBytes(bytes) {
    let i = Math.floor(Math.log(bytes) / Math.log(1024)),
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
}

module.exports = router;
