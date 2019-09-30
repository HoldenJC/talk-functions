const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const { getAllTalks, postTalk } = require('./handlers/talks');
const { signup, login, uploadImage } = require('./handlers/users');

// 'Talk' routes
app.get('/talks', getAllTalks);
app.post('/talk', FBAuth, postTalk);

// 'User' routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);