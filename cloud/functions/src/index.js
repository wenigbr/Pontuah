const functions = require("firebase-functions");
const admin = require("firebase-admin");
const os = require("os");
const path = require("path");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

admin.initializeApp(functions.config().firebase);
const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const appInstances = {
  http: app,
  db: admin.database(),
  auth: admin.auth(),
  funcDb: functions.database,
  checkAuth: function (strToken) {
    if (!strToken) {
      return new Promise(function(resolve, reject) {
        reject('Invalid token');
      });
    }

    return admin.auth().verifyIdToken(strToken);
  },
  onError: function (res, strMessage) {
    return res.status(500).json({
      status: false,
      message: strMessage
    }); 
  },
  onSuccess: function(res, data) {
    return res.status(200).json(data);
  }
};

// routes 
const common = require("./common")(appInstances);
appInstances.global = common;

const users = require("./api/users")(appInstances);
const establishments = require("./api/establishments")(appInstances);
const points = require("./api/points")(appInstances);
const products = require("./api/products")(appInstances);
const statistics = require("./api/statistics")(appInstances);

app.all("/", (req, res) => {
  return res.status(200).json({
      app: "Pontuah",
      version: "1.0.0"
  });  
});

const api = functions.https.onRequest((request, response) => {
  if (!request.path) {
    request.url = `/${request.url}`; // prepend '/' to keep query params if any
  }
  return app(request, response);
});

module.exports = {
  api,
  establishments,
  points,
  users
};