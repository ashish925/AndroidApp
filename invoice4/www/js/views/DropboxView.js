var DropboxView = function (template, listTemplate) {

    this.initialize = function () {

        this.listTemplate = listTemplate;
        
        if (! template) return; // making instance just for listFolder method
        
        var _me = this;
        
        this.el = $('<div/>');

        this.el.on('click', '#btn-uploadFiles', function(event) {
            app_db.showFileUploadView();
            event.preventDefault();
         });
        
        this.el.on("click", '#btn-unlink', function(event) {
            window.confirm('Unlink from Dropbox?', 'Confirm Unlink', ['Yes', 'No'],
            function(buttonIndex) {
                if (buttonIndex == 1) {
                    app_db.showLoader();
                    dropbox.unlink().done(function() {
                        app_db.hideLoader();
                        app_db.showWelcomeView();
                    });
                }
            });
            event.preventDefault();
        });
        
        this.el.on('click', '#fileList .file', function(event) {
            var filePath = decodeURIComponent($(event.currentTarget).attr('href').substr(1));
            $('#filePath').html(filePath);
            app_db.showLoader();
            if( (/\.(gif|jpg|jpeg|tiff|png)$/i).test(filePath) ) {
                $('#text, #image').hide();
                dropbox.readData(filePath).done(function(result) {
                    var bytes = new Uint8Array(result);
                    $('#image').attr('src', "data:image/jpeg;base64," + encode(bytes)).show();

                    //Attempt 2 - storing image in localstorage directly from the data read from dropbox (this method works)
                    localStorage.setItem("dbimage", "data:image/jpeg;base64,"+encode(bytes));
                    
                    // alert("Image saved in localStorage");
                    //if (confirm("Set as wallpaper?"))
                        // localStorage.setItem("dbwp", 1);
                    // alert("Opening from localStorage...");
                    // window.location.href=localStorage.getItem("dbimage");
                    //done
                    
                    app_db.hideLoader();
                });
            } else {
                $('#image, #text').hide();
                dropbox.readString(filePath).done(function(result) {
                    $('#text').html(result).show();
                    app_db.hideLoader();
                });
            }
            event.preventDefault();
        });
        
        this.el.on('click', '#btn-back', function(event) {
            (app_db.dropboxPath == '/') ? app_db.showExitConfirm() : window.history.back();
            event.preventDefault();
        });
        
        window.onhashchange = function() {
            app_db.dropboxPath = decodeURIComponent(window.location.hash.substr(1));
            if (app_db.dropboxPath == '') {
                app_db.dropboxPath = '/';
            }
            $('#path').html(app_db.dropboxPath);
            _me.listFolder();
        };
        
        window.onorientationchange = null; // remove any current listeners
        window.onorientationchange = function(event) {
            setTimeout(function() {
                var h = $('#content').height(),
                    w = $('#content').width();
                $('#image').css({'max-width':w, 'max-height':h});
                $('#text').css('max-width', w);
            }, 300);

            switch(window.orientation) {
                case -90:
                case 90:
                    // landscape
                    app_db.loadIcon.css('left', '90px');
                    break;
                default:
                    //portrait
                    app_db.loadIcon.css('left', '60px');
                    break;
            }
        };
         
    }; // end initialize

    this.render = function() {
        this.el.html(template());
        return this;
    };

    this.initialize();

};

DropboxView.prototype.listFolder = function() {
    var i,
        l,
        html = "",
        file,
        fileArray = [],
        folderArray = [],
        _me = this;
    dropbox.listFolder(app_db.dropboxPath).done(function(files) {
        l = files.length;
        (l > 0) ? $("#noFiles").hide() : $("#noFiles").show();
        for (i = 0; i < l; i++) {
            file = files[i];
            file.fileName = files[i].path.substr(file.path.lastIndexOf("/") + 1);
            file.encodedPath = encodeURIComponent(files[i].path);
            if (file.isFolder) {
                folderArray.push(file);
            } else {
                fileArray.push(file);
            }
        }
        folderArray.sortByKey('path');
        fileArray.sortByKey('path');
        var fileList = folderArray.concat(fileArray);
        html = _me.listTemplate(fileList);
        $('#path').html(app_db.dropboxPath);
        $("#fileList").html(html);
        if (app_db.dropboxViewIScroll) {
            app_db.dropboxViewIScroll.destroy();
        }
        setTimeout(function() {
            app_db.dropboxViewIScroll = new IScroll($('#scroller', _me.el)[0], {
                scrollbars: true,
                fadeScrollbars: true,
                shrinkScrollbars: 'clip',
                click: true
            });
            app_db.dropboxViewIScroll.on('scrollEnd', _me.handleIScroll);
            var checkIndex = app_db.dropboxViewScrollCache.contains('path', app_db.dropboxPath);
            if (checkIndex != -1) {
                app_db.dropboxViewIScroll.scrollTo(0, app_db.dropboxViewScrollCache[checkIndex].pos);
            }
        }, 10);
    });
};

DropboxView.prototype.handleIScroll = function() {
    var checkIndex = app_db.dropboxViewScrollCache.contains('path', app_db.dropboxPath);
    if (checkIndex == -1) {
        app_db.dropboxViewScrollCache.push({
            path: app_db.dropboxPath,
            pos: this.y
        });
    } else {
        app_db.dropboxViewScrollCache[checkIndex].pos = this.y;
    }
};