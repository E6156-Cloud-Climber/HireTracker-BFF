const express = require('express')
const app = express()
const port = 3000
const cors = require('cors');


app.use(cors({
    origin: '*'
}));

app.use('/composite/homepage', require('./controllers/homepage'));

app.get('/heartbeat', (req, res) => {
    res.send('Connection is stable...')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})