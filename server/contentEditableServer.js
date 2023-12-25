const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function createEditabelTable(onTableCreated) {

    const createAboutTable = `
        CREATE TABLE IF NOT EXISTS about (
            user_ID VARCHAR(36),
            FOREIGN KEY (user_ID) REFERENCES users(user_ID) ON DELETE CASCADE,
            Position VARCHAR(255) NOT NULL,
            AboutMe VARCHAR(500) NOT NULL
        )
    `;
    db.query(createAboutTable, (err) => {
        if (err) {
            console.error('Error creating socials table:', err);
            return;
        }
        onTableCreated();
    });
}

function getUserIdFromDB(userIdData) {

    const findID = `
        SELECT user_ID FROM about    
    `;
    const userIDs = [];
    db.query(findID, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }

        for (let eachId of results) {
            userIDs.push(eachId.user_ID);
        }
        userIdData(null, userIDs);
    });
}

function insertEditableData(userId, position, aboutMe, onInsertion) {
    const insertEditable = `
        INSERT INTO about (user_ID, Position, AboutMe)
        VALUES (?, ?, ?)
    `;
    db.query(insertEditable, [userId, position, aboutMe], (err, results) => {
        if (err) {
            console.error('Error inserting contentEditable data:', err);
            onInsertion(err);
        } else {
            console.log('contentEditable data inserted successfully');
            onInsertion(null);
        }
    });
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
                createEditabelTable(() => {
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

                        if (userIDs.includes(userId)) {
                            let updateAbout = `
                                UPDATE about
                                SET Position = ?, AboutMe = ?
                                WHERE user_ID = ?
                            `;

                            db.query(updateAbout, [position, aboutMe, userId], (err, results) => {
                                if (err) {
                                    console.error('Error updating about data:', err);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '500',
                                        message: 'Internal Server Error'
                                    }));
                                    return;
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '200',
                                        message: 'Data updated successfully',
                                    }));
                                }
                            });
                        } else {
                            insertEditableData(userId, position, aboutMe, (err) => {
                                if (err) {
                                    console.error('Error inserting about data:', err);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({
                                        statusCode: '500',
                                        message: 'Internal Server Error'
                                    }));
                                    return;
                                }
                                console.log('About data inserted successfully');
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '200',
                                    message: 'About data inserted successfully'
                                }));
                            });
                        }
                    });
                });
            }
        });
    });
}


function getEditableData(req, res) {
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

                const userExists = userIDs.includes(userId);
                if (userExists) {
                    const getData = `
                        SELECT * FROM about
                        WHERE user_ID = ?
                    `;

                    db.query(getData, [userId], (err, results) => {
                        if (err) {
                            console.error('Error fetching about data:', err);
                        }

                        if (results.length > 0) {
                            const position = results[0].Position;
                            const aboutMe = results[0].AboutMe;

                            const editable = { position, aboutMe };

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received successfully',
                                data: editable
                            }));
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '404',
                                message: 'Content Editable Data not found for the user'
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

module.exports = {
    editableData,
    getEditableData
};