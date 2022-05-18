require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
var morgan = require('morgan')
const cors = require('cors')
app.use(cors())
const Person = require('./models/person')
const { request, response } = require('express')
const { updateOne } = require('./models/person')


  app.use(morgan('tiny'))
  

  morgan.token('body', (req, res) => JSON.stringify(req.body));
  app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'));

  app.use(express.static('build'))

  app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
  })
  
  app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
      res.json(persons)
    })
  })

  app.get('/api/persons/:id', (req,res, next) => {

    Person.findById(req.params.id).then(person => {
      res.json(person)
    })
    .catch(error => next(error));
     
  })

  app.get('/info', (req, res) => {
    var date = new Date()
    Person.find({})
    .then(persons => {
      res.send(`<h1>Phonebook has info for ${persons.length} people</h1>` + date)
    })
  })

  app.delete('/api/persons/:id', (request, response, next) => {
    const id = Number(request.params.id)
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
   
  })

  app.post('/api/persons', (request, response, next) => {
    const body = request.body
    var max = 100
    /*
   if (person.name === undefined || person.number === undefined) {
    return response.status(400).json({ 
        error: 'content missing' 
      })
   }
   if(persons.find(person => person.name === body.name)) {
    return response.status(400).json({ 
        error: 'name must be unique' 
      })
   }
*/
    const person = new Person({
      content: body.content,
      number: body.number,
      id: Math.floor(Math.random() * max)
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
  })

  app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    
    const person = {
      content: body.content,
      number: body.number
    }
     Person.findByIdAndUpdate(request.params.id, person, { new: true,  runValidators: true, context: 'query' })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
  }

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

  app.use(unknownEndpoint)

  app.use(errorHandler)

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })