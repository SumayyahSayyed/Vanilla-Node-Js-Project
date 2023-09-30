const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

function LogIn(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { verifyEmail, verifyPassword } = JSON.parse(body);

        const data = fs.readFileSync('../data/users.json', 'utf8');
        jsonData = JSON.parse(data);

        const user = jsonData.find(user => user.userEmail === verifyEmail);
        if (user) {
            const passwordMatch = await bcrypt.compare(verifyPassword, user.hashedPassword);
            if (passwordMatch) {
                let id = user.userId;
                let newData = { id, verifyEmail };
                let jwtToken = createJWTtokenLogin(newData);

                let tokenArray = [];
                tokenArray = JSON.parse(fs.readFileSync("../data/tokens.json", 'utf8'));
                let tokenData = {
                    userId: id,
                    token: jwtToken
                };

                tokenArray.push(tokenData);

                fs.writeFileSync('../data/tokens.json', JSON.stringify(tokenArray, null, 2), 'utf8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: "200",
                    message: "Login Successfull",
                    email: verifyEmail,
                    token: jwtToken
                }))
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: "401",
                    message: "Incorrect Password"
                }))
            }
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                statusCode: "401",
                message: "User Not Found"
            }))
        }
    });
}

function createJWTtokenLogin(user) {
    let payload = {
        userEmail: user.verifyEmail,
        userId: user.id
    }
    let token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
    return token;
}

module.exports = {
    LogIn
};