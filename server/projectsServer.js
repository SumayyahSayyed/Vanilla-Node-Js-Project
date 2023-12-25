const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function createProjectsTable(onTableCreated) {
    const createProjectTable = `
        CREATE TABLE IF NOT EXISTS projects (
            project_ID INT,
            user_ID VARCHAR(36),
            FOREIGN KEY (user_ID) REFERENCES users(user_ID) ON DELETE CASCADE,
            Name VARCHAR(255) NOT NULL,
            Description VARCHAR(500) NOT NULL,
            Tags VARCHAR(100) NOT NULL,
            SourceCode VARCHAR(60) NOT NULL,
            LiveLink VARCHAR(60) NOT NULL,
            ProjectImg LONGTEXT NULL
        )
    `;
    db.query(createProjectTable, (err) => {
        if (err) {
            console.error('Error creating Projects table:', err);
            return;
        }
        onTableCreated();
    });
}

function getUserIdFromDB(userIdData) {

    const findID = `
        SELECT user_ID, project_ID FROM projects    
    `;
    const userIDs = [];
    db.query(findID, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }

        for (let eachId of results) {
            let ids = {
                userID: eachId.user_ID,
                projectID: eachId.project_ID
            };
            userIDs.push(ids)
        }
        userIdData(null, userIDs);
    });
}

function insertProjectData(projectId, userId, projectNameData, projectDescription, tagsString, projectRepo, projectLiveLink, projectImg, insertion) {
    const insertProjectQuery = `
        INSERT INTO projects (project_ID, user_ID, Name, Description, Tags, SourceCode, LiveLink, ProjectImg)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertProjectQuery, [projectId, userId, projectNameData, projectDescription, tagsString, projectRepo, projectLiveLink, projectImg], (err, results) => {
        if (err) {
            console.error('Error inserting Project data:', err);
            insertion(err);
        } else {
            console.log('Project data inserted successfully');
            insertion(null);
        }
    });
}


function saveProjects(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg } = JSON.parse(body);
        let projectId;
        const tagsString = tags.join(', ');
        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                createProjectsTable(() => {
                    getUserIdFromDB((err, userIDs) => {
                        if (err) {
                            console.error('Error getting user IDs:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '500',
                                message: 'Internal Server Error'
                            }));
                            return;
                        }
                        let highestProjectID = -1;

                        for (const userProject of userIDs) {
                            if (userProject.userID === userId && userProject.projectID > highestProjectID) {
                                highestProjectID = userProject.projectID;
                            }
                        }

                        projectId = highestProjectID + 1;

                        insertProjectData(projectId, userId, projectNameData, projectDescription, tagsString, projectRepo, projectLiveLink, projectImg, (err) => {
                            if (err) {
                                console.error('Error inserting Project data:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '500',
                                    message: 'Internal Server Error'
                                }));
                                return;
                            }

                            console.log('Project data inserted successfully');
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Project data inserted successfully'
                            }));
                        });
                    });
                });
            }
        });
    });
}

function getProjects(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            getUserIdFromDB((err, userIDs) => {
                if (err) {
                    console.error('Error getting user IDs:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '500',
                        message: 'Internal Server Error'
                    }));
                    return;
                }
                const userExists = userIDs.some((user) => user.userID === userId);
                if (userExists) {
                    const getData = `
                        SELECT * FROM projects
                        WHERE user_ID = ?
                    `;

                    db.query(getData, [userId], (err, results) => {
                        if (err) {
                            console.error('Error fetching project data:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '500',
                                message: 'Internal Server Error'
                            }));
                            return;
                        }

                        if (results.length > 0) {
                            const projects = results.map((row) => ({
                                projectId: row.project_ID,
                                projectNameData: row.Name,
                                projectDescription: row.Description,
                                tags: row.Tags.split(', ').filter(tag => tag.trim() !== ''),
                                projectRepo: row.SourceCode,
                                projectLiveLink: row.LiveLink,
                                projectImg: row.ProjectImg
                            }));

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received successfully',
                                data: projects
                            }));
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '404',
                                message: 'No project data found for the user'
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
            });
        }
    });
}

function saveEditedProject(req, res) {
    const ID = parseInt(req.url.split('/').pop());
    console.log("---------", ID);
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { projectId, projectNameData, projectDescription, tags, projectLiveLink, projectRepo, projectImg } = JSON.parse(body);
        const tagsString = tags.join(', ');

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                getUserIdFromDB((err, userIDs) => {
                    if (err) {
                        console.error('Error getting user IDs:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            statusCode: '500',
                            message: 'Internal Server Error'
                        }));
                        return;
                    }
                    let findProjectID;
                    for (let i = 0; i < userIDs.length; i++) {
                        const id = userIDs[i];

                        if (id.projectID === ID && id.userID === userId) {
                            findProjectID = id.projectID;
                            console.log("LINE 219: ", findProjectID);
                            console.log("LINE 220: ", ID);
                            let getSelectedProject = `
                            UPDATE projects
                            SET Name = ?, Description = ?, Tags = ?, SourceCode = ?, LiveLink = ?, ProjectImg = ?
                            WHERE project_ID = ?
                        `;
                            db.query(getSelectedProject, [projectNameData, projectDescription, tagsString, projectRepo, projectLiveLink, projectImg, findProjectID], (err, results) => {
                                if (err) {
                                    console.error('Error updating project data:', err);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '500',
                                        message: 'Internal Server Error'
                                    }));
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '200',
                                        message: 'Project Data updated successfully',
                                    }));
                                }
                            });
                            break;
                        }
                    }
                });
            }
        });
    });
}

function deleteProject(req, res) {
    const ID = parseInt(req.url.split('/').pop());
    console.log("---------", ID);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            getUserIdFromDB((err, userIDs) => {
                if (err) {
                    console.error('Error getting user IDs:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '500',
                        message: 'Internal Server Error'
                    }));
                    return;
                }
                let findProjectID;
                for (let i = 0; i < userIDs.length; i++) {
                    const id = userIDs[i];

                    if (id.projectID === ID && id.userID === userId) {
                        findProjectID = id.projectID;
                        let deleteQuery = `
                            DELETE FROM projects 
                            WHERE project_ID = ? AND user_ID = ?;
                        `;
                        db.query(deleteQuery, [findProjectID, userId], (err, results) => {
                            if (err) {
                                console.error('Error updating project data:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '500',
                                    message: 'Internal Server Error'
                                }));
                            } else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '200',
                                    message: 'Project Data deleted successfully',
                                }));
                            }
                        });
                        break;
                    }
                }
            });
        }
    });
};

module.exports = {
    saveProjects,
    getProjects,
    saveEditedProject,
    deleteProject
};
