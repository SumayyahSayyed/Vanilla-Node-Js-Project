const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function getDataForAdmin(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            try {
                const usersQuery = `
                    SELECT user_ID, Name, Phone, Email, userType FROM users`;

                const projectsQuery = `
                    SELECT * FROM projects`;

                db.query(usersQuery, [], (err1, userResults) => {
                    if (err1) {
                        console.error('Error retrieving user data:', err1);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            statusCode: '500',
                            message: 'Internal Server Error'
                        }));
                        return;
                    }

                    const userDataArray = userResults.map((userData) => {
                        return {
                            userId: userData.user_ID,
                            userName: userData.Name,
                            userPhone: userData.Phone,
                            userEmail: userData.Email,
                            userType: userData.userType
                        };
                    });

                    db.query(projectsQuery, [], (err2, projectResults) => {
                        if (err2) {
                            console.error('Error retrieving project data:', err2);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '500',
                                message: 'Internal Server Error'
                            }));
                            return;
                        }

                        const projectDataArray = projectResults.map((projectData) => {
                            return {
                                userId: projectData.user_ID,
                                projectNameData: projectData.Name,
                                projectDescription: projectData.Description,
                                tags: projectData.Tags,
                                projectLiveLink: projectData.LiveLink,
                                projectRepo: projectData.SourceCode,
                                projectImg: projectData.ProjectImg
                            };
                        });

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            statusCode: '200',
                            message: 'Data retrieved successfully',
                            userData: userDataArray,
                            projects: projectDataArray
                        }));
                    });
                });
            } catch (error) {
                console.error('Error in getDataForAdmin:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '500',
                    message: 'Internal Server Error'
                }));
            }
        }
    });
}

function deleteUser(req, res) {
    const ID = req.url.split('/').pop();
    console.log("1013---------", ID);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            // Delete the user record
            const deleteUserQuery = `
                DELETE FROM users
                WHERE user_ID = ?
            `;

            db.query(deleteUserQuery, [ID], (err, result) => {
                if (err) {
                    console.error('Error deleting user:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '500',
                        message: 'Internal Server Error'
                    }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'User and associated data deleted successfully'
                    }));
                }
            });
        }
    });
}

function getUserIdFromDB(userIdData) {

    const findID = `
        SELECT user_ID FROM users    
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
                expID: eachId.exp_ID
            };
            userIDs.push(ids)
        }
        userIdData(null, userIDs);
    });
}

function updateUser(req, res) {
    let body = "";
    const ID = req.url.split('/').pop();
    console.log("Update User Id ---------", ID);

    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { firstName, lastName, userPhone, userEmail } = JSON.parse(body);
        const userInfo = { firstName, lastName, userPhone, userEmail };

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

                    for (let i = 0; i < userIDs.length; i++) {
                        const id = userIDs[i];

                        if (id.userID === ID) {
                            let updateUserData = `
                                UPDATE users
                                SET Name = ?, Phone = ?, Email = ?
                                WHERE user_ID = ?
                            `;
                            db.query(updateUserData, [`${firstName} ${lastName}`, userPhone, userEmail, ID], (err, results) => {
                                if (err) {
                                    console.error('Error updating user data:', err);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '500',
                                        message: 'Internal Server Error'
                                    }));
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '200',
                                        message: 'User Data updated successfully',
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

module.exports = {
    getDataForAdmin,
    deleteUser,
    updateUser
};