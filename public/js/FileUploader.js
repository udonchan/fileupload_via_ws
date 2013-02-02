"use strict";

var FileUploader = function(){
    var _this = this;
    var bufsize = 524288; // 512KB

    if(window.File.prototype.slice === undefined) {
        window.File.prototype.slice = function(p, length){
            (window.File.prototype.webkitSlice || window.File.prototype.mozSlice)(p, p+length);
        }
    }
    this.socket = io.connect(location.hostname === "localhost" ? "127.0.0.1:" + location.port : location.host);
    this.fReader = new FileReader();

    this.socket.on('moreData', function (data){
        if(_this.receiveDataCallback !== undefined){
            _this.receiveDataCallback(data);
        }
        //The Next Blocks Starting Position
        var place = data['place'] * bufsize; 
        var newFile = _this.targetFile.slice(place, place + Math.min(bufsize, (_this.targetFile.size - place)));
        _this.fReader.readAsBinaryString(newFile);
    });

    this.socket.on('done', function (data){
        if(_this.receiveDataDoneCallback !== undefined){
           _this.receiveDataDoneCallback(data);
        }
    });
};

FileUploader.prototype.upload = function(){
    if(this.targetFile === undefined) {
        return false;
    }
    this.socket.emit('file_upload_start', {'name' : this.targetFile.name, 'size' : this.targetFile.size});
    return true;
};

FileUploader.prototype.fileChosen = function(event){
    var _this = this;
    this.targetFile = event.target.files[0];
    this.fReader.onload = function(event){
        _this.socket.emit('upload_ready', {'name' : _this.targetFile.name, 'data' : event.target.result});
    }
};

FileUploader.prototype.setReceiveDataDoneCallback = function(callback){
    this.receiveDataDoneCallback = callback;
};

FileUploader.prototype.setReceiveDataCallback = function(callback){
    this.receiveDataCallback = callback;
};

