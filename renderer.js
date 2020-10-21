//jshint esversion:10

const Sequelize = require('sequelize');
const childProcess = require('child_process');
const Shell = require('node-powershell');
const storage = require('electron-localstorage');
const express = require('express');
const router = express.Router();
const remote = require('electron').remote;

const app = express();

// database models
var Updates = require('./models/listofupdates.js');
var Windows = require('./models/listofwindows.js');
var Services = require('./models/services.js');
var MainInfo = require('./models/maininfo.js');

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// updates
let result = childProcess.execSync('wmic qfe list').toString();
result = result.split('  ');
let filtered = result.filter(function (el) {
  return el != "";
});

let des = [];
let fix = [];
let date = [];
for(let i = 13; i < filtered.length; i += 6) {
  des.push(filtered[i]);
  fix.push(filtered[i + 1]);
  date.push(filtered[i + 3]);
}

// services
const exec = require("child_process").exec;
let lines = [];
let stdout = childProcess.execSync('sc query state= all').toString().split("\r\n");
lines = stdout.filter(function(line) {
  if(line.indexOf("SERVICE_NAME") !== -1 || line.indexOf("STATE") !== -1){
    return line;
  }
});

let services = [];
for(let i = 0; i < lines.length; i += 2) {
  service = {
    "Service": lines[i].replace("SERVICE_NAME: ", ""),
    "State": lines[i + 1].split(': ')[1],
  };
  services.push(service);
}

// windows version
var os = navigator.appVersion;

// ip address
var ip = require("ip");

// running apps
const ps = new Shell({
  executionPolicy: 'Bypass',
  noProfile: true
});

ps.addCommand('gps | ? {$_.mainwindowtitle} | select name, mainwindowtitle | ft -AutoSize');
ps.invoke()
.then(output => {
  storage.setItem(`output`, output);
  windows = output.toString();
  output = output.toString().split(/\r?\n/);
  output = output.filter(el => {
    return el != "";
  });
  output = output.slice(2, output.length);

})
.catch(err => {
  console.log(err);
});
let windows = storage.getItem('output').split(/\r?\n/);
windows = windows.filter(el => {
  return el != "";
});
let apps = windows.slice(2, windows.length);

storage.clear();

document.querySelector('#submit').addEventListener('click', () => {
    let email = document.getElementById("emailad").value;
    let rating = document.querySelector('input[name="rating"]:checked').value;
    let comment = document.getElementById('comment').value;

    MainInfo.create({
      num_of_stars: rating,
      ip: ip.address(),
      windows_type: os,
      email: email
    }).then(x => {

    }).catch(err => {
      console.log(err);
    });

    // find last id
    MainInfo.findOne({
      order: [ [ 'createdAt', 'DESC' ]]
    }).then(data => {

      // insert all running apps
      let applications = [];

      for(let i = 0; i < apps.length; i++) {
        let app = {
          idwn: data.dataValues.id,
          windows: apps[i]
        };
        applications.push(app);
      }

      Windows.bulkCreate(applications).then(() => {
        console.log('running apps are inserted');
      }).catch(err => {
        console.log(err);
      });

      // insert all updates
      let updates = [];

      for(let i = 0; i < des.length; i++) {
        let update = {
          idup: data.dataValues.id,
          description: des[i],
          hotfixid: fix[i],
          installedOn: date[i]
        };
        updates.push(update);
      }

      Updates.bulkCreate(updates).then(() => {
        console.log('updates are inserted');
      }).catch(err => {
        console.log(err);
      });

      // insert all running Services
      let allservices = [];

      for(let i = 0; i < services.length; i++) {
        let service = {
          idser: data.dataValues.id,
          name: services[i].Service,
          state: services[i].State
        };
        allservices.push(service);
      }

      Services.bulkCreate(allservices).then(() => {
        console.log('services are inserted');
      }).catch(err => {
        console.log(err);
      });

      window.location.assign("success/success.html");

    });

});
