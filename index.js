const port = 3002
const express = require("express")
const app = express();
const Database = require("@replit/database");
const db = new Database();
const bcrypt = require('bcrypt');
const saltRounds = 10;


const PATH = require('path');
const pug = require('pug');



app.set('view engine', 'pug')
//middlewares for handling forms and stuff
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//setting static path
app.use('/static', express.static(PATH.join(__dirname, 'static')))
db.set('posts', [])
db.set('users', [])


//takes the database and flips it so newest is first
let handleDatabaseSorting = (data) => {
  let workingData = []
  let reverseKeys = Object.keys(data).reverse()
  reverseKeys.forEach(key => {
    if (data[key].header) {
      console.log(key)
      workingData.push(data[key])
    } else db.remove(key)
  })
  return workingData
}
app.get('/', async (req, res) => {
  res.send(pug.renderFile('./views/login.pug'))
})
app.get('/register', async (req, res) => {
  res.send(pug.renderFile('./views/register.pug'))
})

app.get('/main', async (req, res) => {
  let dataBaseObject = await db.get('posts')
  //dataBaseObject = handleDatabaseSorting(dataBaseObject)
  console.log(dataBaseObject)

  res.send(pug.renderFile('./views/blog.pug', { data: dataBaseObject }))
})

app.post('/post', async (req, res) => {
  let dbItems = await db.get('posts')
  let objectToAdd = { header: req.body.header, body: req.body.bodyText }
  dbItems.push(objectToAdd)
  db.set('posts', dbItems)
  res.redirect('/main')
})

app.post('/post/erase', (req, res) => {
  //handle the erase request
  if (req.body.givenkey == process.env['ClearKey']) {
    db.delete('posts')
    res.send('Erased Posts')
  } else { res.send('Bad password, get lost loser.') }
})

app.get('/post/erase', (req, res) => {
  //go to the erase page
  res.send(pug.renderFile('./views/erase.pug'))
})

app.post('/login/submit', async (req, res) => {
  const users = await db.get('users')
  let match = false
  for (let user in users) {
    if (users[user].username === req.body.username) {
      match = await bcrypt.compare(req.body.password, users[user].password)
    }
  }
  if (match) {
    res.redirect('/main')
  } else {
    res.redirect('/register')
  }
})

app.post('/register/submit', async (req, res) => {
  const users = await db.get('users')
  for (let user in users) {
    console.log(users[user])
    if (users[user].username == req.body.username) {
      return // should break out of creating user
    }
  }
  console.log('past the loopn this means a user was made')
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    users.push({ username: req.body.username, password: hash })
    db.set('users', users)
    res.redirect('/')
  })
})


app.listen(port, () => {
})