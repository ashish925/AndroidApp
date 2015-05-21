cordova-android-listview-alert
==============================

A cordova plugin that supports alerts with a title and a listview

Installation
------------
`cordova plugin add https://github.com/mgerlach-klick/cordova-android-listview-alert`

Usage
-----
	var infusionlist = [
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

Notes
-----
- Title is two lines only and not too long
- The returned array indexes start with 1, not 0
