var electron = require('electron'),
    electronApp = electron.app,
    path = require('path'),
    url = require('url'),
    appIcon = null,
    BrowserWindow = electron.BrowserWindow,
    mainWindow,
    open = require('open'),
    serverPID = process.argv[2] || false;

var showTray = function() {
  appIcon = new electron.Tray(path.normalize(__dirname + '/../chrome/img/icon16w.png'));
  appIcon.setToolTip('Yez! is running');
  appIcon.setContextMenu(menu);
}
;
var showWindow = function() {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  var p = path.normalize(__dirname + '/..').replace(/\\/g, '/');
  mainWindow.loadURL('file://'+p+'/chrome/index.html');

  console.log('file://'+p+'/chrome/index.html');
  mainWindow.on('closed', function() {
    if (serverPID) process.kill(serverPID);
  });
}
var menu = electron.Menu.buildFromTemplate([{
  label: 'Open Yez!',
  click: showWindow
}, {
  type: 'separator'
}, {
  label: 'Light Style',
  type: 'radio',
  checked: true,
  click: function() {
    appIcon.setImage(path.normalize(__dirname + '/../chrome/img/icon16w.png'))
  }
}, {
  label: 'Dark Style',
  type: 'radio',
  click: function() {
    appIcon.setImage(path.normalize(__dirname + '/../chrome/img/icon16.png'))
  }
}, {
  type: 'separator'
}, {
  label: 'View in Store',
  click: function() {
    open('https://chrome.google.com/webstore/detail/yez/acbhddemkmodoahhmnphpcfmcfgpjmap');
  }
}, {
  label: 'About Yez!',
  click: function() {
    open('https://github.com/krasimir/yez');
  }
}, {
  type: 'separator'
}, {
  label: 'Hide',
  click: function() {
    electronApp.quit();
    process.exit(0);
  }
}, {
  label: 'Close',
  click: function() {
    electronApp.quit();
    if (serverPID) process.kill(serverPID);
    process.exit(0);
  }
}]);
electronApp.on('ready', showTray);
console.log('Electron tray icon is running.');
