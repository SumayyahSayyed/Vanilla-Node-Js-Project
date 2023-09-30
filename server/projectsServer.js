const fs = require('fs');

const { getAndVerifyToken } = require('./authentication');

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

module.exports = {
    saveProjects,
    getProjects,
    saveEditedProject,
    deleteProject
};
