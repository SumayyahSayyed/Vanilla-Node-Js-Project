const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function getUsersFromDB(userIdData) {
    const findID = `
        SELECT user_ID, Name, Phone, Email, userType FROM users    
    `;
    const userData = [];
    db.query(findID, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }

        for (let eachId of results) {
            let user = {
                userId: eachId.user_ID,
                userName: eachId.Name,
                userPhone: eachId.Phone,
                userEmail: eachId.Email,
                userType: eachId.userType
            };
            userData.push(user);
        }
        userIdData(null, userData);
    });
}

function makeAdmin(req, res, query) {
    const ID = req.url.split('/').pop();
    console.log("---------", ID);
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            getUsersFromDB((err, userData) => {
                if (err) {
                    console.error('Error getting user IDs:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '500',
                        message: 'Internal Server Error'
                    }));
                    return;
                }

                let foundMatch = false;
                const matchingUsers = [];

                userData.forEach(user => {
                    if (user.userId === ID) {
                        console.log("hello");
                        user.userType = 'admin';
                        foundMatch = true;
                        matchingUsers.push(user);

                        const updateUserTypeSQL = `
                            UPDATE users
                            SET userType = ?
                            WHERE user_ID = ?
                        `;
                        db.query(updateUserTypeSQL, ['admin', ID], (updateErr, updateResults) => {
                            if (updateErr) {
                                console.error('Error updating user userType:', updateErr);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    statusCode: '500',
                                    message: 'Internal Server Error'
                                }));
                                return;
                            }
                            console.log('User userType updated successfully.');
                        });
                    }
                });

                if (foundMatch) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'User userType updated successfully.',
                        users: matchingUsers
                    }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('User not found.');
                }
            });
        }
    });
}


module.exports = {
    makeAdmin
};