import express from "express";

const app = express();
const PORT = 80;

app.get("/", (req, res) => {
  res.send('Hello from EC2!');
});

app.get("/test-path", (req, res) => {
  res.send('You are currently in test path');
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on PORT: ${PORT}`)
})
