const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const { getAllTalks, postTalk, getTalk, commentOnTalk } = require('./handlers/talks');
const { signup, login, uploadImage, addUserDetails, getAuthUser } = require('./handlers/users');

// 'Talk' routes
app.get('/talks', getAllTalks);
app.post('/talk', FBAuth, postTalk);
app.get('/talk/:talkId', getTalk);
// TODO: delete talk
// TODO: like a talk
// TODO: unlike a talk
app.post('/talk/:talkId/comment', FBAuth, commentOnTalk);

// 'User' routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthUser);

exports.api = functions.https.onRequest(app);
