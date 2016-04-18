var electron = require('electron-prebuilt');
var proc = require('child_process'); 
var child = proc.spawn(electron, ['node']);