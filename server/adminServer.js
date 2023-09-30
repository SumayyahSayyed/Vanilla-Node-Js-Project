const fs = require('fs');

const { getAndVerifyToken } = require('./authentication');

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

module.exports = {
    getDataForAdmin,
    deleteUser,
    updateUser
};