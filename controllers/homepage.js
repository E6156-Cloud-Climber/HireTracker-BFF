const express = require('express')
const fetch = require('node-fetch');


port = process.env.PORT || 3000
endpoint = process.env.ENDPOINT || "http://54.84.3.38"

var homepage = express.Router()

homepage.use(express.json())

homepage.get('/:user_id', (req, res) => {
    user_id = req.params.user_id

    timelines = fetch(`${endpoint}:${port}/api/users/${user_Id}/timelines`)
        .then((resp) => {
            return resp.json();
        })
        .then((result) => {
            console.log(result)
        })
        .catch((err) => {
            console.log(err);
        });

    popular_phases = fetch(`${endpoint}:${port}/api/phases`)
        .then((resp) => {
            return resp.json();
        })
        .then((result) => {
            console.log(result)
        })
        .catch((err) => {
            console.log(err);
        });

    recent_posts = fetch(`${endpoint}:${port}/api/posts`)
        .then((resp) => {
            return resp.json();
        })
        .then((result) => {
            console.log(result)
        })
        .catch((err) => {
            console.log(err);
        });
})


module.exports = homepage;
