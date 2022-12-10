const express = require('express')
const fetch = require('node-fetch')
const gen_url = require('../conn')

let composite = express.Router()

composite.use(express.json())

composite.get('/positions/:position_id', async (req, res) => {
    position_id = req.params.position_id

    await fetch(gen_url(`/positions/${position_id}`, 2))
        .then((resp) => {
            return resp.json()
        })
        .then((position) => {
            console.log(position)
            fetch(gen_url(`${position.links.company}`, 2))
                .then((resp) => {
                    return resp.json()
                })
                .then((company) => {
                    position.company = company
                    res.json(position)
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: err })
                })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err })
        })
})


module.exports = composite;
