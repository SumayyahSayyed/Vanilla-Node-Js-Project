const fs = require('fs');
const bcrypt = require('bcrypt');
const { v4: uuid } = require("uuid");
const jwt = require("jsonwebtoken")
const dotenv = require('dotenv');
const db = require("./dbServer");
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        user_ID VARCHAR(36) PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Phone VARCHAR(20) NOT NULL,
        Email VARCHAR(255) NOT NULL,
        Password VARCHAR(255) NOT NULL,
        userType VARCHAR(255) DEFAULT "user"
    )
`;

const createTokenTable = `
    CREATE TABLE IF NOT EXISTS tokens (
        user_ID VARCHAR(36),
        FOREIGN KEY (user_ID) REFERENCES users(user_ID) ON DELETE CASCADE,
        JWT_Token VARCHAR(255) NOT NULL
    )
`;

function SignUp(req, res) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const userId = uuid();
        const { firstName, lastName, userPhone, userEmail, userPassword } = JSON.parse(body);
        console.log("new data: ", userEmail)

        const hashedPassword = await bcrypt.hash(userPassword, 10);

        const userAlreadyPresentSQL = `SELECT Email FROM users WHERE Email = ?`;
        createTables(() => {
            db.query(userAlreadyPresentSQL, [userEmail], (err, results) => {
                if (err) {
                    console.error('Error checking for an existing user:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(
                        {
                            statusCode: "500",
                            message: 'Internal Server Error'
                        }
                    ));
                    return;
                }

                if (results.length > 0) {
                    console.log('User already present');
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(
                        {
                            statusCode: "400",
                            message: 'User already exists'
                        }
                    ));
                } else {
                    const newData = { userId, firstName, lastName, userPhone, userEmail, hashedPassword };
                    let jwtToken = createJWTtoken(newData);
                    insertUserData(userId, `${firstName} ${lastName}`, userPhone, userEmail, hashedPassword, (userErr) => {
                        if (userErr) {
                            console.error('Error inserting user:', userErr);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(
                                {
                                    statusCode: "500",
                                    message: 'Internal Server Error'
                                }));
                            return;
                        }
                        let resData = [firstName, lastName, userPhone, userEmail];
                        insertTokenData(userId, jwtToken, (tokenErr) => {
                            if (tokenErr) {
                                console.error('Error inserting token:', tokenErr);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(
                                    {
                                        statusCode: "500",
                                        message: 'Internal Server Error'
                                    }
                                ));
                                return;
                            }
                            console.log('User and token inserted successfully');
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(
                                {
                                    statusCode: "200",
                                    message: 'User registered successfully',
                                    email: userEmail,
                                    token: jwtToken
                                }
                            ));
                        });
                    });
                }
            });
        });
    });
}

function createTables(onTablesCreated) {
    db.query(createUsersTable, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
            return;
        }

        db.query(createTokenTable, (err) => {
            if (err) {
                console.error('Error creating tokens table:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
                return;
            }

            onTablesCreated();
        });
    });
}

function insertUserData(userId, userName, userPhone, userEmail, hashedPassword, onUserDataInserted) {
    const insertUser = `
        INSERT INTO users (user_ID, Name, Phone, Email, Password)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(insertUser, [userId, userName, userPhone, userEmail, hashedPassword], onUserDataInserted);
}

function insertTokenData(userId, jwtToken, onTokenDataInserted) {
    const insertToken = `
        INSERT INTO tokens (user_ID, JWT_Token)
        VALUES (?, ?)
    `;
    db.query(insertToken, [userId, jwtToken], onTokenDataInserted);
}


function createJWTtoken(user) {
    let payload = {
        userEmail: user.userEmail,
        userId: user.userId
    }

    let token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
    return token;
}

module.exports = {
    SignUp
};
