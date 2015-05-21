var exec = require('cordova/exec');

/**
 * Constructor
 */
function ListViewAlert() {
}

ListViewAlert.prototype.show = function(title, thelist, cb) {
	var list = [].concat(title, thelist);
	return exec(cb, failureCallback, 'ListViewAlert', 'ListViewAlert', list);
};

function failureCallback(err) {
    console.log("ListViewAlert.js failed: " + err);
}

/**
 * Load ListViewAlert
 */
var listViewAlert = new ListViewAlert();
module.exports = listViewAlert;

