const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(express.json())

morgan.token('content', (req) => {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[Content-Length] :response-time :content'))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:', request.path);
    console.log('Body:', request.body);
    console.log('---');
    next()
}

app.use(requestLogger)

const unknownEndPoint = (request, response) => {
    response.status(404).send({ "error": 'uknown endpoint' })
}

const generateRandomId = (personCount) => {
    const min = personCount;
    const max = 1000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomId;
}

const getFullDateTime = () => {
    const date = new Date()
    const options = {
        "weekday": "short",
        "year": "numeric",
        "month": "short",
        "day": "numeric",
        "hour": "numeric",
        "minute": "numeric",
        "second": "numeric",
        "timeZoneName": "long"
    }

    return date.toLocaleString('en-US', options);
}

const doesNameExists = (name) => {
    const result = persons.filter(person => person.name.toLowerCase() === name.toLowerCase())
    return result.length > 0 ? true : false
}

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    return response.send('<h1>Welcome to Part 3</h1>')
})

app.get('/info', (request, response) => {
    const dataToShow = `<p>Phonebook has info for ${persons.length} people.</p> <p> ${getFullDateTime()} </p>`;
    response.send(dataToShow)

})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => {
        return person.id === id
    })

    if (person) {
        response.json(person)
    }
    else {
        response.statusMessage = 'Requested person not found.'
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {

    const body = request.body

    if (!body.name) {
        response.status(400).json({
            "error": "name is missing"
        })
    }
    else if (!body.number) {
        response.status(400).json({
            "error": "number is missing"
        })
    }

    if (doesNameExists(body.name) == true) {
        response.status(400).json({
            "error": "name must be unique"
        })
    }

    const person = {
        "id": generateRandomId(persons.length),
        "name": body.name,
        "number": body.number || ""
    }

    persons = persons.concat(person)

    response.json(persons)
})

app.use(unknownEndPoint)

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})