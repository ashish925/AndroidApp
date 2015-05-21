var DropboxView = function (template, listTemplate) {

    this.initialize = function () {

        this.listTemplate = listTemplate;
        
        if (! template) return; // making instance just for listFolder method
        
        var _me = this;
        
        this.el = $('<div/>');

        this.el.on('click', '#btn-uploadFiles', function(event) {
            app.showFileUploadView();
            event.preventDefault();
         });
        
        this.el.on("click", '#btn-unlink', function(event) {
            window.confirm('Unlink from Dropbox?', 'Confirm Unlink', ['Yes', 'No'], function(buttonIndex) {
                if (buttonIndex == 1) {
                    app.showLoader();
                    dropbox.unlink().done(function() {
                        app.hideLoader();
                        app.showWelcomeView();
                    });
                }
            });
            event.preventDefault();
        });
        
        this.el.on('click', '#fileList .file', function(event) {
            var filePath = decodeURIComponent($(event.currentTarget).attr('href').substr(1));
            $('#filePath').html(filePath);
            app.showLoader();
		/*function win(entry) {
		    console.log("New Path: " + entry.fullPath);
		}

		function fail(error) {
		    alert(error.code);
		}

		function copyFile(entry) {
	    		var parent = "images/wallpapers/",
			parentName = parent.substring(parent.lastIndexOf('/')+1),
			parentEntry = new DirectoryEntry(parentName, parent);

		    	// copy the file to a new directory and rename it
		    	entry.copyTo(parentEntry, "dropbox.copy", success, fail);
		}*/

            if( (/\.(gif|jpg|jpeg|tiff|png|PNG)$/i).test(filePath) ) {
                $('#text, #image').hide();
                dropbox.readData(filePath).done(function(result) {
                    var bytes = new Uint8Array(result);
                    //copy image to localstorage
                    // Get a reference to the image element
                    var dbimage = document.getElementById("image");
                     
                    //Attempt to copy image from the <img> element after it has loaded (this did not work for me)
                    // Take action when the image has loaded
                    dbimage.addEventListener("load", function () {
                        alert("Image loaded, attempting to store");
                        var imgCanvas = document.createElement("canvas"),
                            imgContext = imgCanvas.getContext("2d");
                     
                        // Make sure canvas is as big as the picture
                        imgCanvas.width = dbimage.width;
                        imgCanvas.height = dbimage.height;
                     
                        // Draw image into canvas element
                        imgContext.drawImage(dbimage, 0, 0, dbimage.width, dbimage.height);
                     
                        // Get canvas contents as a data URL
                        var imgAsDataURL = imgCanvas.toDataURL();
                     
                        // Save image into localStorage
                        try {
                            localStorage.setItem("dbimage", imgAsDataURL);
                        }
                        catch (e) {
                            alert("Storage failed: " + e);
                        }
                        alert("Image stored in localstorage");
                        alert(imgAsDataURL.substr(0,20));
                    }, false); 
                    //alert("Bytes: "+bytes);
                    //alert("Encoded: "+encode(bytes));
                    $("#image").load(function() {
                        alert('I loaded!');
                    });
                    //end of attempt 1

                    $('#image').attr('src', "data:image/jpeg;base64," + encode(bytes));
                    $('#image').show();

                    //Attempt 2 - storing image in localstorage directly from the data read from dropbox (this method works)
                    localStorage.setItem("dbimage", "data:image/jpeg;base64,"+encode(bytes));
		            alert("Image loaded - data:image/jpeg;base64");
                    //if (confirm("Set as wallpaper?"))
                        localStorage.setItem("dbwp", 1);
                    alert("Opening from localStorage...");
                    window.location.href=localStorage.getItem("dbimage");
                    //done
                    app.hideLoader();
                });
            } else {
                $('#image, #text').hide();
                dropbox.readString(filePath).done(function(result) {
                    alert("Displaying text...");
                    $('#text').html(result).show();
		    //$('#image').attr('src', "data:image/jpeg;base64," + encode(bytes)).show();
                    app.hideLoader();
                });
            }
            event.preventDefault();
        });
        
        this.el.on('click', '#btn-back', function(event) {
            (app.path == '/') ? app.showExitConfirm() : window.history.back();
            event.preventDefault();
        });
        
        $(window).off('haschange').on('hashchange', function() {
            app.path = decodeURIComponent(window.location.hash.substr(1));
            $('#path').html(app.path ? app.path : '/');
            _me.listFolder();
        });
        
        $(window).off('orientationchange').on('orientationchange', function(event) {
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
                    app.loadIcon.css('left', '90px');
                    break;
                default:
                    //portrait
                    app.loadIcon.css('left', '60px');
                    break; 
            }
        });
         
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
    dropbox.listFolder(app.path).done(function(files) {
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
        $("#fileList").html(html);
        app.path = (app.path) ? app.path : '/';
        $('#path').html(app.path);
    });
};
