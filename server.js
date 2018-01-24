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
    console.log('==============Checking Authorization==============');
    //console.log(req.headers.token);
    //console.log(sessions);
    console.log(users);
    //console.log(req.originalUrl);
    //console.log(req.method);
    console.log('==============Checking Authorization==============');
    let reqUrl = req.originalUrl;
    let reqMethod = req.method;

    if(reqUrl === '/login') {
        // check login and respond with user data
        // Generate token and session
        console.log(reqMethod);
        console.log(req.body);
        //console.log(req.body.password);
    }else if(reqUrl === '/logout') {
        // remove session
    }else if((reqUrl === '/users' && reqMethod === 'POST') || reqUrl === '/db') {    
        next()
        
    }else{
        //validaten token here
        if(req.headers.token && isValidToken(req.headers.token)) {
            next()
        } else {
            res.sendStatus(401);
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