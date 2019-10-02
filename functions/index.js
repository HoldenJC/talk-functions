const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const { getAllTalks, postTalk, getTalk, commentOnTalk, likeTalk, unlikeTalk, deleteTalk } = require('./handlers/talks');
const {
	signup,
	login,
	uploadImage,
	addUserDetails,
	getAuthUser,
	getUserDetails,
	readNotifications
} = require('./handlers/users');

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
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, readNotifications);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore.document('likes/{id}').onCreate((snapshot) => {
	return db
		.doc(`/talks/${snapshot.data().talkId}`)
		.get()
		.then((doc) => {
			if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
				return db.doc(`/notifications/${snapshot.id}`).set({
					createdAt: new Date().toISOString(),
					recipient: doc.data().userHandle,
					sender: snapshot.data().userHandle,
					type: 'like',
					read: false,
					talkId: doc.id
				});
			}
		})
		.catch((err) => {
			console.error(err);
		});
});

exports.deleteNotificationOnUnlike = functions.firestore.document('likes/{id}').onDelete((snapshot) => {
	return db.doc(`/notifications/${snapshot.id}`).delete().catch((err) => {
		console.error(err);
		return;
	});
});

exports.createNotificationOnComment = functions.firestore.document('comments/{id}').onCreate((snapshot) => {
	return db
		.doc(`/talks/${snapshot.data().talkId}`)
		.get()
		.then((doc) => {
			if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
				return db.doc(`/notifications/${snapshot.id}`).set({
					createdAt: new Date().toISOString(),
					recipient: doc.data().userHandle,
					sender: snapshot.data().userHandle,
					type: 'comment',
					read: false,
					talkId: doc.id
				});
			}
		})
		.catch((err) => {
			console.error(err);
			return;
		});
});

exports.onUserImageChange = functions.firestore.document('/users/{userId}').onUpdate((change) => {
	if (change.before.data().imageUrl !== change.after.data().imageUrl) {
		const batch = db.batch();
		return db.collection('talks').where('userHandle', '==', change.before.data().handle).get().then((data) => {
			data.forEach((doc) => {
				const talk = db.doc(`/talks/${doc.id}`);
				batch.update(talk, { userImage: change.after.data().imageUrl });
			});
			return batch.commit();
		});
	}
});

exports.onTalkDelete = functions.firebase.document('/talks/{talkId}').onDelete((snapshot, context) => {
	const talkId = context.params.talkId;
	const batch = db.batch();
	return db
		.collection('comments')
		.where('talkId', '==', talkId)
		.get()
		.then((data) => {
			data.forEach((doc) => {
				batch.delete(db.doc(`/comments/${doc.id}`));
			});
			return db.collection('likes').where('talkId', '==', talkId).get();
		})
		.then((data) => {
			data.forEach((doc) => {
				batch.delete(db.doc(`/likes/${doc.id}`));
			});
			return db.collection('notifications').where('talkId', '==', talkId).get();
		})
		.then((data) => {
			data.forEach((doc) => {
				batch.delete(db.doc(`/notifications/${doc.id}`));
			});
			return batch.commit();
		})
		.catch((err) => console.error(err));
});
