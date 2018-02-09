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

function handleAuthorization(req, res, next) {
    let reqUrl = req.originalUrl;
    let reqMethod = req.method;

    if(reqUrl === '/login' && reqMethod === 'POST') {
        // check login and respond with user data
        // Generate token and session
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
            console.log(email);
            console.log(password);
            if(email && password) {
                for (const user of users) {
                    if(user.email === email && user.password === password) {
                        res.status(200).send(user);
                    }
                }
                res.status(401).send({error: 'Invalid email or password'});
            }else{
                res.status(401).send({error: 'Invalid email or password'});
            }
        });
    }else if(reqUrl === '/logout') {
        // remove session
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

// Remove authentication for users POST call
// Test users PUT with empty password. it should not erase password.