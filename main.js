// jshint esversion: 10
const electron = require('electron');
// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu, Tray} = electron;
const path = require('path');
const events = require('events');
const fs = require('fs');
const windowStateKeeper = require('electron-window-state');
const screenshot = require('screenshot-desktop');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const {AbortController} = require('@azure/abort-controller');
const Shell = require('node-powershell');

// disable security warnings
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
process.env['ELECTRON_ENABLE_LOGGING'] = 'true';

var MainInfo = require('./models/maininfo.js');

let mainWindow, tray;

const ps = new Shell({
  executionPolicy: 'Bypass',
  noProfile: true
});

let trayMenu = Menu.buildFromTemplate([
  {
    label: 'Quit', click:  function(){
    app.isQuiting = true;
    tray.destroy();
    app.quit();
    }
  }
]);

function createTray() {

  tray = new Tray(path.join(__dirname,'icon.png'));
  tray.setToolTip('LOGINVSI feedback application');
  tray.on('click', e => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  tray.setContextMenu(trayMenu);
}

function createWindow () {

  //createTray();

  // save the window state
  let winState = windowStateKeeper({
    defaultWidth: 800, defaultHeight: 600,
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: winState.width,
    height: winState.height,
    x: winState.x,
    y: winState.y,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    //icon: __dirname + '/assets/images/index.png',
    show: false
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);

  mainWindow.setResizable(false);

  winState.manage(mainWindow);

  mainWindow.on('context-menu', e => {
    contextMenu.popup();
  });

  // when window is ready it will take screenshot
  mainWindow.once('ready-to-show', () => {
       mainWindow.show();


       MainInfo.findOne({
         order: [ [ 'createdAt', 'DESC' ]]
       }).then(data => {
         setTimeout(() => {
           let num = data.dataValues.id + 1;

           screenshot({ filename: 'C:\\Users\\Public\\' + num + '.png' });

           setTimeout(() => {
           // upload the photos to azure
           localFilePath = 'C:\\Users\\Public\\' + num + '.png';

           uploadLocalFile(aborter, containerClient, localFilePath);
           console.log(`Local file "${localFilePath}" is uploaded`);

           ps.addCommand('Remove-Item -Path C:\\Users\\Public\\' + num + '.png' + ' -Force');
           ps.invoke()
           .then()
           .catch(err => {
             console.log(err);
           });
         }, 1000);
       }, 100);
      });

  });

  // dont quit the app
  mainWindow.on('close', (event) => {
    //win = null
    event.preventDefault();
    mainWindow.hide();
  });

  // after sleep tray will be displayed in taskbar
  electron.powerMonitor.on('resume', e => {
    if(!mainWindow) {
      createTray();
    }
  });
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready',createWindow);

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

const STORAGE_ACCOUNT_NAME = 'feedbacks';
const ACCOUNT_ACCESS_KEY = 'wExU6HD8fOVmSzRG1d9PfsIG0pObNfSNkfUcJnrMFm707ktMCDt/XjmEc5zIXDx1db2nLBy6/1kw5zosqN9X+w==';

const credentials = new StorageSharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
const blobServiceClient = new BlobServiceClient(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,credentials);

const containerName = "screenshots";
const containerClient = blobServiceClient.getContainerClient(containerName);

const aborter = AbortController.timeout(30 * 60);

async function uploadLocalFile(aborter, containerClient, filePath) {
    filePath = path.resolve(filePath);

    const fileName = path.basename(filePath);

    const blobClient = containerClient.getBlobClient(fileName);
    const blockBlobClient = blobClient.getBlockBlobClient();

    return await blockBlobClient.uploadFile(filePath,aborter);
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
