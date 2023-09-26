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
    else if (req.method === 'GET' && parsedUrl.pathname === '/appendSocials') {
        appendSocials(req, res);
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
    else if (req.method === 'POST' && parsedUrl.pathname === '/saveExp') {
        saveExp(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/getExp') {
        getExp(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/saveEditedExp') {
        saveEditedExp(req, res);
    }
    else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/deleteExp/')) {
        deleteExp(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/saveEdu') {
        saveEdu(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/getEdu') {
        getEdu(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/saveEditedEdu') {
        saveEditedEdu(req, res);
    }
    else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/deleteEdu/')) {
        deleteEdu(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/getDataForAdmin') {
        getDataForAdmin(req, res);
    }
    else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/deleteUser/')) {
        deleteUser(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname.startsWith('/updateUser/')) {
        updateUser(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/savePdf') {
        savePdf(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/getPdf') {
        getPdf(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/deleteToken') {
        deleteToken(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/checkUserType') {
        checkUserType(req, res);
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

function appendSocials(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let links = user.socialLinks;
                // console.log("line 221 Editable:", editable)
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: links
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
                    let aimedProject = user.project[indexValue];

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

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let aimedProject = user.project;
                aimedProject.splice(index, 1);

                fs.writeFile("../data/users.json", JSON.stringify(allUsers, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                        res.writeHead(500);
                        res.end("Internal Server Error");
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'DELETED'
                    }));

                });
            }
        }
    });

}

function saveExp(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { position, company, duration, jobInfo } = JSON.parse(body);
        const expInfo = { position, company, duration, jobInfo };

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);
                let user = allUsers.find(user => user.userId === userId);

                if (user) {
                    if (!user.experience) {
                        user.experience = [];
                    }

                    user.experience.push(expInfo);

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
        })
    })
}

function getExp(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let experiences = user.experience;
                // console.log("experiences: ---", experiences);
                // console.log("line 221 Editable:", editable)
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: experiences
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

function saveEditedExp(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { indexValue, position, company, duration, jobInfo } = JSON.parse(body);
        const projectInfo = { position, company, duration, jobInfo };

        // console.log("Exp Info ----", projectInfo);
        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);
                let user = allUsers.find(user => user.userId === userId);

                if (user) {
                    // console.log("Index: ", indexValue);
                    let aimedProject = user.experience[indexValue];
                    // console.log(aimedProject);

                    aimedProject.position = projectInfo.position;
                    aimedProject.company = projectInfo.company;
                    aimedProject.duration = projectInfo.duration;
                    aimedProject.jobInfo = projectInfo.jobInfo;

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

function deleteExp(req, res) {
    const index = parseInt(req.url.split('/').pop());
    console.log("---------", index);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let aimedExp = user.experience;
                console.log("Aimed Exp: ", aimedExp);
                aimedExp.splice(index, 1);

                fs.writeFile("../data/users.json", JSON.stringify(allUsers, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                        res.writeHead(500);
                        res.end("Internal Server Error");
                        return;
                    }

                    res.writeHead(204);
                    res.end();
                });
            }
        }
    });
}

function saveEdu(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { degree, university, cgpa, duration } = JSON.parse(body);
        const eduInfo = { degree, university, cgpa, duration };

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);
                let user = allUsers.find(user => user.userId === userId);

                if (user) {
                    if (!user.education) {
                        user.education = [];
                    }

                    user.education.push(eduInfo);

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
        })
    })
}

function getEdu(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let educations = user.education;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: educations
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

function saveEditedEdu(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { index, degree, university, cgpa, duration } = JSON.parse(body);
        const eduInfo = { degree, university, cgpa, duration };

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);
                let user = allUsers.find(user => user.userId === userId);

                if (user) {
                    // console.log("Index: ", indexValue);
                    let aimedEdu = user.education[index];
                    console.log(aimedEdu);

                    aimedEdu.degree = eduInfo.degree;
                    aimedEdu.university = eduInfo.university;
                    aimedEdu.cgpa = eduInfo.cgpa;
                    aimedEdu.duration = eduInfo.duration;

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

function deleteEdu(req, res) {
    const index = parseInt(req.url.split('/').pop());
    console.log("---------", index);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let aimedEdu = user.education;
                console.log("Aimed Edu: ", aimedEdu);
                aimedEdu.splice(index, 1);

                fs.writeFile("../data/users.json", JSON.stringify(allUsers, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                        res.writeHead(500);
                        res.end("Internal Server Error");
                        return;
                    }

                    res.writeHead(204);
                    res.end();
                });
            }
        }
    });
}

function getDataForAdmin(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            try {
                const usersData = JSON.parse(fs.readFileSync("../data/users.json", "utf8"));

                // Collect user data in an array
                const userDataArray = [];

                for (let eachUserData of usersData) {
                    let userCredentials = {
                        firstName: eachUserData.firstName,
                        lastName: eachUserData.lastName,
                        userPhone: eachUserData.userPhone,
                        userEmail: eachUserData.userEmail,
                        projects: eachUserData.project
                    };

                    userDataArray.push(userCredentials);
                }

                // Send a single response with all user data
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    userData: userDataArray
                }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '500',
                    message: 'Internal Server Error'
                }));
            }
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                statusCode: '400',
                message: 'User not found'
            }));
        }
    });
}

function deleteUser(req, res) {
    const index = parseInt(req.url.split('/').pop());
    console.log("---------", index);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);

            if (index >= 0 && index < allUsers.length) {
                allUsers.splice(index, 1);

                fs.writeFile("../data/users.json", JSON.stringify(allUsers, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                        res.writeHead(500);
                        res.end("Internal Server Error");
                        return;
                    }

                    res.writeHead(204);
                    res.end();
                });
            }
        }
    });
}

function updateUser(req, res) {
    let body = "";
    const index = parseInt(req.url.split('/').pop());
    // console.log("Update User Index---------", index);

    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { firstName, lastName, userEmail, userPhone } = JSON.parse(body);
        const userInfo = { firstName, lastName, userEmail, userPhone };

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);

                const user = allUsers[index]
                console.log("Found the user: ", user);
                user.firstName = userInfo.firstName;
                user.lastName = userInfo.lastName;
                user.userEmail = userInfo.userEmail;
                user.userPhone = userInfo.userPhone;

                fs.writeFileSync("../data/users.json", JSON.stringify(allUsers, null, 2), "utf8");

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received and saved successfully'
                }));
            }
        });
    })
}

function savePdf(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { pdfURL } = JSON.parse(body);

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);
                let user = allUsers.find(user => user.userId === userId);

                if (user) {
                    if (!user.aboutMe) {
                        user.aboutMe = [];
                    }

                    user.aboutMe.push(pdfURL);

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
        })
    })
}

function getPdf(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let pdfLink = user.aboutMe;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: pdfLink
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

function deleteToken(req, res) {

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let bearerToken = req.headers.authorization;

            console.log("bearer Token", bearerToken);

            if (!bearerToken) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'Token not found in request headers'
                }));
            } else {
                let tokenFile = fs.readFileSync("../data/tokens.json", "utf8");
                let allTokens = JSON.parse(tokenFile);


                const matchToken = allTokens.find(data => data.userId === userId && data.token === bearerToken);
                console.log('TOKEN TO DELETE', matchToken);

                if (matchToken) {
                    const indexToDelete = allTokens.findIndex(data => data.userId === userId && data.token === bearerToken);

                    if (indexToDelete !== -1) {
                        allTokens.splice(indexToDelete, 1);

                        fs.writeFileSync("../data/tokens.json", JSON.stringify(allTokens, null, 2), 'utf8');


                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            statusCode: '200',
                            message: 'Token matched and action performed'
                        }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            statusCode: '401',
                            message: 'Token does not match any stored tokens'
                        }));
                    }
                }
            }
        }
    });
    // })
}

function checkUserType(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let email = user.userEmail;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: email
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


function createJWTtoken(user) {
    let payload = {
        userEmail: user.userEmail,
        userId: user.userId
    }
    let token = jwt.sign(payload, secretKey, { expiresIn: "5m" });
    return token;
}

function createJWTtokenLogin(user) {
    let payload = {
        userEmail: user.verifyEmail,
        userId: user.id
    }
    let token = jwt.sign(payload, secretKey, { expiresIn: "5m" });
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