import 'dotenv/config'
import express from "express"

const app = express();
const PORT = 3000;

app.use(express.json())

app.get('/trigger-lambda', async (req, res) => {
    res.send('Hello from lambda')
})

app.listen(PORT, () => {
    console.log(`Currently Listening To Requests On PORT: ${PORT}`)
})