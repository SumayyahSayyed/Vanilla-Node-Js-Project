const fs = require('fs');
const bcrypt = require('bcrypt');
const { v4: uuid } = require("uuid");
const { use } = require('bcrypt/promises');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


const secretKey = process.env.JWT_SECRET_KEY;

dotenv.config();

function SignUp(req, res) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const userId = uuid();
        const { firstName, lastName, userPhone, userEmail, userPassword } = JSON.parse(body);

        try {
            const hashedPassword = await bcrypt.hash(userPassword, 10);
            const newData = { userId, firstName, lastName, userPhone, userEmail, hashedPassword };
            let jsonData = [];
            let tokenArray = [];

            const data = fs.readFileSync('../data/users.json', 'utf8');
            jsonData = JSON.parse(data);

            const userAlreadyPresent = jsonData.find(user => user.userEmail == newData.userEmail)
            if (userAlreadyPresent) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'User already present'
                }));
            }
            else {
                jsonData.push(newData);
                let jwtToken = createJWTtoken(newData);

                tokenArray = JSON.parse(fs.readFileSync("../data/tokens.json", 'utf8'));

                let tokenData = {
                    userId: userId,
                    token: jwtToken
                };

                tokenArray.push(tokenData);

                fs.writeFileSync('../data/users.json', JSON.stringify(jsonData, null, 2), 'utf8');
                fs.writeFileSync('../data/tokens.json', JSON.stringify(tokenArray, null, 2), 'utf8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received and saved successfully',
                    email: userEmail,
                    token: jwtToken
                }));
            }
        } catch (error) {
            console.error('Error hashing password:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    });
}

function createJWTtoken(user) {
    let payload = {
        userEmail: user.userEmail,
        userId: user.userId
    }
    let token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
    return token;
}

module.exports = {
    SignUp
};
