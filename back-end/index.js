const express = require('express')
const dotenv = require('dotenv')
const { readFile } = require('fs')

const app = express()
const port = 3000

app.use(express.json())
app.use(express.static('front-end'))

dotenv.config()

app.get('/', (request, response) => {
    readFile('front-end/homepage.html', 'utf-8', (err, html) => {
        response.send(html)
    })
})

app.post('/envkey', (request, response) => {
    const body = request.body

    if (body.security == "pqiugbdjw1koi9fuh5r4ewi6w5o5f5uf") {
        response.status(200).send({
            res: `${process.env.OPENWEATHERAPI_KEY}`
        })
    } else {
        response.status(200).send({
            res: 'yeah nice try'
        })
    }
})

app.listen(port, () => console.log(`App now live on "http://localhost:${port}"`))