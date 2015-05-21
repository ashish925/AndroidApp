var app_db = (function() {

    var loadIcon = $('#loader'),
        viewContainer = $('#viewContainer'),
        welcomeViewTpl = Handlebars.compile($('#welcomeView-tpl').html()),
        dropboxViewTpl = Handlebars.compile($('#dropboxView-tpl').html()),
        fileListTpl = Handlebars.compile($('#fileList-tpl').html()),
        dropboxView = new DropboxView(null, fileListTpl), // listFolder() needs available in window
        fileUploadViewTpl = Handlebars.compile($('#fileUploadView-tpl').html()),
        localFileListTpl = Handlebars.compile($('#localFileList-tpl').html()),
        slider = new PageSlider(viewContainer),
        dropboxPath = '/',
        localFileFullPath = '',
        dropboxViewIScroll,
        fileUploadViewIScroll;
    
    var showWelcomeView = function() {
        var welcomeView = new WelcomeView(welcomeViewTpl);
        viewContainer.empty();
        slider.slidePageFrom(welcomeView.render().el, 'left');
    };

    var showDropboxView = function() {
        dropboxView = new DropboxView(dropboxViewTpl, fileListTpl);
        var fromFileUploadView = $('#fileUploadView').length > 0;
        viewContainer.empty();
        slider.slidePageFrom(dropboxView.render().el, (fromFileUploadView) ? 'left' : 'right');
        
        var h = $('#content').height(),
            w = $('#content').width();
        
        $('#image').css({'max-width': w, 'max-height': h});
        $('#text').css('max-width', w);
        loadIcon.css('left', '60px');
        
        dropboxView.listFolder();
        dropbox.addObserver("/");
    };
    
    var showFileUploadView = function() {
        var fileUploadView = new FileUploadView(fileUploadViewTpl, localFileListTpl);
        viewContainer.empty();
        slider.slidePageFrom(fileUploadView.render().el, 'right');
        
        loadIcon.css('left', '70px');
        
        if (app_db.localFileFullPath == '') {
            // request the persistent file system
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileUploadView.getFSRoot, fileUploadView.FSfail);
        } else {
            fileUploadView.getFolderWithPath();
        }
    };
    
    document.addEventListener("deviceReady", function() {   // ready for kickoff
        FastClick.attach(document.body);
        
        if (navigator.notification) { // Override default HTML alert with native dialog
            window.confirm = function (message, title, labels, success) {
                navigator.notification.confirm(
                    message, // message string
                    success, // callback to invoke with index of button pressed
                    title,   // title string
                    labels   // buttonLabels array
                );
            };
        }
        
        dropbox.checkLink().done(showDropboxView).fail(showWelcomeView);
        
        // hook btn-back to the device's back button
        // document.addEventListener('backbutton', onBackKeyDown, false);
        // function onBackKeyDown(event) {
        //     $('#btn-back').trigger('click');
        //     event.preventDefault();
        // }
    });
    
    Array.prototype.sortByKey = function(key) {
        this.sort(function(a, b) {
            var x = a[key].toLowerCase(); 
            var y = b[key].toLowerCase();
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };
    
    Array.prototype.contains = function(key, value) {
        for (var i = 0; i < this.length; i++) {
            if (this[i][key] == value) {
                return i;
            }
        }
        return -1;
    };
    
    function showExitConfirm() {
        window.confirm('Exit PhoneGap Sync?', 'Confirm Exit', ['Exit', 'Cancel'], 
            function(buttonIndex) {
                if (buttonIndex == 1) {
                    navigator.app_db.exitApp(); // close the app_db
                }
            }
        );
    }
    
    function showLoader() {
        loadIcon.show();
    }
    
    function hideLoader() {
        loadIcon.hide();
    }

    return {
        dropboxPath: dropboxPath,
        localFileFullPath: localFileFullPath,
        dropboxViewScrollCache: [],
        fileUploadViewScrollCache: [],
        dropboxViewIScroll: dropboxViewIScroll,
        fileUploadViewIScroll: fileUploadViewIScroll,
        dropboxView: dropboxView,
        showWelcomeView: showWelcomeView,
        showFileUploadView: showFileUploadView,
        showDropboxView: showDropboxView,
        showExitConfirm: showExitConfirm,
        loadIcon: loadIcon,
        showLoader: showLoader,
        hideLoader: hideLoader
    }
    
})();

// Called from onActivityResult in the app_db's main activity
function dropbox_linked() {
    app_db.showDropboxView();
}

// Called by observer in DropboxSync plugin when there's a change to the status of background synchronization (download/upload)
function dropbox_onSyncStatusChange(status) {
    (status == 'none') ? app_db.hideLoader() : app_db.showLoader();
}

// Called by observer in DropboxSync plugin when a file is changed
function dropbox_fileChange() {
    if ($('#dropboxView').length > 0) {
        app_db.dropboxView.listFolder();
    }
}