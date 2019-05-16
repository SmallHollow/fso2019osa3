const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

let phonebook = [
  {
      id: 1,
      name: "Arto Hellas",
      number: "045-1236543"
  },
  {
      id: 2,
      name: "Arto Järvinen",
      number: "041-21423123"
  },
  {
      id: 3,
      name: "Lea Kutvonen",
      number: "040-4323234"
  },
  {
      id: 4,
      name: "Martti Tienari",
      number: "09-784232"
  },
]

app.get('/', (req, res) => {
  res.send('<h1>Hello Wörld!</h1>')
})

app.get('/info', (req, res) => {
  let now = new Date()
  res.send(`Puhelinluettelossa on ${phonebook.length} henkilön tiedot<br />${now}`)
})

app.get('/api/persons', (req, res) => {
  res.json(phonebook)
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
  console.log(person)

  response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
