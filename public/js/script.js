"use strict";

jQuery(document).ready(function(){
    // These are the necessary HTML5 objects the we are going to use 
    if(!('File' in window && 'FileReader' in window)){
        document.getElementById('uploadArea').innerHTML =
            "<div class=\"text-error\">Your Browser Doesn't Support The File API Please Update Your Browser</div>";
        return;
    }

    var uploadbtn = jQuery('#uploadButton').attr('disabled', true);
    var filebox = jQuery('input[id=fileBox]');
    var namebox = jQuery('#nameBox');
    var uploadarea = jQuery('#uploadArea');
    var progressbar; 
    var percentElm;
    var mbElm;

    (function fileUploadFormPritify(){
        jQuery(document).on('click', 'a#choseFileBtn', function(){
            filebox.click();
        });
        filebox.change(function(){
            namebox.val($(this).val());
        });
    })();
  
    var refresh = function(){
        location.reload(true);
    };

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
    
    var fileChosen = function(event) {
        fileUploader.fileChosen(event);
        uploadbtn.attr('disabled', false);
    };

    var startUpload = function(){
        if("" == filebox.val()) {
            alert("Please Select A File");
            return;
        }
        var content = '<span id="nameArea">Uploading ' + fileUploader.targetFile.name + ' as ' + name + '</span>';
        content += '<div id="progressContainer" class="progress progress-striped">' + 
            '<div id="progressBar" class="bar"></div></div><span id="percent">50%</span>';
        content += '<span id="uploaded"> - <span id="MB">0</span>/' +
            Math.round(fileUploader.targetFile.size / 1048576) + 'MB</span>';
        uploadarea.html(content);

        progressbar = jQuery('#progressBar');
        percentElm = jQuery('#percent');
        mbElm = jQuery('#MB');
        fileUploader.upload();
    };

    var fileUploader = new FileUploader();
    fileUploader.setReceiveDataDoneCallback(receiveDone);
    fileUploader.setReceiveDataCallback(updateBar);
    
    uploadbtn.on('click', startUpload);  
    filebox.on('change', fileChosen);

});

