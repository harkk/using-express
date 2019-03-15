const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// before all routes because?
app.use(bodyParser.urlencoded({extended: true}));

// set up for cookieParser
app.use(cookieParser());

// this tells express to use EJS as templating engine, needs app
// declaration above
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },

 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function emailCheck(input){
  for(id in users){
  if(users[id]['email'] === input){
    return true;
    }
  } return false;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});


// added below code as route if we go to http://localhost:8080/
// urls.json it will resolve and give us the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// response now resolves this HTML when we go to
// http://localhost:8080/hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// add route for /urls
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_ID],
    urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//route for login form
app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_ID]};
  res.render("urls_login", templateVars);

});

// add a new route for /urls/new
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"]
  let templateVars = {
    user: users[user_ID]
  };
  if (!user_ID) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
})

// add second route and template
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_ID]
  };
  res.render("urls_show", templateVars);
});

// this will take any request to /u/:shortURL and redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// add post route to receive form submission
app.post("/urls", (req, res) => {
  // console.log(req.body.longURL);  // Log the POST request body to the console
  const randomStr = generateRandomString();
  //console.log(req.body.longURL) ---> the url we entered
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect(`/urls/${randomStr}`)
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  //console.log("test", shortURL);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
 //console.log(req.body.longURL);
 let shortURL = req.params.shortURL;
 urlDatabase[shortURL] = req.body.longURL;
 res.redirect(`/urls/${shortURL}`);
})

app.post("/login", (req, res) => {
  for (userID in users) {
    if (users[userID].email && users[userID].email == req.body.email) {
      if (req.body.password == users[userID].password){
      res.cookie('user_ID', userID);
      } else {
      res.status(403).redirect('/login');
      }
    }
   }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("urls");
});

// getting the register info
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]}
  res.render('urls_register', templateVars);
});

// post register info
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email.length === 0 || password.length === 0 || emailCheck(email)) {
    res.sendStatus(400);
  } else {
    user_ID = generateRandomString()
    users[user_ID] = {
      id: user_ID,
      email: email,
      password: password
    };
    res.cookie("user_ID", user_ID);
    res.redirect("/urls");
  }
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// add generateRandomString() function
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}