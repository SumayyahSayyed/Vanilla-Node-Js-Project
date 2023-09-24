const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { v4: uuid } = require("uuid");
const { use } = require('bcrypt/promises');
const jwt = require('jsonwebtoken');

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET' && parsedUrl.pathname === '/') {
        const filePath = path.join(__dirname, './frontend/index.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.method === 'POST' && parsedUrl.pathname === '/signup') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const userId = uuid();
            // console.log(userId);
            const { username, password } = JSON.parse(body);

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const newData = { userId, username, hashedPassword };
                let jsonData = [];

                // try {
                const data = fs.readFileSync('data.json', 'utf8');
                jsonData = JSON.parse(data);

                const userAlreadyPresent = jsonData.find(user => user.username == newData.username)
                if (userAlreadyPresent) {
                    console.log("User already present");
                }
                // } catch (error) {
                //     console.error('Error reading JSON file:', error);
                // }

                else {
                    jsonData.push(newData);
                    let jwtToken = createJWTtoken(newData); 

                    fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2), 'utf8');

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        message: 'Data received and saved successfully',
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

});

function createJWTtoken(user) {
    let payload = {
        username: user.username,
        userId: user.userId
    }
    let token = jwt.sign(payload, secretKey, { expiresIn: "2h" });
    return token;
}


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});