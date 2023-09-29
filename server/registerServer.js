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
    else if (req.method === 'GET' && parsedUrl.pathname === '/checkUserTypeOnAdmin') {
        checkUserType(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/checkUserTypeOnUser') {
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
        let jsonData = [];
        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                const socialsData = { userId, githubLink, linkedinLink, twitterlink };
                let data = fs.readFileSync("../data/socials.json", "utf8");
                jsonData = JSON.parse(data);

                jsonData.push(socialsData);

                fs.writeFileSync("../data/socials.json", JSON.stringify(jsonData, null, 2), "utf8");
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received and saved successfully'
                }));
            }
            else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'User not found'
                }));
            }
        });
    })
}

function appendSocials(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/socials.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let githubLink = user.githubLink;
                let linkedinLink = user.linkedinLink;
                let twitterlink = user.twitterlink;
                let links = { githubLink, linkedinLink, twitterlink };

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

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                const editableData = { userId, position, aboutMe };
                let editable = fs.readFileSync("../data/editable.json", "utf8");
                let data = JSON.parse(editable);

                let findUserIndex = data.findIndex(user => user.userId === userId);
                // console.log(findUserIndex);
                if (findUserIndex !== -1) {
                    data[findUserIndex] = editableData;
                    fs.writeFileSync("../data/editable.json", JSON.stringify(data, null, 2), "utf8");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data received and saved successfully'
                    }));
                }
                else {
                    data.push(editableData);
                    fs.writeFileSync("../data/editable.json", JSON.stringify(data, null, 2), "utf8");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data received and saved successfully'
                    }));
                }

            }
            else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'User not found'
                }));
            }
        });
    })
}

function getEditableData(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/editable.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let position = user.position;
                let aboutMe = user.aboutMe;

                let editable = { position, aboutMe };
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

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let projectId = 0;
                let projectData = fs.readFileSync("../data/projects.json", "utf8");
                let data = JSON.parse(projectData);

                if (!data) {
                    data = [];
                }

                let findUserIndex = data.findIndex(user => user.userId === userId);

                if (findUserIndex !== -1) {
                    if (!data[findUserIndex].Projects) {
                        data[findUserIndex].Projects = [];
                        projectId = findUserIndex;
                        projectId++;
                        const projectInfo = { projectId, projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg };

                        data[findUserIndex].Projects.push(projectInfo);
                    }
                    else if (data[findUserIndex].Projects) {
                        projectId = data[findUserIndex].Projects.length;
                        const projectInfo = { projectId, projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg };
                        projectId++;
                        data[findUserIndex].Projects.push(projectInfo);
                    }
                } else {
                    projectId = 0;
                    const projectInfo = { projectId, projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg };

                    const newUser = {
                        userId: userId,
                        Projects: [projectInfo]
                    };
                    data.push(newUser);
                    projectId++;
                }

                fs.writeFileSync("../data/projects.json", JSON.stringify(data, null, 2), "utf8");

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
        });
    })
}

function getProjects(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/projects.json", "utf8");
            let data = JSON.parse(users);
            let projectArray = [];
            let user = data.find(user => user.userId === userId);

            if (user) {
                let projectsArray = user.Projects;
                projectsArray.forEach(project => {

                    if (user.userId === userId) {
                        let projectId = project.projectId;
                        let projectNameData = project.projectNameData;
                        let projectDescription = project.projectDescription;
                        let tags = project.tags;
                        let projectLiveLink = project.projectLiveLink;
                        let projectRepo = project.projectRepo;
                        let projectImg = project.projectImg;

                        let projects = { projectId, projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg };
                        projectArray.push(projects);
                    }
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: projectArray
                }));
            }

        }
        else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                statusCode: '400',
                message: 'User not found'
            }));
        }
    })
}

function saveEditedProject(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { indexValue, projectId, projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg } = JSON.parse(body);
        // console.log("Index Value: ", indexValue);

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/projects.json", "utf8");
                let data = JSON.parse(users);
                const projectInfo = { projectId, projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg };

                let user = data.find(user => user.userId === userId);
                if (user) {
                    let projectsArray = user.Projects;
                    projectsArray.forEach((project, index) => {

                        if (index === indexValue) {
                            // let aimedProject = project[index];

                            let projectNameData = projectInfo.projectNameData;
                            let projectDescription = projectInfo.projectDescription;
                            let tags = projectInfo.tags;
                            let projectLiveLink = projectInfo.projectLiveLink;
                            let projectRepo = projectInfo.projectRepo;
                            let projectImg = projectInfo.projectImg;

                            project.projectNameData = projectNameData;
                            project.projectDescription = projectDescription;
                            project.tags = tags;
                            project.projectLiveLink = projectLiveLink;
                            project.projectRepo = projectRepo;
                            project.projectImg = projectImg;

                            fs.writeFileSync("../data/projects.json", JSON.stringify(data, null, 2), "utf8");

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received and saved successfully'
                            }));
                        }
                    })
                }
                else {
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
    const id = parseInt(req.url.split('/').pop());
    console.log("---------", id);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/projects.json", "utf8");
            let data = JSON.parse(users);
            let user = data.find(user => user.userId === userId);

            if (user) {
                let projectsArray = user.Projects;
                let findProjectIndex = projectsArray.findIndex(project => project.projectId === id);
                // console.log(findProjectIndex);
                if (findProjectIndex !== -1) {
                    projectsArray.splice(findProjectIndex, 1);
                    fs.writeFile("../data/projects.json", JSON.stringify(data, null, 2), (err) => {
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

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let expId = 0;
                let expData = fs.readFileSync("../data/experience.json", "utf8");
                let data = JSON.parse(expData);

                if (!data) {
                    data = [];
                }

                let findUserIndex = data.findIndex(user => user.userId === userId);

                if (findUserIndex !== -1) {
                    if (!data[findUserIndex].Experiences) {
                        data[findUserIndex].Experiences = [];
                        expId = findUserIndex;
                        expId++;

                        const expInfo = { expId, position, company, duration, jobInfo };
                        data[findUserIndex].Experiences.push(expInfo);
                    }
                    else if (data[findUserIndex].Experiences) {
                        expId = data[findUserIndex].Experiences.length;
                        const expInfo = { expId, position, company, duration, jobInfo };
                        expId++;
                        data[findUserIndex].Experiences.push(expInfo);
                    }
                }
                else {
                    expId = 0;
                    const expInfo = { expId, position, company, duration, jobInfo };

                    const newUser = {
                        userId: userId,
                        Experiences: [expInfo]
                    };
                    data.push(newUser);
                    expId++;
                }


                fs.writeFileSync("../data/experience.json", JSON.stringify(data, null, 2), "utf8");

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received and saved successfully'
                }));
            }
            else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'User not found'
                }));
            }
        })
    })
}

function getExp(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let expData = fs.readFileSync("../data/experience.json", "utf8");
            let data = JSON.parse(expData);
            let expArray = [];
            let user = data.find(user => user.userId === userId);

            if (user) {
                let expsArray = user.Experiences;
                expsArray.forEach(exp => {
                    if (user.userId === userId) {
                        let expId = exp.expId;
                        let position = exp.position;
                        let company = exp.company;
                        let duration = exp.duration;
                        let jobInfo = exp.jobInfo;

                        let experiences = { expId, position, company, duration, jobInfo };
                        expArray.push(experiences);
                    }
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: expArray
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

        // console.log("Exp Info ----", projectInfo);
        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/experience.json", "utf8");
                let data = JSON.parse(users);
                const expInfo = { position, company, duration, jobInfo };

                let user = data.find(user => user.userId === userId);
                if (user) {
                    let expsArray = user.Experiences;
                    expsArray.forEach((exp, index) => {

                        if (index === indexValue) {

                            let position = expInfo.position;
                            let company = expInfo.company;
                            let duration = expInfo.duration;
                            let jobInfo = expInfo.jobInfo;

                            exp.position = position;
                            exp.company = company;
                            exp.duration = duration;
                            exp.jobInfo = jobInfo;

                            fs.writeFileSync("../data/experience.json", JSON.stringify(data, null, 2), "utf8");

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received and saved successfully'
                            }));
                        }
                    });
                }
                else {
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
    const id = parseInt(req.url.split('/').pop());
    console.log("---------", id);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let expData = fs.readFileSync("../data/experience.json", "utf8");
            let data = JSON.parse(expData);
            let user = data.find(user => user.userId === userId);

            if (user) {
                let expArray = user.Experiences;
                let findExpIndex = expArray.findIndex(exp => exp.expId === id);
                if (findExpIndex !== -1) {
                    expArray.splice(findExpIndex, 1);
                    fs.writeFile("../data/experience.json", JSON.stringify(data, null, 2), (err) => {
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

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let eduId = 0;
                let eduData = fs.readFileSync("../data/education.json", "utf8");
                let data = JSON.parse(eduData);

                if (!data) {
                    data = [];
                }

                let findUserIndex = data.findIndex(user => user.userId === userId);

                if (findUserIndex !== -1) {
                    if (!data[findUserIndex].Educations) {
                        data[findUserIndex].Educations = [];
                        eduId = findUserIndex;
                        eduId++;

                        const eduInfo = { eduId, degree, university, cgpa, duration };
                        data[findUserIndex].Educations.push(eduInfo);
                    }
                    else if (data[findUserIndex].Educations) {
                        eduId = data[findUserIndex].Educations.length;
                        const eduInfo = { eduId, degree, university, cgpa, duration };
                        eduId++;
                        data[findUserIndex].Educations.push(eduInfo);
                    }
                }
                else {
                    eduId = 0;
                    const eduInfo = { eduId, degree, university, cgpa, duration };
                    const newUser = {
                        userId: userId,
                        Educations: [eduInfo]
                    }
                    data.push(newUser);
                    eduId++;
                }

                fs.writeFileSync("../data/education.json", JSON.stringify(data, null, 2), "utf8");

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received and saved successfully'
                }));
            }
            else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'User not found'
                }));
            }
        })
    })
}

function getEdu(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let eduData = fs.readFileSync("../data/education.json", "utf8");
            let data = JSON.parse(eduData);
            let eduArray = [];
            let user = data.find(user => user.userId === userId);

            if (user) {
                let edusArray = user.Educations;
                edusArray.forEach(edu => {
                    if (user.userId === userId) {

                        let eduId = edu.eduId;
                        let degree = edu.degree;
                        let university = edu.university;
                        let cgpa = edu.cgpa;
                        let duration = edu.duration;

                        let educations = { eduId, degree, university, cgpa, duration };
                        eduArray.push(educations);
                    }
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: eduArray
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
        const { indexValue, degree, university, cgpa, duration } = JSON.parse(body);

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let eduData = fs.readFileSync("../data/education.json", "utf8");
                let data = JSON.parse(eduData);
                const eduInfo = { degree, university, cgpa, duration };

                let user = data.find(user => user.userId === userId);

                if (user) {
                    let edusArray = user.Educations;
                    edusArray.forEach((edu, index) => {
                        if (index === indexValue) {

                            let degree = eduInfo.degree;
                            let university = eduInfo.university;
                            let cgpa = eduInfo.cgpa;
                            let duration = eduInfo.duration;

                            edu.degree = degree;
                            edu.university = university;
                            edu.cgpa = cgpa;
                            edu.duration = duration;

                            fs.writeFileSync("../data/education.json", JSON.stringify(data, null, 2), "utf8");

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received and saved successfully'
                            }));
                        }
                    });

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
    const id = parseInt(req.url.split('/').pop());
    console.log("---------", id);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let eduData = fs.readFileSync("../data/education.json", "utf8");
            let data = JSON.parse(eduData);
            let user = data.find(user => user.userId === userId);

            if (user) {
                let eduArray = user.Educations;
                let findEduIndex = eduArray.findIndex(edu => edu.eduId === id);
                if (findEduIndex !== -1) {
                    eduArray.splice(findEduIndex, 1);

                    fs.writeFile("../data/education.json", JSON.stringify(data, null, 2), (err) => {
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
        }
    });
}

/*--------------------------ADMIN --------------------------*/
function getDataForAdmin(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            try {
                const usersData = JSON.parse(fs.readFileSync("../data/users.json", "utf8"));
                const projectsData = JSON.parse(fs.readFileSync("../data/projects.json", "utf8"));

                const userDataArray = [];

                for (let eachUserData of usersData) {
                    let userCredentials = {
                        userId: eachUserData.userId,
                        firstName: eachUserData.firstName,
                        lastName: eachUserData.lastName,
                        userPhone: eachUserData.userPhone,
                        userEmail: eachUserData.userEmail
                    };

                    userDataArray.push(userCredentials);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    userData: userDataArray,
                    projects: projectsData
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
    const id = req.url.split('/').pop();
    console.log("1013---------", id);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {

            console.log(id);
            let users = fs.readFileSync("../data/users.json", "utf8");
            let projects = fs.readFileSync("../data/projects.json", "utf8");
            let experiences = fs.readFileSync("../data/experience.json", "utf8");
            let educations = fs.readFileSync("../data/education.json", "utf8");
            let editables = fs.readFileSync("../data/editable.json", "utf8");
            let socials = fs.readFileSync("../data/socials.json", "utf8");
            let tokens = fs.readFileSync("../data/tokens.json", "utf8");

            let allUsers = JSON.parse(users);
            let allProjects = JSON.parse(projects);
            let allExperience = JSON.parse(experiences);
            let allEducations = JSON.parse(educations);
            let allEditables = JSON.parse(editables);
            let allSocials = JSON.parse(socials);
            let allTokens = JSON.parse(tokens);

            let findUserIndex = allUsers.findIndex(user => user.userId === id);
            let findProjectIndex = allProjects.findIndex(user => user.userId === id);
            let findExpIndex = allExperience.findIndex(user => user.userId === id);
            let findEduIndex = allEducations.findIndex(user => user.userId === id);
            let findEditableIndex = allEditables.findIndex(user => user.userId === id);
            let findSocialsIndex = allSocials.findIndex(user => user.userId === id);

            allTokens.forEach((token, index) => {
                if (token.userId === id) {
                    allTokens.splice(index, 1);
                    fs.writeFile("../data/tokens.json", JSON.stringify(allTokens, null, 2), (err) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log("Tokens removed successfully.");
                        }
                    });
                }
            });


            if (findUserIndex !== -1 || findProjectIndex !== -1 || findExpIndex !== -1 ||
                findEduIndex !== -1 || findEditableIndex !== -1 || findSocialsIndex !== -1) {

                allUsers.splice(findUserIndex, 1);
                allProjects.splice(findProjectIndex, 1);
                allExperience.splice(findExpIndex, 1);
                allEducations.splice(findEduIndex, 1);
                allEditables.splice(findEditableIndex, 1);
                allSocials.splice(findSocialsIndex, 1);

                fs.writeFile("../data/users.json", JSON.stringify(allUsers, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("File written successfully.");
                    }
                });

                fs.writeFile("../data/projects.json", JSON.stringify(allProjects, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("File written successfully.");
                    }
                });
                fs.writeFile("../data/experience.json", JSON.stringify(allExperience, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("File written successfully.");
                    }
                });
                fs.writeFile("../data/education.json", JSON.stringify(allEducations, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("File written successfully.");
                    }
                });
                fs.writeFile("../data/editable.json", JSON.stringify(allEditables, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("File written successfully.");
                    }
                });
                fs.writeFile("../data/socials.json", JSON.stringify(allSocials, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("File written successfully.");
                    }
                });
            }
        }
    });
}

function updateUser(req, res) {
    let body = "";
    const id = req.url.split('/').pop();
    console.log("Update User Id ---------", id);

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

                let findUser = allUsers.find(user => user.userId === id);
                if (findUser) {

                    // const user = allUsers[index]
                    // console.log("Found the user: ", user);
                    findUser.firstName = userInfo.firstName;
                    findUser.lastName = userInfo.lastName;
                    findUser.userEmail = userInfo.userEmail;
                    findUser.userPhone = userInfo.userPhone;

                    fs.writeFileSync("../data/users.json", JSON.stringify(allUsers, null, 2), "utf8");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data received and saved successfully'
                    }));
                }

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

/*------------------------------------ TOKEN Generation ------------------------------------*/

function createJWTtoken(user) {
    let payload = {
        userEmail: user.userEmail,
        userId: user.userId
    }
    let token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
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