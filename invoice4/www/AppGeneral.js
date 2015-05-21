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

    var appsheets;
    
    switch(currsheet)
    
    {
        case "sheet1": appsheets ={sheet1:"sheet1"};
            break;
            
        case "sheet2": appsheets = {sheet2:"sheet2"};
            break;
            
        case "sheet3": appsheets = {sheet3:"sheet3"};
            break;
            
        case "sheet4": appsheets = {sheet3:"sheet3", sheet4:"sheet4"};
            break; 
        
        case "sheet5": appsheets = {sheet3:"sheet3", sheet5:"sheet5"};
            break;
           
    }
    
    
    //var appsheets = {sheet1:currsheet};
    result = SocialCalc.WorkbookControlCreateSheetHTML(appsheets);

    console.log("email size is "+result.length);
    result = stripScriptsFromHtml(result);

    return result;
}

getFSForEmail = function() {
    // window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, sendFileWriterForEmail, failForEmail);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, sendFileWriterForEmail, failForEmail);
}


sendFileWriterForEmail = function(fileSystem) {
   // var path = fileSystem.root.fullPath+"/Invoice.html";
   var path = fileSystem.root.toURL();
   path = path+"Invoice.html";
    //path = "/sdcard";
    console.log(path);
    writer = new FileWriter(path);
    console.log("got file writer");    
    var control = SocialCalc.GetCurrentWorkBookControl();
    //var content = control.workbook.spreadsheet.CreateSheetHTML(); 
    var content = getHtmlContentForApp();

    writer.seek(0);
    writer.write(content);
    AndroidSendEmail("Invoice", "invoice attached", path);
}

failForEmail = function(error) {
    $.mobile.hidePageLoadingMsg();
    console.log("error dealing with FS "+error)
}

AndroidSendEmail = function(subject, body, path) { 
  var extras = {};

  $.mobile.hidePageLoadingMsg();
  console.log("trying to send email")
  extras[window.plugins.webintent.EXTRA_SUBJECT] = subject;
  extras[window.plugins.webintent.EXTRA_TEXT] = body;            
  alert("path is "+ path);
  //path = "/sdcard"
  // path = fileSystem.root.toURL();
  // path = path + "hello.txt";
  extras[window.plugins.webintent.EXTRA_STREAM] = path;

  window.plugins.webintent.startActivity({ 
      action: window.plugins.webintent.ACTION_SEND,
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
            console.log("trying to send email");
	    $.mobile.showPageLoadingMsg();
            console.log("trying to send email1");
            console.log("trying to send email2");
            console.log("trying to send email3");
            console.log("trying to send email4");
            
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
            Cordova.exec('ChildBrowserCommand.showWebPage',encodeURI(path + '/help.html'));

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

/*

SocialCalc.Callbacks.preSheetSwitch = function(sheetid) {
    // for household budget, make sure calc happens on
    // summary and comparison sheets
    if ((sheetid == "sheet1") || (sheetid == "sheet4")){
        var cmdstr = "set A1 text t 1 \n"
        var control = SocialCalc.GetCurrentWorkBookControl();
        cmd = {cmdtype:"scmd", id:sheetid, cmdstr: cmdstr, saveundo: false};
        control.ExecuteWorkBookControlCommand(cmd, false);
    }
}

 */

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
		var str=val+"";
		lines = str.split(/\r\n|\r|\n/);
		if(lines.length>1){SocialCalc.EditorSaveEdit(editor,"Invalid Input");}
		else{
	    SocialCalc.EditorSaveEdit(editor, val);}
	};
	window.setTimeout(callbackfn, 100);
    };
	//Here it begins
		var colorfn = function(val) {
		var callbackfn = function() {
            	console.log("callback val "+val)
	    	SocialCalc.EditorChangecolor(editor, val);
		};
		window.setTimeout(callbackfn, 100);
    		};
		var fontfn = function(val) {
		var callbackfn = function() {
            	console.log("callback val "+val)
	    	SocialCalc.EditorChangefont(editor, val);
		};
		window.setTimeout(callbackfn, 100);
    		};
			/*
				function onPromptt(results) {
    				//alert("You selected button number " + results.buttonIndex + " and entered " + results.input1);
				if(results.buttonIndex==2){
				if(results.input1=="red"||results.input1=="yellow"||results.input1=="green"
				||results.input1=="pink"||results.input1=="blue"||results.input1=="black"
				||results.input1=="grey"||results.input1=="white"||results.input1=="orange"||results.input1=="violet"
				||results.input1=="purple"){
					colorfn(results.input1);	
				}
				else{
				alert('Please Enter valid color name or try using small letters')
				}
				}
			}*/
			

				// Show a custom prompt dialog
				//
				function showPromptt() {
				/*
   				 navigator.notification.prompt(
        			'Please Enter Color name in small letters',  // message
        			onPromptt,                  // callback to invoke
        			'Color Select',            // title
        			['Exit','Ok']              // buttonLabels
    				);*/
				
					/*var thelist = [
    					"red",
    					"yellow",
    					"green",
    					"blue"
					];
					//"Infusion Reminder:\nIt's time to take your infusion",
					ListViewAlert.show(
					"Select Color",
    					thelist,
    					function(selection) {
        				//return alert("You selected " + selection);
					if(selection==1){colorfn("red");
					}
					if(selection==2){colorfn("yellow");
					}
					if(selection==3){colorfn("green);
					}
					if(selection==4){colorfn("blue");
					}
					return alert("Text color changed");
    					}
					);*/
					var thelist = [
    					"Red",
    					"Yellow",
    					"Blue",
    					"Green",
					"Purple"
					];
					var touchindex=0;
					ListViewAlert.show(
    					"Select Color",
    					thelist,
    					function(selection) {
						touchindex=selection;
						if(selection==1){
						colorfn("red");}
						if(selection==2){
						colorfn("yellow");}
						if(selection==3){
						colorfn("blue");}
						if(selection==4){
						colorfn("green");}
						if(selection==5){
						colorfn("purple");}
        				//return alert("Text Color Modified");
    					}
					);
					
				}
	function showPrompttt(){
			//alert('font fn called');
			var thelist = [
    					"Bold",
    					"Italic",
    					"Bold+Italic",
    					"Normal"
					];
					var touchindex=0;
					ListViewAlert.show(
    					"Select Color",
    					thelist,
    					function(selection) {
						touchindex=selection;
						if(selection==1){
						fontfn("Plain bold 12pt Ubuntu");}
						if(selection==2){
						fontfn("italic plain 12pt Ubuntu");}
						if(selection==3){
						fontfn("italic bold 12pt Ubuntu");}
						if(selection==4){
						fontfn("Plain plain 12pt Ubuntu");}
						
        				//return alert("Font Modified");
    					}
					);
	}
var Undo = function() {
	 
       editor.context.sheetobj.SheetUndo();

    };
var Redo = function() {
	 
       editor.context.sheetobj.SheetRedo();

    };
//fn for cut copy paste n erase
var Cut = function(val) {
	 var callbackfn = function() {
            	
	    	SocialCalc.EditorCut(editor, val);
		};
		window.setTimeout(callbackfn, 100);
       
    };
	function showListView(){
			//alert('font fn called');
			var thelist = [
    					"Cancel",
					"Delete",
    					"Font",
    					"Color",

    					"Undo",
					"Redo",
					"Cut",
					"Copy",
					"Paste"

					];
					var touchindex=0;
					ListViewAlert.show(
    					"Customize cell",
    					thelist,
    					function(selection) {
						touchindex=selection;
						if(selection==2){
						Cut("d");}
						if(selection==3){
						showPrompttt();}
						if(selection==4){
						showPromptt();}
						if(selection==5){
						Undo();}
						if(selection==6){
						Redo();}
						if(selection==7){
						Cut("a");}
						if(selection==8){
						Cut("b");}
						if(selection==9){
						Cut("c");}
						
        				return ;//alert("Cell Updated");
    					}
					);
	}
		
	function onConfirm(buttonIndex) {
    		//alert('You selected button ' + buttonIndex);
		//alert('onconcfirm called');
		if(buttonIndex==3){
			showPromptt();		
		}
		if(buttonIndex==2){
			showPrompttt();		
		}
		
	}

	// Show a custom confirmation dialog
	//
	function showPrompt(){
		//alert('Show called');
    	navigator.notification.confirm(
        'Select Operation',  // message
        onConfirm,              // callback to invoke with index of button pressed
        'Cell Customization',            // title
        'Cancel,Font,Color'          // buttonLabels
   	 );}
	var customfn = function() {
		
	var callbackfn = function() {
            //console.log("callback val "+val)
	    //SocialCalc.EditorChangecolor(editor, val);
		//alert('customfn called');
		showListView();
		
	};
	window.setTimeout(callbackfn, 100);
    	};
	
/*	
   var val = prompt( "Enter Value",text );
    if (val) {
	okfn(val);	
    } 
    else if (val.length == 0) {
      okfn('');
    } else {
	cancelfn();	
    }
	
*/	
	
	var ttt=0;
	var onPrompt=function(results) {
        
		if (results.buttonIndex==3) {okfn(results.input1);}
		else if (results.buttonIndex==1) {cancelfn()}
		else {customfn();}
    	};
	
		firstprompt();
	
	
	function firstprompt(){	
		alert('Press Ok to Edit Cell');
		ttt=ttt+1;
	navigator.notification.prompt(
            'Enter Value : ',  // message
            onPrompt,                  // callback to invoke
            'INVOICE',            // title
            ['Exit','Customize','Ok'],             // buttonLabels
            text                // defaultText
        );}
	/*	
	var thelist = [
    	"Add Infusion Entry",
    	"Snooze for 15 Minutes",
    	"Snooze for 1 Hour",
    	"Dismiss"
	];

	ListViewAlert.show(
    	"Infusion Reminder:\nIt's time to take your infusion",
    	thelist,
    	function(selection) {
        return alert("You selected " + selection);
    	}
	);
	*/
	
	
    return true;
}
