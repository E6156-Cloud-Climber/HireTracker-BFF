const express = require('express')
const app = express()
const port = process.env.PORT || 3010
const cors = require('cors');
const mw_notify = require('./middleware/notify')


app.use(cors({
    origin: '*'
}));

app.use(express.json());
app.use('/api/composite', require('./controllers/composite'));
app.use(mw_notify())

app.get('/heartbeat', (req, res) => {
    res.send('Connection is stable...')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})