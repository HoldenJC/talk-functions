const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const { getAllTalks, postTalk, getTalk, commentOnTalk, likeTalk, unlikeTalk, deleteTalk } = require('./handlers/talks');
const { signup, login, uploadImage, addUserDetails, getAuthUser } = require('./handlers/users');

// 'Talk' routes
app.get('/talks', getAllTalks);
app.post('/talk', FBAuth, postTalk);
app.get('/talk/:talkId', getTalk);
app.delete('/talk/:talkId', FBAuth, deleteTalk);
app.get('/talk/:talkId/like', FBAuth, likeTalk);
app.get('/talk/:talkId/unlike', FBAuth, unlikeTalk);
app.post('/talk/:talkId/comment', FBAuth, commentOnTalk);

// 'User' routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthUser);

exports.api = functions.https.onRequest(app);
