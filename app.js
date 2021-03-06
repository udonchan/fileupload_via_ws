"use strict";

var express = module.exports = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs')
var util = require('util')

var app = module.exports = express();
var port = 8080;
var server = http.createServer(app);

server.listen(port, function(){
    console.log("Express server listening on port " + port);
});
var io = require('socket.io').listen(server);

var files = {};
var bufsize = 524288;

var cacheDir = path.join(__dirname, "cache");
var staticFileDir = path.join(__dirname, "public");
var uploadedFileDir = path.join(staticFileDir, "files");

io.sockets.on('connection', function (socket) {
    //data contains the variables that we passed through in the html file
    socket.on('file_upload_start', function (data) { 
        var name = data.name;
        //Create a new Entry in The Files Variable
        var file = files[name] = {  
            fileSize : data.size,
            data     : "",
            downloaded : 0
        };
        var place = 0;
        try{
            var stat = fs.statSync(path.join(cacheDir, name));
            if(stat.isFile()) {
                file.downloaded = Stat.size;
                place = stat.size / bufsize;
            }
        } catch(er){} //It's a New File

        fs.open(path.join(cacheDir, name), 'a', "0755", function(err, fd){
            if(err) {
                console.log(err);
                return;
            } 
            //We store the file handler so we can write to it later
            file.handler = fd; 
            socket.emit('moreData', { 'place' : place, 'percent' : 0 });
        });
    });
    
    socket.on('upload_ready', function (data){
        var name = data.name;
        var file = files[name];
        file.downloaded += data.data.length;
        file.data += data.data;

        //If File is Fully Uploaded
        if(file.downloaded == file.fileSize) {
            fs.write(file.handler, file.data, null, 'Binary', function(err, Writen){
                var inp = fs.createReadStream(path.join(cacheDir, name));
                var out = fs.createWriteStream(path.join(uploadedFileDir, name));
                util.pump(inp, out, function(){
                    //This Deletes The Temporary File
                    fs.unlink(path.join(cacheDir, name), function () { 
                        socket.emit('done');
                    });
                });
            });
            return;
        }
        //If the Data Buffer reaches 10MB
        if(file.data.length > 10485760){
            fs.writeSync(file.handler, file.data, null, 'Binary');
            //Reset The Buffer
            file.data = ""; 
        } 
        var place = file.downloaded / bufsize;
        var percent = (file.downloaded / file.fileSize) * 100;
        socket.emit('moreData', { 'place' : place, 'percent' :  percent});
    });
});

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(staticFileDir));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/', function(req, res){
    res.render('index');
});

