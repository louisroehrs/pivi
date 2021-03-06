DEBUG=true;
HOST = null; // localhost
PORT = 9663;

VIDEODATADIRECTORY='/home/pi/dev/pivi/pividata/';
//VIDEODATADIRECTORY='/Users/lroehrs/dev/pivi/pividata/';

// when the daemon started
var starttime = (new Date()).getTime();

var mem = process.memoryUsage();
// every 10 seconds poll for the memory.
setInterval(function () {
  mem = process.memoryUsage();
}, 10*1000);


var fu = require('./js/fu'),
    url = require('url'),
    qs = require('querystring'),
    fs = require('fs'),
    omx = require('./js/omxcontrol-master'),
    exec  = require('child_process').exec,
    child,
    nowplaying,
    playerstate,
    listing = new Array();



var pivi = exports;

pivi.getListing = function() {
  listing = new Array();
  var fileDirectories = fs.readdirSync(VIDEODATADIRECTORY);
  
  fileDirectories.forEach(function (entry) {
	  if (entry != '.DS_Store') {
	    var directory = { directory : entry};
	    var files = fs.readdirSync(VIDEODATADIRECTORY  + entry);
	    directory.files = new Array();
	    files.forEach(function (file) {
		    directory.files.push(file);
	    });
	    listing.push (directory);
	  }
  });
  
  return listing;
}

fu.listen(Number(process.env.PORT || PORT), HOST);

// we do have a data handler, so override for the static files
fu.get("/",fu.staticHandler("../client/html/pivi.html"));
fu.get("/js/jquery-1.6.2.js",fu.staticHandler("../client/js/jquery-1.6.2.js"));
fu.get("/js/jquery-3.4.1.js",fu.staticHandler("../client/js/jquery-3.4.1.js"));
fu.get("/js/jquery-ui-1.11.4/jquery.js",fu.staticHandler("../client/js/jquery-ui-1.11.4/jquery.js"));
fu.get("/fonts/okuda/Okuda.otf",fu.staticHandler("../client/fonts/okuda/Okuda.otf"));

fu.get("/dir", function (req, res) {
  var listing = pivi.getListing();
  res.simpleJSON(200, listing);
});

fu.get("/add", function(req,res) {
  console.log("DL: ",req.url);
  var myurl = qs.parse(url.parse(req.url).query).url;
  var dir =  qs.parse(url.parse(req.url).query).directory;
  child = exec("youtube-dl -f 'best' -o '" + VIDEODATADIRECTORY + dir +"/%(title)s^%(id)s.%(ext)s' "  + myurl,
		           function (error, stdout, stderr) {
		             console.log('stdout: ' + stdout);
		             console.log('stderr: ' + stderr);
		             if (error !== null) {
			             console.log('exec error: ' + error);
		             } else {
			             res.simpleJSON(200, pivi.getListing());
		             }
		           });
});


fu.get("/addcategory", function(req,res) {
  console.log("New Category: ",req.url);
  var name = qs.parse(url.parse(req.url).query).name;
  fs.mkdir(VIDEODATADIRECTORY + name, (err) => {
	  if (err) res.simpleJSON(500, { "status": 500, "message": "Could not create group " + name});
	  else res.simpleJSON(200, { "status" : 200, "message" : "Category " + name + ' added.'})
  });
	
});


fu.get("/play", function (req, res) {
  console.log(req.url);
  var filename = qs.parse(url.parse(req.url).query).filename;
  if (filename == '<stop>') {
	  omx.quit();
	  nowplaying = "";
	  filename = "";
	  playerstate = "Stopped";
  }
  else if (filename == '<pause>') {
	  omx.pause();
	  if (playerstate == "Paused" ) {
	    playerstate = "Playing";
	    filename = nowplaying;
	  } else if (playerstate == "Playing") {
	    playerstate = "Paused";
	    filename = "Paused: "+nowplaying;
	  }
  } else if (filename == '<backward>') {
	  omx.backward();
	  filename = nowplaying;
  } else if (filename == '<rewind>') {
	  omx.rewind();
	  filename = nowplaying;
  } else if (filename == '<forward>') {
	  omx.forward();
	  filename = nowplaying;
  }  else if (filename == '<louder>') {
	  omx.sendKey('+');
	  filename = nowplaying;
  }  else if (filename == '<quieter>') {
	  omx.sendKey('-');
	  filename = nowplaying;
  }
  
  else  // play the file
  { 
	  omx.quit();
	  
	  omx.start(VIDEODATADIRECTORY + filename);
	  playerstate = "Playing";
	  console.log("================"+filename);
    var names = filename.split('/');
	  console.log(names);
    filename = names[1].match(/.*?(?=\^)/)[0];
	  console.log(filename);
	  nowplaying = filename;
  }
  
  res.simpleJSON(200, {playing: filename});
});
