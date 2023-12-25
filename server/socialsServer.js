const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function createSocialsTable(onTableCreated) {
    let user_ID = `SELECT user_ID FROM users ORDER BY user_ID DESC LIMIT 1`;

    db.query(user_ID, (err, results) => {
        if (err) {
            console.error('Error getting the latest user ID:', err);
            // Handle the error
            return;
        }

        const createSocialsTableSQL = `
        CREATE TABLE IF NOT EXISTS socials (
            user_ID VARCHAR(36),
            FOREIGN KEY (user_ID) REFERENCES users(user_ID) ON DELETE CASCADE,
            Github VARCHAR(255) NOT NULL,
            LinkedIn VARCHAR(255) NOT NULL,
            Twitter VARCHAR(255) NOT NULL
        )
    `;
        db.query(createSocialsTableSQL, (err) => {
            if (err) {
                console.error('Error creating socials table:', err);

                return;
            }
            onTableCreated();
        });
    })

}

function socials(req, res) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { githubLink, linkedinLink, twitterlink } = JSON.parse(body);

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                createSocialsTable(() => {
                    insertSocialsData(userId, githubLink, linkedinLink, twitterlink, (err) => {
                        if (err) {
                            console.error('Error inserting socials data:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '500',
                                message: 'Internal Server Error'
                            }));
                            return;
                        }
                        console.log('Socials data inserted successfully');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            statusCode: '200',
                            message: 'Socials data inserted successfully'
                        }));
                    });
                });
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'User not found'
                }));
            }
        });
    });
}

function insertSocialsData(userId, githubLink, linkedinLink, twitterlink, onSocialsDataInserted) {
    const insertSocials = `
        INSERT INTO socials (user_ID, Github, LinkedIn, Twitter)
        VALUES (?, ?, ?, ?)
    `;
    db.query(insertSocials, [userId, githubLink, linkedinLink, twitterlink], onSocialsDataInserted);
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
            userIDs.push(eachId.user_ID);
        }
        userIdData(null, userIDs);
    });
}

function appendSocials(req, res) {
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
                        SELECT * FROM socials
                        WHERE user_ID = '${userId}'
                    `;

                    db.query(getData, (err, results) => {
                        if (err) {
                            console.error('Error fetching social links:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '500',
                                message: 'Internal Server Error'
                            }));
                            return;
                        }

                        if (results.length > 0) {
                            const githubLink = results[0].Github;
                            const linkedinLink = results[0].LinkedIn;
                            const twitterlink = results[0].Twitter;

                            const links = { githubLink, linkedinLink, twitterlink };

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received successfully',
                                data: links
                            }));
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '404',
                                message: 'Social links not found for the user'
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
    socials,
    appendSocials
};
