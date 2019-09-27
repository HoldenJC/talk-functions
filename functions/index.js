const functions = require('firebase-functions');
const app = require('express')();

const { db } = require('./util/admin');

const { getAllTalks } = require('./handlers/talks');

// route to 'GET' all 'talks'
app.get('/talks', getAllTalks);

exports.api = functions.https.onRequest(app);