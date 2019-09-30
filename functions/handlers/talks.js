const { db } = require('../util/admin');

exports.getAllTalks = (req, res) => {
	db
		.collection('talks')
		.orderBy('createdAt', 'desc')
		.get()
		.then((data) => {
			let talks = [];
			data.forEach((doc) => {
				talks.push({
					talkId: doc.id,
					...doc.data()
				});
			});
			return res.json(talks);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({ error: err.code });
		});
};

exports.postTalk = (req, res) => {
	if (req.body.body.trim() === '') {
		return res.status(400).json({
			body: 'Body text must not be empty'
		});
	}

	const newTalk = {
		body: req.body.body,
		userHandle: req.user.handle,
		createdAt: new Date().toISOString()
	};

	db
		.collection('talks')
		.add(newTalk)
		.then((doc) => {
			const resTalk = newTalk;
			resTalk.talkId = doc.id;
			res.json(resTalk);
		})
		.catch((err) => {
			res.status(500).json({
				error: 'something went wrong'
			});
			console.error(err);
		});
};

// GET one talk
exports.getTalk = (req, res) => {
	let talkData = {};
	db
		.doc(`/talks/${req.params.talkId}`)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return res.status(404).json({ error: 'Talk not found' });
			}
			talkData = doc.data();
			talkData.talkId = doc.id;
			return db
				.collection('comments')
				.orderBy('createdAt', 'desc')
				.where('talkId', '==', req.params.talkId)
				.get();
		})
		.then((data) => {
			talkData.comments = [];
			data.forEach((doc) => {
				talkData.comments.push(doc.data());
			});
			return res.json(talkData);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: err.code });
		});
};

// comment on talk
exports.commentOnTalk = (req, res) => {
	if (req.body.body.trim() === '') return res.status(400).json({ error: 'Field cannot be empty' });

	const newComment = {
		body: req.body.body,
		createdAt: new Date().toISOString(),
		talkId: req.params.talkId,
		userHandle: req.user.handle,
		userImage: req.user.imageUrl
	};

	db
		.doc(`/talks/${req.params.talkId}`)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return res.status(404).json({ error: 'Talk not found' });
			}
			return db.collection('comments').add(newComment);
		})
		.then(() => {
			res.json(newComment);
		})
		.catch((err) => {
			console.log(err);
			res.stats(500).json({ error: 'Something went wrong' });
		});
};
