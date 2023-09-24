const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { v4: uuid } = require("uuid");
const { use } = require('bcrypt/promises');
const jwt = require('jsonwebtoken');
const cors = require('cors');

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    cors()(req, res, () => { });

    if (req.method === 'POST' && parsedUrl.pathname === '/signup') {
        SignUp(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/login') {
        LogIn(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/profile') {
        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                getDataFromDatabase(userId, res);
            }
        });
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/socials') {
        socials(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/editableData') {
        editableData(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/getEditableData') {
        getEditableData(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/saveProjects') {
        saveProjects(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname == '/getProjects') {
        getProjects(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/saveEditedProject') {
        saveEditedProject(req, res);
    }
    else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/deleteProject/')) {
        deleteProject(req, res);
    }
});

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

                fs.writeFileSync('../data/users.json', JSON.stringify(jsonData, null, 2), 'utf8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
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

function LogIn(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { verifyEmail, verifyPassword } = JSON.parse(body);
        // console.log(JSON.parse(body));
        // console.log(`Received data: Name: ${username}, Password: ${password}`);

        const data = fs.readFileSync('../data/users.json', 'utf8');
        jsonData = JSON.parse(data);

        const user = jsonData.find(user => user.userEmail === verifyEmail);
        // console.log("line 39", user);
        if (user) {
            const passwordMatch = await bcrypt.compare(verifyPassword, user.hashedPassword);
            if (passwordMatch) {
                let id = user.userId;
                let newData = { id, verifyEmail };
                let jwtToken = createJWTtokenLogin(newData);

                // console.log('line 96', passwordMatch);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: "200",
                    message: "Login Successfull",
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

function socials(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { githubLink, linkedinLink, twitterlink } = JSON.parse(body);
        const socialsData = { githubLink, linkedinLink, twitterlink };


        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);
                let user = allUsers.find(user => user.userId === userId);

                if (user) {
                    user.socialLinks = socialsData;
                    fs.writeFileSync("../data/users.json", JSON.stringify(allUsers, null, 2), "utf8");
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data received and saved successfully'
                    }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '400',
                        message: 'User not found'
                    }));
                }
            }
        });
    })
}

function editableData(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { position, aboutMe } = JSON.parse(body);
        const editable = { position, aboutMe };

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);
                let user = allUsers.find(user => user.userId === userId);

                if (user) {
                    user.editableData = editable;
                    fs.writeFileSync("../data/users.json", JSON.stringify(allUsers, null, 2), "utf8");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data received and saved successfully'
                    }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '400',
                        message: 'User not found'
                    }));
                }
            }
        });
    })
}

function getEditableData(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let editable = user.editableData;
                // console.log("line 221 Editable:", editable)
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: editable
                }));
            }
            else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'User not found'
                }));
            }
        }
    })
}

function saveProjects(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg } = JSON.parse(body);
        const projectInfo = { projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg };

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);
                let user = allUsers.find(user => user.userId === userId);

                if (user) {

                    if (!user.project) {
                        user.project = [];
                    }

                    user.project.push(projectInfo);

                    fs.writeFileSync("../data/users.json", JSON.stringify(allUsers, null, 2), "utf8");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data received and saved successfully'
                    }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '400',
                        message: 'User not found'
                    }));
                }
            }
        });
    })
}

function getProjects(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let projects = user.project;
                // console.log("line 221 Editable:", editable)
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: projects
                }));
            }
            else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'User not found'
                }));
            }
        }
    })
}

function saveEditedProject(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { indexValue, projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg } = JSON.parse(body);
        const projectInfo = { projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg };

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);
                let user = allUsers.find(user => user.userId === userId);

                if (user) {
                    // console.log("Index: ", indexValue);
                    let aimedProject = user.project[indexValue];
                    // console.log(aimedProject);

                    aimedProject.projectNameData = projectInfo.projectNameData;
                    aimedProject.projectDescription = projectInfo.projectDescription;
                    aimedProject.tags = projectInfo.tags;
                    aimedProject.projectLiveLink = projectInfo.projectLiveLink;
                    aimedProject.projectRepo = projectInfo.projectRepo;
                    aimedProject.projectImg = projectInfo.projectImg;

                    fs.writeFileSync("../data/users.json", JSON.stringify(allUsers, null, 2), "utf8");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data received and saved successfully'
                    }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '400',
                        message: 'User not found'
                    }));
                }
            }
        });
    })
}

function deleteProject(req, res) {
    const index = parseInt(req.url.split('/').pop());
    console.log("---------", index);

    fs.readFile("../data/users.json", (err, data) => {
        if (err) {
            console.error(err);
            res.writeHead(500);
            res.end("Internal Server Error");
            return;
        }

        const projects = JSON.parse(data);
        // console.log(projects[index]);

        // Check if the project exists at the specified index.
        // if (index >= 0 && index < projects.length) {
        //     // Delete the project from the array.
        //     projects.splice(index, 1);

        //     // Write the updated data back to the JSON file.
        //     fs.writeFile("../ data / users.json", JSON.stringify(projects, null, 2), (err) => {
        //         if (err) {
        //             console.error(err);
        //             res.writeHead(500);
        //             res.end("Internal Server Error");
        //             return;
        //         }

        //         // Respond with a success status.
        //         res.writeHead(204);
        //         res.end();
        //     });
        // } else {
        //     res.writeHead(404);
        //     res.end("Project not found");
        // }
    });

}




function createJWTtoken(user) {
    let payload = {
        userEmail: user.userEmail,
        userId: user.userId
    }
    let token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    return token;
}

function createJWTtokenLogin(user) {
    let payload = {
        userEmail: user.verifyEmail,
        userId: user.id
    }
    let token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
    return token;
}

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
                // Call the callback function with the userId
                callback(userId);
            }
        });
    }
}

function getDataFromDatabase(userId, res) {
    const users = fs.readFile("../data/users.json", "utf8", (err, users) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.writeHead(500, { 'Content-Type': "application/json" });
            res.end(JSON.stringify({
                statusCode: "500",
                message: "internal server error"
            }));
        }
        else {
            const jsonData = JSON.parse(users);

            const data = jsonData.find((user) => user.userId === userId);
            if (data) {
                let userData = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    userEmail: data.userEmail,
                    userPhone: data.userPhone
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Token found',
                    userInfo: userData
                }));
            }
            else {
                res.writeHead(404, { 'Content-Type': "application/json" });
                res.end(JSON.stringify({
                    statusCode: "404",
                    message: "user not found"
                }));
            }
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});