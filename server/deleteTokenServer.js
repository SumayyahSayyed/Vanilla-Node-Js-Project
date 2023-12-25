const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function deleteToken(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (!userId) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                statusCode: '401',
                message: 'Unauthorized'
            }));
            return;
        }

        const bearerToken = req.headers.authorization;

        if (!bearerToken) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                statusCode: '400',
                message: 'Token not found in request headers'
            }));
            return;
        }

        const deleteTokenQuery = `
            DELETE FROM tokens 
            WHERE user_ID = ? AND JWT_Token = ?`;

        db.query(deleteTokenQuery, [userId, bearerToken], (err, results) => {
            if (err) {
                console.error('Could not delete token', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '500',
                    message: 'Internal Server Error'
                }));
            } else if (results.affectedRows === 0) {
                // Token not found, send an appropriate response.
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '404',
                    message: 'Token not found'
                }));
            } else {
                console.log('Token deleted successfully');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Token deleted successfully'
                }));
            }
        });
    });
}

module.exports = {
    deleteToken
};
