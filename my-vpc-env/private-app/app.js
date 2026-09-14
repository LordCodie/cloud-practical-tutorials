import express from "express"

const app = express()
const PORT = 3000

app.get('/', (req, res) => {
    res.send('You have accessed a private ec2 instance \n NO UNAUTHORIZED TRAFFIC PERMITTED!!!!')
})

app.listen(PORT, () => {
    console.log(`Application Server Listening on Port: ${PORT}`)
})