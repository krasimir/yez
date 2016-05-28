var electron = require('electron'),
    electronApp = electron.app,
    path = require('path'),
    url = require('url'),
    appIcon = null,
    BrowserWindow = electron.BrowserWindow,
    mainWindow,
    open = require('open'),
    mainWindow,
    BrowserWindow = electron.BrowserWindow,
    argv, 
    serverPID = false, 
    trayOn = true, 
    darkOn = false,
    httpPort = 9173;

if (process.argv[2]) {
  argv = JSON.parse(process.argv[2]);
  serverPID = argv.pid;
  trayOn = argv.tray;
  darkOn = argv.dark;
  httpPort = argv.port;
}

var start = function () {
  buildWindow();
  if (trayOn) showTray();
};

var showTray = function() {
  if (!appIcon) {
    var icon = 'icon16.png';
    if (darkOn) icon = 'icon16w.png';
    appIcon = new electron.Tray(path.normalize(__dirname + '/../chrome/img/'+icon));
    appIcon.setToolTip('Yez! is running');
    appIcon.setContextMenu(menu);
    appIcon.on('click', function () {
      mainWindow.show()
    });
  }
};

var hideTray = function(i) {  
  if (appIcon) { 
    appIcon.destroy();
    appIcon = null;
  }
};

var buildWindow = function() {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({width: 416, height: 507, show: false});
    var yezPath = path.normalize(__dirname + '/..').replace(/\\/g, '/');
    mainWindow.loadURL('file://'+yezPath+'/chrome/index.html');
    mainWindow.on('minimize',  mainWindow.hide);
    mainWindow.on('closed', function() {
      if (serverPID) process.kill(serverPID);
    });
  }
};

var setLight = function(i) {
  darkOn = false;
  if (appIcon) appIcon.setImage(path.normalize(__dirname + '/../chrome/img/icon16.png'));  
};

var setDark = function (i) {
  darkOn = true;
  if (appIcon) appIcon.setImage(path.normalize(__dirname + '/../chrome/img/icon16w.png'));  
};

var menu = electron.Menu.buildFromTemplate([{
  label: 'Open Yez!',
  click: function () { mainWindow.show(); }
}, {
  label: 'Yez! in browser',
  click: function () { open('http://localhost:'+httpPort) }
}, {
  type: 'separator'
}, {
  label: 'Light Theme',
  type: 'radio',
  checked: !darkOn,
  click: function () {
    setLight();
    if (mainWindow) mainWindow.webContents.send('theme', 'light');    
  }
}, {
  label: 'Dark Theme',
  type: 'radio',
  checked: darkOn,
  click: function () {
    setDark();
    if (mainWindow) mainWindow.webContents.send('theme', 'dark');
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
  click: function () {
    hideTray();
    if (mainWindow) mainWindow.webContents.send('tray', false);    
  }
}, {
  label: 'Close',
  click: function() {
    if (serverPID) process.kill(serverPID);
    electronApp.quit();
    process.exit(0);
  }
}]);

electron.ipcMain.on('data', function(event, data) {
  if (data.action == 'tray') {
    if (Boolean(data.show)) showTray();
    else hideTray('icon');
  }
  if (data.action == 'theme') {
    if (data.theme == 'light') setLight();
    else setDark();
  }
});

electronApp.on('ready', start);

console.log('Yez! electron task is running.');
