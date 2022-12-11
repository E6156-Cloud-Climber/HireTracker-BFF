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

composite.get('/posts', async (req, res) => {
    let company_id = req.query.company_id ?? ''
    let position_id = req.query.position_id ?? ''
    let page = Number(req.query.page ?? 1)
    let limit = Number(req.query.limit ?? 25)

    try {
        let resp = await fetch(gen_url(`/posts`, 3, { company_id: company_id, position_id: position_id, page: page, limit: limit }))
            .then((resp) => {
                return resp.json()
            })
        let promises = resp.posts.map((post, idx) => {
            let a = fetch(gen_url(`${post.links.phase}`, 3))
                .then((resp) => {
                    return resp.json()
                })
                .then((phase) => {
                    resp.posts[idx].phase = phase
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: err })
                })
            let b = fetch(gen_url(`/composite/${post.links.position}`, 0))
                .then((resp) => {
                    return resp.json()
                })
                .then((position) => {
                    resp.posts[idx].position = position
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: err })
                })
            return Promise.all([a, b])
        });
        await Promise.all(promises)
        res.json(resp)
    } catch (err) {
        res.status(500).json({ error: err })
    }
})

composite.get('/positions/:position_id/timeline', async (req, res) => {
    let position_id = req.params.position_id

    try {
        let timeline = await fetch(gen_url(`/positions/${position_id}/timeline`, 3))
            .then((resp) => {
                return resp.json()
            })
        try {
            let position = await fetch(gen_url(`/composite/${timeline.links.position}`, 0))
                .then((resp) => {
                    return resp.json()
                })
            timeline.position = position
            let promises = timeline.phases.map((phase, idx) => {
                return fetch(gen_url(`${phase.links.phase}`, 3))
                    .then((resp) => {
                        return resp.json()
                    })
                    .then((phase) => {
                        timeline.phases[idx].phase = phase
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({ error: err })
                    })
            });
            await Promise.all(promises)
            res.json(timeline)
        } catch (err) {
            console.log(err)
            res.status(500).json({ error: err })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
})


module.exports = composite;
