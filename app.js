const express = require('express')
const app = express()
const port = process.env.PORT || 3010
const cors = require('cors');


app.use(cors({
    origin: '*'
}));

app.use('/api/composite', require('./controllers/composite'));

app.get('/heartbeat', (req, res) => {
    res.send('Connection is stable...')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})