const electron = require('electron');
// Module to control application life.
let {app} = electron;
// Module to create native browser window.
const {BrowserWindow,webContents} = require("electron");

var client = require('electron-connect').client;
var $ = require("jquery");
var log = require('electron-log');
var ipc = require('electron').ipcMain;



ipc.on('rightclick', function(event,e){
  e = eval(e);
    var result = BrowserWindow.getFocusedWindow().webContents.inspectElement(e.x,e.y);
    console.log(result);
    event.sender.send('actionReply', result);
});

var defaultWindowOpts = require('electron-browser-window-options');
// defaultWindowOpts.webPreferences.zoomFactor = 1.0;
// defaultWindowOpts.width = 1600;
// defaultWindowOpts.height = 1250;
// defaultWindowOpts.darkTheme = true;

// clone defaults and customize options
var myOpts =  {
  darkTheme : true,
  width:1900,
  height:1080,
  show:false,
  webPreferences:{
    zoomFactor: 1,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent:true,
    experimentalFeatures:true,
    experimentalCanvasFeatures:true
  }

}




function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow(myOpts);
  win.once('ready-to-show', (e) => {
  win.show()
  // console.log(e,Object.getOwnPropertyNames(this))
  // console.log(Object.getOwnPropertyNames(win.webContents))

})
  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/dist/index.html`);
  // Open the DevTools.
  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

// console.log(win);


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
console.log("Window Created")
