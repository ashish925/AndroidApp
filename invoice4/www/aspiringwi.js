var WebIntent=function(){};WebIntent.ACTION_SEND="android.intent.action.SEND";WebIntent.ACTION_VIEW="android.intent.action.VIEW";WebIntent.EXTRA_TEXT="android.intent.extra.TEXT";WebIntent.EXTRA_STREAM="android.intent.extra.STREAM";WebIntent.EXTRA_SUBJECT="android.intent.extra.SUBJECT";WebIntent.prototype.startActivity=function(c,b,a){return PhoneGap.exec(function(d){b(d)},function(d){a(d)},"WebIntent","startActivity",[c])};WebIntent.prototype.hasExtra=function(c,b,a){return PhoneGap.exec(function(d){b(d)},function(d){a(d)},"WebIntent","hasExtra",[c])};WebIntent.prototype.getExtra=function(c,b,a){return PhoneGap.exec(function(d){b(d)},function(d){a(d)},"WebIntent","getExtra",[c])};PhoneGap.addConstructor(function(){PhoneGap.addPlugin("webintent",new WebIntent())});