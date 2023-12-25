const fs = require('fs');
const db = require("./dbServer");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

async function LogIn(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { verifyEmail, verifyPassword } = JSON.parse(body);

        const userQuery = `SELECT user_ID, Email, Password FROM users WHERE Email = ?`;

        db.query(userQuery, [verifyEmail], async (err, results) => {
            if (err) {
                console.error('Error checking for an existing user:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: "500",
                    message: 'Internal Server Error'
                }));
                return;
            }

            if (results.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '404',
                    message: 'User not found'
                }));
                return;
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(verifyPassword, user.Password);

            if (passwordMatch) {
                const jwtToken = createJWTtokenLogin(user);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Logged in successfully',
                    email: verifyEmail,
                    token: jwtToken
                }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: "401",
                    message: "Incorrect Password"
                }));
            }
        });
    });
}

function createJWTtokenLogin(user) {
    const payload = {
        userEmail: user.Email,
        userId: user.user_ID
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
    return token;
}

module.exports = {
    LogIn
};
