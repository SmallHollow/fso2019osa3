require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Person = require('./models/person')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('postjson', (req, res) => {
  return (req.method === "POST" ? JSON.stringify(req.body) : null)
})

app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postjson'))

app.get('/', (req, res) => {
  res.send('<h1>Hello Wörld!</h1>')
})

app.get('/info', (req, res) => {
  let now = new Date()
  res.send(`Puhelinluettelossa on ${phonebook.length} henkilön tiedot<br />${now}`)
})

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then(phonebook => {
      res.json(phonebook.map(person => person.toJSON()))
    })
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = phonebook.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  phonebook = phonebook.filter(person => person.id !== id);

  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || ! body.number) {
    return response.status(400).json({
     error: (!body.name ? 'Nimi puuttuu!' : 'Numero puuttuu!')
    })
  }

  const duplicates = phonebook.filter(p => p.name === body.name)
  if (duplicates.length > 0) {
    return response.status(400).json({
     error: 'Nimi on jo luettelossa!'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * Math.floor(50000)) + 100
  }

  phonebook = phonebook.concat(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
