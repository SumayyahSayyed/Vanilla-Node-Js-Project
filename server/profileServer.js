const { getAndVerifyToken } = require('./authentication');
const db = require("./dbServer");

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

function getProfileData(req, res) {
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
                    let getProfile = `
                        SELECT Name, Email, Phone, userType FROM users 
                        WHERE user_ID = '${userId}'    
                    `;
                    db.query(getProfile, (err, results) => {
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
                            const userName = results[0].Name;
                            const userPhone = results[0].Phone;
                            const userEmail = results[0].Email;
                            const userType = results[0].userType;

                            const profileData = { userName, userPhone, userEmail, userType };

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received successfully',
                                userInfo: profileData
                            }));
                        }
                        else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '404',
                                message: 'Social links not found for the user'
                            }));
                        }
                    });
                }
            });
        }
        else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                statusCode: '400',
                message: 'User not found'
            }));
        }
    });
}

module.exports = {
    getProfileData
};