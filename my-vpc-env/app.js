import express from "express"

const app = express()
const PORT = 3000

app.get('/', (req, res) => {
    res.send('You have accessed a public ec2 instance')
})

app.listen(PORT, () => {
    console.log(`Application Server Listening on Port: ${PORT}`)
})