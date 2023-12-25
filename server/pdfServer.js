const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function createPDFTable(onTableCreated) {

    const createPDFTable = `
        CREATE TABLE IF NOT EXISTS pdf (
            user_ID VARCHAR(36),
            FOREIGN KEY (user_ID) REFERENCES users(user_ID) ON DELETE CASCADE,
            PDF_url LONGTEXT
        )
    `;
    db.query(createPDFTable, (err) => {
        if (err) {
            console.error('Error creating socials table:', err);
            return;
        }
        onTableCreated();
    });
}

function getUserIdFromDB(userIdData) {

    const findID = `
        SELECT user_ID FROM pdf    
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

function insertPDFData(userId, pdfURL, onInsertion) {
    const insertPDF = `
        INSERT INTO pdf (user_ID, PDF_url)
        VALUES (?, ?)
    `;
    db.query(insertPDF, [userId, pdfURL], (err, results) => {
        if (err) {
            console.error('Error inserting pdf data:', err);
            onInsertion(err);
        } else {
            console.log('pdf data inserted successfully');
            onInsertion(null);
        }
    });
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
                createPDFTable(() => {
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
                            let updatePDF = `
                                    UPDATE pdf
                                    SET PDF_url = ?
                                    WHERE user_ID = ?
                                `;

                            db.query(updatePDF, [pdfURL], (err, results) => {
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
                                        message: 'PDF Data updated successfully',
                                    }));
                                }
                            });
                        } else {
                            insertPDFData(userId, pdfURL, (err) => {
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
                                    message: 'PDF data inserted successfully'
                                }));
                            });
                        }
                    });
                });
            }
        });
    })
}

function getPdf(req, res) {
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
                        SELECT * FROM pdf
                        WHERE user_ID = ?
                    `;

                    db.query(getData, [userId], (err, results) => {
                        if (err) {
                            console.error('Error fetching about data:', err);
                        }

                        if (results.length > 0) {
                            const pdf = results[0].PDF_url;

                            const pdfData = { pdf };

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received successfully',
                                data: pdfData
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
    })
}

module.exports = {
    savePdf,
    getPdf
};