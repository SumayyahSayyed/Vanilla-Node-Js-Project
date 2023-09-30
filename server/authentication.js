const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

function getAndVerifyToken(req, res, callback) {
    let bearerToken = req.headers.authorization;

    if (!bearerToken) {
        res.writeHead(400, { 'Content-Type': "application/json" });
        res.end(JSON.stringify({
            statusCode: "400",
            message: "token not found"
        }));
    }
    else {
        jwt.verify(bearerToken, secretKey, (err, decoded) => {
            if (err) {
                res.writeHead(401, { 'Content-Type': "application/json" });
                res.end(JSON.stringify({
                    statusCode: "401",
                    message: "invalid token"
                }));
            }
            else {
                let userId = decoded.userId;
                callback(userId);
            }
        });
    }
}

module.exports = {
    getAndVerifyToken
};