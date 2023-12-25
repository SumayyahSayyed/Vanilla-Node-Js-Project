const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function createEducationTable(onTableCreated) {
    const createEduTable = `
        CREATE TABLE IF NOT EXISTS education (
            edu_ID INT,
            user_ID VARCHAR(36),
            FOREIGN KEY (user_ID) REFERENCES users(user_ID) ON DELETE CASCADE,
            Degree VARCHAR(255) NOT NULL,
            University VARCHAR(255) NOT NULL,
            CGPA VARCHAR(255) NOT NULL,
            Duration VARCHAR(255) NOT NULL
        )
    `;
    db.query(createEduTable, (err) => {
        if (err) {
            console.error('Error creating Education table:', err);
            return;
        }
        onTableCreated();
    });
}

function insertEduData(eduId, userId, degree, university, cgpa, duration, insertion) {
    const insertEduQuery = `
        INSERT INTO education (edu_ID, user_ID, Degree, University, CGPA, Duration)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(insertEduQuery, [eduId, userId, degree, university, cgpa, duration], (err, results) => {
        if (err) {
            console.error('Error inserting education data:', err);
            insertion(err);
        } else {
            console.log('education data inserted successfully');
            insertion(null);
        }
    });
}

function getUserIdFromDB(userIdData) {

    const findID = `
        SELECT user_ID, edu_ID FROM education    
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
                eduID: eachId.edu_ID
            };
            userIDs.push(ids)
        }
        userIdData(null, userIDs);
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
                createEducationTable(() => {
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

                        let highestEduID = -1;
                        for (const userEdu of userIDs) {
                            if (userEdu.userID === userId && userEdu.eduID > highestEduID) {
                                highestEduID = userEdu.eduID;
                            }
                        }
                        eduId = highestEduID + 1;

                        insertEduData(eduId, userId, degree, university, cgpa, duration, (err) => {
                            if (err) {
                                console.error('Error inserting Education data:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '500',
                                    message: 'Internal Server Error'
                                }));
                                return;
                            }

                            console.log('Education data inserted successfully');
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Education data inserted successfully'
                            }));

                        })
                    })
                })
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
                        SELECT * FROM education
                        WHERE user_ID = ?
                    `;

                    db.query(getData, [userId], (err, results) => {
                        if (err) {
                            console.error('Error fetching education data:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '500',
                                message: 'Internal Server Error'
                            }));
                            return;
                        }

                        if (results.length > 0) {
                            const educations = results.map((row) => ({
                                eduId: row.edu_ID,
                                degree: row.Degree,
                                university: row.University,
                                cgpa: row.CGPA,
                                duration: row.Duration
                            }));

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received successfully',
                                data: educations
                            }));
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '404',
                                message: 'No education data found for the user'
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

function saveEditedEdu(req, res) {
    const ID = parseInt(req.url.split('/').pop());
    console.log("---------", ID);
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { degree, university, cgpa, duration } = JSON.parse(body);
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
                    let findEduID;
                    for (let i = 0; i < userIDs.length; i++) {
                        const id = userIDs[i];

                        if (id.eduID === ID && id.userID === userId) {
                            findEduID = id.eduID;

                            console.log("LINE 219: ", findEduID);
                            console.log("LINE 220: ", ID);
                            console.log("LINE 221: ", degree);
                            let getSelectedEdu = `
                            UPDATE education
                            SET Degree = ?, University = ?, CGPA = ?, Duration = ?
                            WHERE edu_ID = ?
                        `;
                            db.query(getSelectedEdu, [degree, university, cgpa, duration, findEduID], (err, results) => {
                                if (err) {
                                    console.error('Error updating education data:', err);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '500',
                                        message: 'Internal Server Error'
                                    }));
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '200',
                                        message: 'education Data updated successfully',
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

function deleteEdu(req, res) {
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
                let findEduID;
                for (let i = 0; i < userIDs.length; i++) {
                    const id = userIDs[i];

                    if (id.eduID === ID && id.userID === userId) {
                        findEduID = id.eduID;
                        let deleteQuery = `
                            DELETE FROM education 
                            WHERE edu_ID = ? AND user_ID = ?;
                        `;
                        db.query(deleteQuery, [findEduID, userId], (err, results) => {
                            if (err) {
                                console.error('Error updating education data:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '500',
                                    message: 'Internal Server Error'
                                }));
                            } else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '200',
                                    message: 'education Data deleted successfully',
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
    saveEdu,
    getEdu,
    saveEditedEdu,
    deleteEdu
};