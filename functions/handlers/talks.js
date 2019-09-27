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
            res.status(500).json({
                error: err.code
            });
        });
};