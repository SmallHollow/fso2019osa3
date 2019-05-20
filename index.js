require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Person = require('./models/person')
const morgan = require('morgan')
const cors = require('cors')

let phonebook = []

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
  console.log("/INFO")
  res.send(`Puhelinluettelossa on ${phonebook.length} henkilön tiedot<br />${now}`)
})

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then(phonebook => {
      res.json(phonebook.map(person => person.toJSON()))
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'ei onnistu' })
    })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  // const person = phonebook.find(person => person.id === id)
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
      // phonebook = phonebook.filter(person => person.id !== request.params.id);
    })
    .catch(error => {
      console.log("Poistovirhe. ", error)
    })
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

  const person = new Person({
    name: body.name,
    number: body.number,
    id: body.id
  })

  person.save()
    .then(savedPerson => {
      console.log(`lisätään ${person.name} numero ${person.number} luetteloon`)
      response.json(savedPerson.toJSON())
      return
    })
    .catch(reason => {
      console.log("Probleema!", reason)
    })

  phonebook = phonebook.concat(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
