//////////////////////////////
//
//  App General -- These form the general UI and other stuff
//  common to all templated apps
//
//////////////////////////////

onBackButtonPress = function() {
    console.log("back button pressed");
}

onMenuButtonPress = function() {
    console.log("menu button pressed");
}

onSearchButtonPress = function() {
    console.log("search button pressed");
}

stripScriptsFromHtml = function(html) {
    var out = html;
    var ind = out.indexOf('<!--script');
    var ind1 = -1;
    while (ind != -1) {
	ind1 = out.indexOf('script-->');
	if (ind1 == -1) break;
	out = out.slice(0,ind)+out.slice(ind1+9);
	ind = out.indexOf('<!--script');
    }
 
    return out;    
}

getHtmlContentForApp = function() {
    var result = "";
    var control = SocialCalc.GetCurrentWorkBookControl();
    var currsheet = control.currentSheetButton.id	   

    var appsheets = {sheet1:"sheet1",sheet2:"sheet2"};
    //var appsheets = {sheet1:currsheet};
    result = SocialCalc.WorkbookControlCreateSheetHTML(appsheets);

    console.log("email size is "+result.length);
    result = stripScriptsFromHtml(result);

    return result;
}

getFSForEmail = function() {
    window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, sendFileWriterForEmail, failForEmail);
}


sendFileWriterForEmail = function(fileSystem) {
   var path = fileSystem.root.fullPath+"/RentReceipt.html";
    //path = "/sdcard";
    console.log(path);
    writer = new FileWriter(path);
    console.log("got file writer");    
    var control = SocialCalc.GetCurrentWorkBookControl();
    //var content = control.workbook.spreadsheet.CreateSheetHTML(); 
    var content = getHtmlContentForApp();

    writer.seek(0);
    writer.write(content);
    AndroidSendEmail("Rent Receipt", "rent receipt attached", path)    
}

failForEmail = function(error) {
    $.mobile.hidePageLoadingMsg();
    console.log("error dealing with FS "+error)
}

AndroidSendEmail = function(subject, body, path) { 
  var extras = {};

  $.mobile.hidePageLoadingMsg();
  console.log("trying to send email")
  extras[WebIntent.EXTRA_SUBJECT] = subject;
  extras[WebIntent.EXTRA_TEXT] = body;            
  //alert("path is "+ path);
  //path = "/sdcard"
  extras["path"] = path;

  window.plugins.webintent.startActivity({ 
      action: WebIntent.ACTION_SEND,
      type: 'text/plain', 
      extras: extras 
    }, 
    function() {}, 
    function() {
      alert('Failed to send email via Android Intent');
    }
  ); 
  console.log("send email done")
};


       function showEmailComposer()
        {
	    $.mobile.showPageLoadingMsg();
	    getFSForEmail();
	   //sendFileWriterForEmail();
          //var control = SocialCalc.GetCurrentWorkBookControl();
          //var content = control.workbook.spreadsheet.CreateSheetHTML(); 
	  //  AndroidSendEmail("Invoice","<html><body>"+content+"</body></html>")
	  
	  //window.plugins.emailComposer.showEmailComposer("Invoice",content, "", "", "",true);
        }
       function showPrintDialog()
        {
          var control = SocialCalc.GetCurrentWorkBookControl();
          var html = control.workbook.spreadsheet.CreateSheetHTML();
          window.plugins.printPlugin.print(html,
                function(result) {
                         //alert("Printing successful");
                }, 
                function(result) {
                   if (!result.available){
                     alert("Printing is not available");
                   }
                   else{
                     //Localised error description
                     //alert(result.error);
                   }
                }
                ,
                {dialogOffset: {left: 500, top: 900}}
          );
        }

        function showBuyLink()
        {
            window.open("http://itunes.apple.com/us/app/angry-birds-rio/id420635506?mt=8&uo=4");
        }
        function showHelp()
        {
            var strPath = String(window.location); 
            var path = strPath.substr(0,strPath.lastIndexOf("/")); 
            PhoneGap.exec('ChildBrowserCommand.showWebPage',encodeURI(path + '/help.html')); 

        }


SocialCalc.oldBtnActive = 1;

function getSheetIds() {
var control = SocialCalc.GetCurrentWorkBookControl();
var sheets = [];
for (key in control.sheetButtonArr) {
console.log(key);
sheets.push(key);
}
return sheets;
}

function activateFooterBtn(index) {
   if (index == SocialCalc.oldBtnActive) return;

   var oldbtn = "footerbtn"+ SocialCalc.oldBtnActive;
   var newbtn = "footerbtn"+ index;

   $("#"+newbtn).addClass("ui-btn-active");
   $("#"+oldbtn).removeClass("ui-btn-active");

   var sheets = getSheetIds()
   // disable active edit boxes
    var control = SocialCalc.GetCurrentWorkBookControl();
    var spreadsheet = control.workbook.spreadsheet;      
   var ele = document.getElementById(spreadsheet.formulabarDiv.id);
   if (ele) {
       SocialCalc.ToggleInputLineButtons(false);       
      var input = ele.firstChild;
      input.style.display="none";
      spreadsheet.editor.state = "start";
   }
   if (SocialCalc.Callbacks.preSheetSwitch) {
       SocialCalc.Callbacks.preSheetSwitch(sheets[index-1]);
   }
   SocialCalc.WorkBookControlActivateSheet(sheets[index-1]);
   if (SocialCalc.Callbacks.postSheetSwitch) {
       SocialCalc.Callbacks.postSheetSwitch(sheets[index-1]);
   }

   SocialCalc.oldBtnActive = index;
}

/*
$('#listpage').live('pageshow', function(event) {
  console.log('refreshing')
  //$('#filelist1').refresh();
}
*/


function tweakUpdateList() {
console.log("in list page")
var ele1 = document.getElementById("filelist1");
var str = document.getElementById("filelist").innerHTML;
// for each file in the store, replace the template with the filename
var hstr = "";
var i = 0;
console.log(window.localStorage.length);
for (i=0; i < window.localStorage.length; i++) {
  var temp = str;
temp = temp.replace("!--Template1--",window.localStorage.key(i));
temp = temp.replace("!--Template2--",window.localStorage.key(i));
temp = temp.replace("!--Template3--",window.localStorage.key(i));
  hstr = hstr + temp;
}

// add the default file name
  var temp = str;
temp = temp.replace("!--Template1--", "default");
temp = temp.replace("!--Template2--", "default");
temp = temp.replace("!--Template3--", "default");
  hstr = hstr + temp;


console.log(hstr);
ele1.innerHTML=hstr;
console.log("edited list page")
    
}

$('#listPage').live('pagebeforeshow', function(event) {
// fill the list dynamically
tweakUpdateList();
});

function saveFileSubmit() {
     console.log("file is:");	
     var fname = document.getElementById("saveasname").value;
    var val = SocialCalc.WorkBookControlSaveSheet();
    console.log(val.length);
    var val1 = encodeURIComponent(val);
    console.log(val1.length);
     window.localStorage.setItem(fname, val1);
     alert("Saved as: "+fname)
}


function changePage(pageid) {
$.mobile.changePage(($(pageid)), { transition: "slideup"} );
}

function updateFileName(fname) {
    selectedFile = fname;
    document.getElementById("indexPage-fname").innerHTML="Editing: "+fname;
    //document.getElementById("listPage-fname").innerHTML="Editing: "+fname;
    //document.getElementById("filePage-fname").innerHTML="Editing: "+fname;

}

function viewFile(filename) {
//alert("viewFile: "+selectedFile)
console.log("view file "+filename);
//$.mobile.showPageLoadingMsg()
selectedFile = filename;
var data = "";

if (filename != "default") {
    data = window.localStorage.getItem(filename)
    console.log(data.length)
    SocialCalc.WorkBookControlInsertWorkbook(decodeURIComponent(data))
} else {
    data = document.getElementById("sheetdata").value;
    SocialCalc.WorkBookControlInsertWorkbook(data)   
}
updateFileName(filename);

// reset the editor state

    SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";

SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
//$.mobile.hidePageLoadingMsg()
//$.mobile.changePage(($("#indexPage")), { transition: "slideup"} );
//window.setTimeout(
//function() {
//$.mobile.hidePageLoadingMsg()
$.mobile.changePage(($("#indexPage")), { transition: "slideup"} );
//},1000
//)
}

function deleteFilePrompt(filename) {
    if (filename == "default") {
      alert("Cannot delete file : "+filename);
       return;
    }

    var conf = confirm("Delete file: "+filename+" ?");
    if (conf) {
	deleteFile(filename);
    }
}


function deleteFile(filename) {


window.localStorage.removeItem(filename);
//alert("Deleted file: "+filename)
tweakUpdateList();
// refresh the page
//$("#listPage").refresh();

  if (selectedFile == filename) {
      // set the selected file back to default
      updateFileName("default");
      // load the default file into socialcalc
  }

}

function saveAsOk(fname) {

    // do some validation checks on file name
    if (fname == "default") {
	alert(
	"Cannot update default file! \n\n Use another file name");
      return;
    }

    if (fname == "") {
	alert(
	"Empty filename, Please use another filename");
      return;
    }

    if (fname.length > 30) {
	alert(
	"Filename too long ! \n\n Please enter a file name less than 30 characters");
       return;
    }

    var val = SocialCalc.WorkBookControlSaveSheet();
    console.log(val.length);
    var val1 = encodeURIComponent(val);
    console.log(val1.length);
    window.localStorage.setItem(fname, val1);    
    alert("saved as "+fname);

    // set the top right file to selected file
    updateFileName(fname);
    
    
}

function saveAsCancel() {
    console.log("saveas canceled");
}

function saveAsPrompt() {
    //alert("in prompt");
   var fname = prompt("Enter File Name","saved");    
   if (fname) {
       saveAsOk(fname);
   } else {
       saveAsCancel();
   }
}

function saveCurrentFile() {

    if (selectedFile == "default") {
	alert(
	"Cannot update default file! \n\n Use SaveAs");
       return;
    }

    console.log("saving current file "+selectedFile)
    var val = SocialCalc.WorkBookControlSaveSheet();
    console.log(val.length);
    var val1 = encodeURIComponent(val);
    console.log(val1.length);
    window.localStorage.setItem(selectedFile, val1);    
    console.log("saved as "+selectedFile);
    
    alert(
	"Saved file : "+selectedFile);

}


//-------------------
SocialCalc.ToggleInputLineButtons = function(show) {
   var bele = document.getElementById("testtest");
   if (!bele) return;
   if (show) {
      bele.style.display = "inline";
   } else {
     bele.style.display = "none";
   } 
}
SocialCalc.InputLineClearText = function() {
   spreadsheet.editor.inputBox.SetText("");
}

  jQuery.postJSON = function(url, args, callback) {
  //args._xsrf = getCookie("_xsrf");
  //console.log(args)
  var test = $.param(args)
  //console.log(test)
  
  $.ajax({url: url, data: $.param(args), dataType: "text", type: "POST",
  success: function(response) {
  if (callback) callback(eval("(" + response + ")"));
  }, error: function(response) {
  console.log("ERROR:", response)
  }});
  };

  SocialCalc.Callbacks.broadcast = function(type, data) {

  }


var spreadsheet = null;
var selectedFile = "default";
var workbook = null;
var workbookcontrol = null;
function loadAndStartupApp()
{
    
  SocialCalc.Constants.defaultImagePrefix = "lib/aspiring/images/sc-";
  SocialCalc.Constants.defaultGridCSS = "";
  SocialCalc.Constants.SCNoColNames = true;
  SocialCalc.Constants.SCNoRowName = true;
  SocialCalc.Constants.defaultRownameStyle = "";
  SocialCalc.Constants.defaultSelectedRownameStyle = "";
  SocialCalc.Popup.imagePrefix = "lib/aspiring/images/sc-";


  var spreadsheet = new SocialCalc.SpreadsheetControl();



    var workbook = new SocialCalc.WorkBook(spreadsheet);
    workbook.InitializeWorkBook("sheet1");

    spreadsheet.InitializeSpreadsheetControl("tableeditor");
    spreadsheet.ExecuteCommand('redisplay', '');
    

    var workbookcontrol = new SocialCalc.WorkBookControl(workbook,"workbookControl","sheet1");
    workbookcontrol.InitializeWorkBookControl();
    
    SocialCalc.WorkBookControlLoad(document.getElementById("sheetdata").value)
    
    spreadsheet.DoOnResize();

}
SocialCalc.Callbacks.showprompt = function(coord) {

    var control = SocialCalc.GetCurrentWorkBookControl(); 
    var editor = control.workbook.spreadsheet.editor;
    var wval = editor.workingvalues;
    if (wval.eccord) {
	wval.ecoord = null;
        console.log("return due to ecoord")
	return;
    }
    wval.ecoord = coord;
    if (!coord) coord = editor.ecell.coord;
    var text = SocialCalc.GetCellContents(editor.context.sheetobj, coord);
    console.log("in prompt, coord = "+coord+" text="+text);

   if (SocialCalc.Constants.SCNoQuoteInInputBox && (text.substring(0,1) == "'")) {
       text = text.substring(1);
   }
    console.log("continue...")
    var cancelfn = function() {
        wval.ecoord = null;
    };

    var okfn = function(val) {
	var callbackfn = function() {
            console.log("callback val "+val)
	    SocialCalc.EditorSaveEdit(editor, val);
	};
	window.setTimeout(callbackfn, 100);
    };
    var val = prompt( "Enter Value",text );
    if (val) {
	okfn(val);	
    } else {
	cancelfn();	
    }

    return true;
}