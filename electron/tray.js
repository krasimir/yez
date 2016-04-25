var electron = require('electron'),
    electronApp = electron.app,
    path = require('path'),
    url = require('url'),
    appIcon = null,
    BrowserWindow = electron.BrowserWindow,
    mainWindow,
    open = require('open'),
    serverPID = process.argv[2] || false,
    mainWindow,
    BrowserWindow = electron.BrowserWindow;

var start = function () {
  buildWindow();
  if (process.argv[3] == 'true') showTray();
};

var showTray = function() {
  if (!appIcon) {
    var icon = 'icon16.png';
    if (process.argv[4] == 'true') icon = 'icon16w.png';
    appIcon = new electron.Tray(path.normalize(__dirname + '/../chrome/img/'+icon));
    appIcon.setToolTip('Yez! is running');
    appIcon.setContextMenu(menu);
  }
};

var hideTray = function() {
  appIcon.destroy();
  appIcon = null;
};

var buildWindow = function() {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({width: 1000, height: 600, show: false});
    var yezPath = path.normalize(__dirname + '/..').replace(/\\/g, '/');
    mainWindow.loadURL('file://'+yezPath+'/chrome/index.html');
    mainWindow.on('minimize',  mainWindow.hide);
    mainWindow.on('closed', function() {
      if (serverPID) process.kill(serverPID);
    });
  }
}

var setLight = function(i) {
  appIcon.setImage(path.normalize(__dirname + '/../chrome/img/icon16.png'));
  if (i !== 'icon') mainWindow.webContents.send('message', 'light');
};

var setDark = function (i) {
  appIcon.setImage(path.normalize(__dirname + '/../chrome/img/icon16w.png'));
  if (i !== 'icon') mainWindow.webContents.send('message', 'dark');
};

var menu = electron.Menu.buildFromTemplate([{
  label: 'Open Yez!',
  click: function () { mainWindow.show(); }
}, {
  type: 'separator'
}, {
  label: 'Light Style',
  type: 'radio',
  checked: true,
  click: setLight
}, {
  label: 'Dark Style',
  type: 'radio',
  click: setDark
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
  click: hideTray
}, {
  label: 'Close',
  click: function() {
    electronApp.quit();
    if (serverPID) process.kill(serverPID);
    process.exit(0);
  }
}]);

electron.ipcMain.on('data', function(event, data) {
  //console.log('tray.js ipc', data);
  if (data.id == 'tray') {
    if (Boolean(data.show)) showTray();
    else hideTray();
  }
  if (data.id == 'theme') {
    if (data.theme == 'light') setLight('icon');
    if (data.theme == 'dark') setDark('icon');
  }
});

electronApp.on('ready', start);

//console.log('Electron is running.');
