const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');


function createExperienceTable(onTableCreated) {
    const createExpTable = `
        CREATE TABLE IF NOT EXISTS experience (
            exp_ID INT,
            user_ID VARCHAR(36),
            FOREIGN KEY (user_ID) REFERENCES users(user_ID) ON DELETE CASCADE,
            Position VARCHAR(255) NOT NULL,
            Company VARCHAR(255) NOT NULL,
            Duration VARCHAR(255) NOT NULL,
            JobInfo VARCHAR(255) NOT NULL
        )
    `;
    db.query(createExpTable, (err) => {
        if (err) {
            console.error('Error creating Experience table:', err);
            return;
        }
        onTableCreated();
    });
}

function insertExpData(expId, userId, position, company, duration, jobInfo, insertion) {
    const insertExpQuery = `
        INSERT INTO experience (exp_ID, user_ID, Position, Company, Duration, JobInfo)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(insertExpQuery, [expId, userId, position, company, duration, jobInfo], (err, results) => {
        if (err) {
            console.error('Error inserting experience data:', err);
            insertion(err);
        } else {
            console.log('experience data inserted successfully');
            insertion(null);
        }
    });
}

function getUserIdFromDB(userIdData) {

    const findID = `
        SELECT user_ID, exp_ID FROM experience    
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

function saveExp(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { position, company, duration, jobInfo } = JSON.parse(body);
        let expId;
        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                createExperienceTable(() => {
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

                        let highestExpID = -1;
                        for (const userExp of userIDs) {
                            if (userExp.userID === userId && userExp.expID > highestExpID) {
                                highestExpID = userExp.expID;
                            }
                        }
                        expId = highestExpID + 1;

                        insertExpData(expId, userId, position, company, duration, jobInfo, (err) => {
                            if (err) {
                                console.error('Error inserting Experience data:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '500',
                                    message: 'Internal Server Error'
                                }));
                                return;
                            }

                            console.log('experience data inserted successfully');
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Experience data inserted successfully'
                            }));

                        })
                    })
                })
            }
        })
    })
}

function getExp(req, res) {
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
                        SELECT * FROM experience
                        WHERE user_ID = ?
                    `;

                    db.query(getData, [userId], (err, results) => {
                        if (err) {
                            console.error('Error fetching experience data:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '500',
                                message: 'Internal Server Error'
                            }));
                            return;
                        }

                        if (results.length > 0) {
                            const experiences = results.map((row) => ({
                                expId: row.exp_ID,
                                position: row.Position,
                                company: row.Company,
                                duration: row.Duation,
                                jobInfo: row.JobInfo
                            }));

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received successfully',
                                data: experiences
                            }));
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '404',
                                message: 'No experience data found for the user'
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
    })
}

function saveEditedExp(req, res) {
    const ID = parseInt(req.url.split('/').pop());
    console.log("---------", ID);
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { position, company, duration, jobInfo } = JSON.parse(body);

        // console.log("Exp Info ----", experienceInfo);
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
                    let findExpID;
                    for (let i = 0; i < userIDs.length; i++) {
                        const id = userIDs[i];

                        if (id.expID === ID && id.userID === userId) {
                            findExpID = id.expID;
                            console.log("LINE 219: ", findExpID);
                            console.log("LINE 220: ", ID);
                            let getSelectedExp = `
                            UPDATE experience
                            SET Position = ?, Company = ?, Duration = ?, JobInfo = ?
                            WHERE exp_ID = ?
                        `;
                            db.query(getSelectedExp, [position, company, duration, jobInfo, findExpID], (err, results) => {
                                if (err) {
                                    console.error('Error updating experience data:', err);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '500',
                                        message: 'Internal Server Error'
                                    }));
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '200',
                                        message: 'experience Data updated successfully',
                                    }));
                                }
                            });
                            break;
                        }
                    }
                });
            }
        });
    })
}

function deleteExp(req, res) {
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
                let findExpID;
                for (let i = 0; i < userIDs.length; i++) {
                    const id = userIDs[i];

                    if (id.expID === ID && id.userID === userId) {
                        findExpID = id.expID;
                        let deleteQuery = `
                            DELETE FROM experience 
                            WHERE exp_ID = ? AND user_ID = ?;
                        `;
                        db.query(deleteQuery, [findExpID, userId], (err, results) => {
                            if (err) {
                                console.error('Error updating experience data:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '500',
                                    message: 'Internal Server Error'
                                }));
                            } else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '200',
                                    message: 'experience Data deleted successfully',
                                }));
                            }
                        });
                        break;
                    }
                }
            });
        }
    });
}

module.exports = {
    saveExp,
    getExp,
    saveEditedExp,
    deleteExp
};