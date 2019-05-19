const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('syntaksi: node mongo.js salasana [nimi] [numero]')
  process.exit(1)
}

const password = process.argv[2]
const url =
  `mongodb+srv://fullstackgeezer:${password}@cluster0-for7s.mongodb.net/phonebook-app?retryWrites=true`
mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if ( process.argv.length === 3) {
  console.log("puhelinluettelo:")
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}

if ( process.argv.length > 4) {
  const argName = process.argv[3]
  const argNumber = process.argv[4]

  const person = new Person({
    name: argName,
    number: argNumber
  })
  person.save().then(response => {
    console.log(`lisätään ${argName} numero ${argNumber} luetteloon`)
    mongoose.connection.close()
  })
}
