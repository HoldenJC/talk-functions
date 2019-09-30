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
}