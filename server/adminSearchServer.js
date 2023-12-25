const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function getUsersFromDB(userIdData) {
    const findID = `
        SELECT user_ID, Name, Phone, Email FROM users    
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
                userEmail: eachId.Email
            };
            userData.push(user);
        }
        userIdData(null, userData);
    });
}

function getUserSearchData(req, res, query) {
    getAndVerifyToken(req, res, (userId) => {
        query = query.toLowerCase();
        console.log("NEW: ", query);
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
                    if (
                        user.userName.toLowerCase().includes(query) ||
                        user.userPhone.toLowerCase().includes(query) ||
                        user.userEmail.toLowerCase().includes(query)
                    ) {
                        foundMatch = true;
                        matchingUsers.push(user);
                    }

                });

                if (foundMatch) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data Received',
                        user: matchingUsers
                    }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('No matching projects found.');
                }
            });

        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });
}

module.exports = {
    getUserSearchData
};