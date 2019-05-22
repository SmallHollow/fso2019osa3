require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Person = require('./models/person')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('postjson', (req, res) => {
  return (req.method === "POST" || "PUT" ? JSON.stringify(req.body) : null)
})

const errorHandler = (error, request, response, next) => {
  console.error("name: ", error.name)
  console.error("message: ", error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'virheellinen id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postjson'))

app.get('/', (req, res) => {
  res.send('<h1>Hello Wörld!</h1>')
})

app.get('/info', (req, res) => {
  let now = new Date()
  Person.countDocuments({})
    .then(count => {
      res.send(`Puhelinluettelossa on ${count} henkilön tiedot<br />${now}`)
    })
  .catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(phonebook => {
      res.json(phonebook.map(person => person.toJSON()))
    })
  .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
  .catch(error => next(error))
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
    id: request.params.id
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || ! body.number) {
    return response.status(400).json({
     error: (!body.name ? 'Nimi puuttuu!' : 'Numero puuttuu!')
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
  .catch(error => next(error))

})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
