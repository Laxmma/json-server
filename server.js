const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const jsonfile = require('jsonfile')
const sessionsFile = './sessions.json';
const dataFile = './db.json';

let sessions;
jsonfile.readFile(sessionsFile, (err, obj) => {
    sessions = obj;
});

let users;
jsonfile.readFile(dataFile, (err, obj) => {
    users = obj.users;
});

server.use(middlewares)

function isValidToken(token) {
    if(sessions[token]) {
        return true;
    }
    return false;
}

function generateToken() {
    var token = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 64; i++)
    token += possible.charAt(Math.floor(Math.random() * possible.length));

    return token;
}

function updateSession() {
    jsonfile.writeFile(sessionsFile, sessions, function (err) {
        console.error(err)
    });
}

function handleAuthorization(req, res, next) {
    let reqUrl = req.originalUrl;
    let reqMethod = req.method;

    if(reqUrl === '/login' && reqMethod === 'POST') {
        var postData = '';
        req.on('data', function (data) {
            postData += data;
        });

        req.on('end', function () {
            var credentials = postData.split('&');
            var emailArr = credentials[0].split('=');
            var email = emailArr[1];
            var passwordArr = credentials[1].split('=');
            var password = passwordArr[1];
            if(email && password) {
                for (const user of users) {
                    if(user.email === email && user.password === password) {
                        var token = generateToken();
                        sessions[token] = user.id;
                        updateSession();
                        user.token = token;
                        res.status(200).send(user);
                        return;
                    }
                }
                res.status(401).send({error: 'Invalid email or password'});
            }else{
                res.status(401).send({error: 'Invalid email or password'});
            }
        });
    }else if(reqUrl === '/logout' && reqMethod === 'GET') {
        if(req.headers.token && isValidToken(req.headers.token)) {
            delete sessions[req.headers.token];
            updateSession();
            res.status(200).send("success");
            return;
        } else {
            res.status(401).send({error: 'Invalid request'});
        }
    }else if((reqUrl === '/users' && reqMethod === 'POST') || reqUrl === '/db') {    
        // Don't check Authorization for registration and db urls
        next()
    }else{
        //validate token here
        if(req.headers.token && isValidToken(req.headers.token)) {
            next()
        } else {
            res.status(401).send({error: 'Invalid token'});
        }
    }    
}

server.use(handleAuthorization)
server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})

// Test users PUT with empty password. it should not erase password.