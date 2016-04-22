var electron = require('electron'),
    electronApp = electron.app,
    path = require('path'),
    appIcon = null,
    open = require('open'),
    serverPID = process.argv[2] || false;

electronApp.on('ready', function(){

    appIcon = new electron.Tray( path.normalize( __dirname + '/../chrome/img/icon16w.png') );
    appIcon.setToolTip('Yez! is running');
    appIcon.setContextMenu(electron.Menu.buildFromTemplate([
      {
        label: 'Light Style', 
        type: 'radio', 
        checked: true, 
        click: function () { appIcon.setImage( path.normalize( __dirname + '/../chrome/img/icon16w.png') ) } 
      }, { 
        label: 'Dark Style', 
        type: 'radio', 
        click: function () { appIcon.setImage( path.normalize( __dirname + '/../chrome/img/icon16.png') ) } 
      }, { 
        type: 'separator'
      }, {
        label: 'Developer tools', 
        click: function () { TaskRunner().run('devtool'); } 
      }, { 
        type: 'separator'
      }, { 
        label: 'View in Store', 
        click: function () { open('https://chrome.google.com/webstore/detail/yez/acbhddemkmodoahhmnphpcfmcfgpjmap'); } 
      }, { 
        label: 'About Yez!', 
        click: function () { open('https://github.com/krasimir/yez'); } 
      }, { 
        type: 'separator'
      }, { 
        label: 'Hide', click: function () { electronApp.quit(); process.exit(0); }          
      }, { 
        label: 'Close', click: function () {
          electronApp.quit();
          if (serverPID) process.kill(serverPID);
          process.exit(0);
        } 
      }
    ]));
});

console.log('Electron tray icon is running.');