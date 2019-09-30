const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const { getAllTalks, postTalk } = require('./handlers/talks');
const { signup, login } = require('./handlers/users');

// GET all 'talks' route
app.get('/talks', getAllTalks);

// POST a 'talk' route
app.post('/talk', FBAuth, postTalk);

// SIGNUP route
app.post('/signup', signup);

// LOGIN route
app.post('/login', login);

exports.api = functions.https.onRequest(app);