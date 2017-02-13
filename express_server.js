const express = require('express');
var cookieSession = require('cookie-session')
const shorten = require('./shorten')
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');

app.use(cookieSession({name: 'session', keys: ['key1']}))
app.use((req, res, next) => {
    const user = users[req.session.user_id];
    req.user = user;
    res.locals.user = user;
    next();
});

const users = {
    '55u07y': {
        id: '55u07y',
        email: 'captinplanet@gmail.com',
        password: '$2a$10$tksHPQdTfmnqo6iq8oQaP.Ja0u9e9X7DqHwHK6E/5BL5MGTBQS1nS'
    }
};
const urlDatabase = {
    b2xVn2: {
        shortURL: 'b2xVn2',
        longURL: 'http://www.lighthouselabs.ca',
        user_id: 'b2xVn2'
    },
    tsm5xk: {
        shortURL: '9sm5xk',
        longURL: 'http://www.google.com',
        user_id: '9sm5xk'
    }
};
app.use('/urls*?', (req, res, next) => {
    if (!req.user) {
        res.status(401).send('<a href="/login">sign in</a>');
        return;
    }
    next();
});

app.get('/', (request, response) => {
    let templateVariables = {
        username: request.session['username'],
        loggedin: false
    }

    if (!request.session.username) {
        response.render('urls_new', templateVariables);
    } else {
        templateVariables.loggedin = true;
        response.render('urls_new', templateVariables);
    }
});

app.get('/login', (req, res) => {
    res.render('urls_login');
});

app.post("/login", (req, res) => {
    for (let userIndex in users) {
        let user = users[userIndex];
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            res.status(403).send("login failed, email/password incorrect/non-existent");
            return;
        }
        req.session.user_id = user.id;
        res.redirect('/');
    }
});

app.post('/logout', (request, response) => {
    request.session = null;
    response.redirect('/')
});

app.post("/urls", (req, res) => {
    const shortURL = shorten.generateRandomString();
    urlDatabase[shortURL] = {
        shortURL: shortURL,
        longURL: req.body.longURL,
        user_id: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`)
});

app.post('/urls/:id/delete', (req, res) => {
    let nukeUrl = req.params.id
    delete urlDatabase[nukeUrl]
    res.redirect('/urls')
});

app.get('/register', (request, response) => {
    response.render('urls_register')
});

app.post('/register', (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400).send('email or password blank');
    }

    for (let user in users) {
        let u = users[user];
        if (req.body["email"] === u.email) {
            res.status(400).send('email address taken');
        }
    }

    const userId = shorten.generateRandomString();
    users[userId] = {
        id: userId,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = userId;
    console.log(users)
    res.redirect('/');
});

app.get('/urls', (req, res) => {
    let templateVariables = {
        urls: urlDatabase
    };
    res.render('urls_index', templateVariables);
});

app.get('/urls/:id', (request, response) => {
    let templateVariables = {
        shortURL: request.params.id,
        longURL: urlDatabase[request.params.id].longURL
    };
    response.render('urls_show', templateVariables);
});

app.post('/urls/:id', (req, res) => {
    if (!req.body["longURL"]) {
        res.redirect('/urls/' + req.params.id);
    } else {
        urlDatabase[req.params.id].longURL = req.body["longURL"];
        res.redirect('/urls');
    }
});

app.get('/hello', (request, response) => {
    response.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.post('/urls/:id/edit', (request, response) => {
    const newValue = request.body.Value;
    const id = request.params.id
    urlDatabase[id] = Value
    console.log(Value, id)
    response.redirect('/urls')
});

app.get('/urls/:id/edit', (request, response) => {
    let templateVariables = {
        id: request.params.id,
        currentValue: (urlDatabase[request.params.id])
    };
    response.render('urls_test', templateVariables)
});

app.get("/u/:shortURL", (req, res) => {
    if (!req.user) {
        res.status(403);
        return;
    }
    console.log(urlDatabase)
    console.log(urlDatabase[req.params])
    let longURL = (urlDatabase[req.params.shortURL].longURL);
    res.redirect(longURL);
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
