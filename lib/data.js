// dependencies
const fs = require('fs');
const path = require('path');

// scffolding
const lib = {};

// base directory of data folder
lib.basedir = path.join(__dirname, '../.data/');

// write data to file
lib.create = function(dir, file, data, callback){
    // open file to write
    fs.open(lib.basedir+dir+'/'+file+'.json', 'wx', function(err, fileDescriptor){
        if(!err && fileDescriptor){
            // convert data to string
            const stringData = JSON.stringify(data);

            // write data to file and close it
            fs.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        } else {
                            callback('Error closing the file!')
                        }
                    });
                } else {
                    callback('Error writing the data to file!')
                }
            })
        } else {
            callback('Could not create new file, file may already exist!');
        }
    })
};

// read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir+dir}/${file}.json`, 'utf-8', (err, data)=>{
        callback(err, data);
    });
}

// update the existing file
lib.update = (dir, file, data, callback) => {

    //open the file to update
    fs.open(lib.basedir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor)=>{
        if(!err && fileDescriptor) {

            // converting data to string
            const stringData = JSON.stringify(data);

            // truncating the file
            fs.ftruncate(fileDescriptor, (err)=>{
                if(!err){
                    // write to the file
                    fs.writeFile(fileDescriptor, stringData, (err)=>{
                        if(!err){
                            // closing the file
                            fs.close(fileDescriptor, (err)=>{
                                if(!err){
                                    callback(false);
                                } else {
                                    'Error closing the file!'
                                }
                            })
                        } else {
                            callback('Error writing on the file!')
                        }
                    })
                } else {
                    callback('Error truncating the file!')
                }
            })

        } else {
            callback('Error opening the file!')
        }
    })
}

// delete the existing file
lib.delete = (dir, file, callback) => {
    // unlink the file
    fs.unlink(`${lib.basedir+dir}/${file}.json`, (err)=>{
        if(!err){
            callback(false);
        } else {
            callback('Error deleting file!');
        }
    });
}

module.exports = lib;