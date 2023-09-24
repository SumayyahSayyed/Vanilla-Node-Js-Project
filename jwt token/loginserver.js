const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === "GET" && parsedUrl.pathname === "/") {
        const pathName = path.join(__dirname, "./frontend/login.html");
        fs.readFile(pathName, "utf8", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-type": "text/plain" });
                res.end("Internal Server Error");
            } else {
                res.writeHead(200, { "Content-type": "text/html" });
                res.end(data);
            }
        });
    } else if (req.method === "POST" && parsedUrl.pathname === "/login") {
        let body = "";
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { username, password } = JSON.parse(body);
            console.log(JSON.parse(body));
            console.log(`Received data: Name: ${username}, Password: ${password}`);

            try {
                const data = fs.readFileSync('data.json', 'utf8');
                jsonData = JSON.parse(data);

                // Check if any object in the array has matching name and password
                const user = jsonData.find(user => user.username === username);
                console.log("line 39", user);
                if (user) {
                    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
                    console.log(passwordMatch);
                    if (passwordMatch) {
                        console.log("Logged In");
                    } else {
                        console.log("Incorrect Password");
                    }
                } else {
                    console.log("User Not found");
                }
            } catch (err) {
                console.error('Error reading JSON file:', err);
            }

            res.writeHead(200, { "Content-type": "text/plain" });
            res.end();
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});