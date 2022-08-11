const port = 3002
const express = require('express')
const app = express()
const Database = require("@replit/database")
const db = new Database();
const PATH = require('path')
const pug = require('pug')

//middlewares for handling forms and stuff
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.set('view engine', 'pug')

app.use('/static', express.static(PATH.join(__dirname, 'static')))
app.get('/post/erase', (req, res) => {
  db.empty()
  res.send('Erased db')
})
app.get('/', async (req, res) => {
  let dataBaseObject = await db.getAll()
  dataBaseObject = handleDatabaseSorting(dataBaseObject)
  console.log(dataBaseObject)

  res.send(pug.renderFile('./views/blog.pug', { data: dataBaseObject, database: db }))
})

app.post('/post', async (req, res) => {
  let dbItems = await db.list()
  
  let objectToAdd = { header: req.body.header, body: req.body.bodyText }
  db.set(dbItems.length + 1, objectToAdd)
  res.redirect('/')
})

app.listen(port, () => {
})