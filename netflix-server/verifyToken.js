const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    if (req.headers.authorization != undefined) {
        let token = req.headers.authorization.split(' ')[1];

        jwt.verify(token, 'random369', (err, userCred) => {
            if (err === null) {
                next();
            } else {
                res.status(401).send({ massage: 'Invalid Token' });
            }
        });
    } else {
        res.status(403).send({ massage: 'Please Authicate' });
    }
};

module.exports = verifyToken;
