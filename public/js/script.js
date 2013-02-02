"use strict";

jQuery(document).ready(function(){
    // These are the necessary HTML5 objects the we are going to use 
    if(!('File' in window && 'FileReader' in window)){
        document.getElementById('uploadArea').innerHTML =
            "<div class=\"text-error\">Your Browser Doesn't Support The File API Please Update Your Browser</div>";
        return;
    }

    var uploadarea = jQuery('#uploadArea');
    var uploadbtn;
    var filebox;
    var filedropbox;
    var namebox;
    var progressbar; 
    var percentElm;
    var mbElm;

    var receiveDone = function(){
        uploadarea.html('<div class="text-success">Successfully Uploaded !!</div>' +
                        '<a id="refresh" class="btn btn-large btn-primary">' +
                        'Upload Another</a>');
        jQuery('a#refresh').on('click', refresh);
    };
    
    var updateBar = function (data){
        var percent = data['percent'];
        progressbar.css({"width" : percent + '%'});
        percentElm.html((Math.round(percent*100)/100) + '%');
        var mbDone = Math.round(((percent/100.0) * fileUploader.targetFile.size) / 1048576);
        mbElm.html(mbDone);
    };
    
    var startUpload = function(){
        if(fileUploader.targetFile == undefined) {
            alert("Please Select A File");
            return;
        }
        uploadarea.html('<span id="nameArea">Uploading ' + fileUploader.targetFile.name + '</span>' +
                        '<div id="progressContainer" class="progress progress-striped">' + 
                        '<div id="progressBar" class="bar"></div></div><span id="percent">0%</span>' +
                        '<span id="uploaded"> - <span id="MB">0</span>/' +
                        Math.round(fileUploader.targetFile.size / 1048576) + 'MB</span>');
        progressbar = jQuery('#progressBar');
        percentElm = jQuery('#percent');
        mbElm = jQuery('#MB');
        fileUploader.upload();
    };

    var fileChosen = function(event) {
        fileUploader.fileChosen(event);
        var files = event.target.files || event.originalEvent.dataTransfer.files;
        namebox.val(files[0].name);
        uploadbtn.attr('disabled', false);
    };

    var refresh = function(){
        uploadarea.html('<input type="file" id="fileBox" style="display:none"></input>' +
                        '<div class="input-append">' +
                        '<input type="text" id="nameBox"type="text"></input>' +
                        '<a class="btn" id="choseFileBtn">Chose file</a>' +
                        '</div>' +
                        '<div id="fileDropBox">or Drop File Here</div>'+
                        '<button type="button" id="uploadButton" class="btn btn-large btn-primary">Upload</button>');
        uploadbtn = jQuery('#uploadButton').attr('disabled', true);
        filebox = jQuery('input[id=fileBox]');
        namebox = jQuery('#nameBox');
        filedropbox = jQuery("#fileDropBox")
        // file upload form pritify 
        jQuery('a#choseFileBtn').on('click', function(){
            filebox.click();
        });
        uploadbtn.on('click', startUpload);  
        filebox.on('change', fileChosen);
        filedropbox.on('dragenter', function (e) {
            e.stopPropagation();
            e.preventDefault();
        }).on('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(this).addClass('hover');
        }).on('dragleave', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(this).removeClass('hover');
        }).on("drop", function(e){
            if(e.originalEvent.dataTransfer){
                if(e.originalEvent.dataTransfer.files.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    fileChosen(e);
                }
            }
        });

    };

    var fileUploader = new FileUploader();
    fileUploader.setReceiveDataDoneCallback(receiveDone);
    fileUploader.setReceiveDataCallback(updateBar);
    refresh();
});
