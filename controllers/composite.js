const express = require('express')
const fetch = require('node-fetch')
const gen_url = require('../conn')
moment = require('moment')

let composite = express.Router()

composite.use(express.json())

composite.post('/users/:user_id/posts', async (req, res, next) => {
    let user_id = req.params.user_id
    let company_name = req.body.company_name
    let position_name = req.body.position_name
    let phase_id = req.body.phase_id
    let description = req.body.description
    let year = req.body.year
    let position_type = req.body.position_type
    let link = req.body.link
    let date = req.body.date

    if (!company_name) next(Error(`Invalid company_name=${company_name}`))
    if (!position_name) next(Error(`Invalid position_name=${position_name}`))
    if (!phase_id) next(Error(`Invalid phase_id=${phase_id}`))
    if (!description) next(Error(`Invalid description=${description}`))

    let company_id = undefined
    let position_id = undefined
    let new_pos = false

    company_id = await fetch(gen_url('/companies', 2, { search_string: company_name })).then(
        (resp) => { return resp.json() }

    ).then((res) => {
        if (res.companies) {
            for (const company of res.companies) {
                if (company.name.toLowerCase() === company_name.toLowerCase()) { return company.id }
            }
        }

    }).catch((err) => next(err))

    position_id = await fetch(gen_url('/positions', 2, { search_string: position_name, company_id: company_id ? company_id : '' })).then(
        (resp) => { return resp.json() }
    ).then((res) => {
        if (res.positions) {
            for (const position of res.positions) {
                if (position.name.toLowerCase() === position_name.toLowerCase()) { return position.id }
            }
        }
    })


    if (company_id === undefined) {
        company_id = await fetch(gen_url('/companies', 2), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: company_name })
        }).then((resp) => resp.json())
            .then(res => { if ("company_id" in res) { return res.company_id } else { throw Error(`Invalid response.json()=${JSON.stringify(res)}`) } })
            .catch(err => next(err))
    }

    if (position_id === undefined) {
        position_id = await fetch(gen_url('/positions', 2), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ company_id: company_id, name: position_name, position_type: position_type, active: 1, year: year, link: link })
        }).then(resp => resp.json())
            .then(res => {
                if ("position_id" in res) {
                    req.new_pos = true
                    new_pos = true
                    return res.position_id
                } else { throw Error(`Invalid response.json()=${JSON.stringify(res)}`) }
            })
            .catch(err => next(err))
    }

    let post_id = await fetch(gen_url(`/users/${user_id}/posts`, 3), {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phase_id: phase_id,
            user_id: user_id,
            position_id: position_id,
            // date: moment().format('YYYY-MM-DD'),
            date: date,
            description: description
        })
    }).then(resp => resp.json())
        .then(res => { if ("post_id" in res) { return res.post_id } else { throw Error(`Invalid response.json()=${JSON.stringify(res)}`) } })
        .catch(err => next(err))

    res.json({ post_id: post_id, new_pos: new_pos })

    next()
})


composite.get('/positions/:position_id', async (req, res, next) => {
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
                    next(err)
                })
        })
        .catch((err) => {
            next(err)
        })
})

composite.get('/positions', async (req, res, next) => {
    let company_id = req.query.company_id ?? '';
    let search_string = req.query.search_string ?? "";
    let position_type = req.query.position_type ?? "";
    let year = req.query.year ?? '';
    let active = Number(req.query.active ?? 1);

    let page = Number(req.query.page ?? 1); // page number is 1-indexed
    let limit = Number(req.query.limit ?? 20);

    try {
        let resp = await fetch(gen_url(`/positions`, 2, {
            company_id: company_id,
            search_string: search_string,
            position_type: position_type,
            year: year,
            active: active,
            page: page,
            limit: limit
        })).then((resp) => {
            return resp.json()
        });

        let promises = resp.positions.map((pos, idx) => {
            return fetch(gen_url(`/companies/${pos.company_id}`, 2))
                .then((resp) => {
                    return resp.json()
                })
                .then((company) => {
                    resp.positions[idx].company = company
                })
                .catch((err) => {
                    next(err)
                })
        })
        await Promise.all(promises)
        res.json(resp)
    } catch (err) {
        next(err)
    }
})

// Return position_name, company_name, phase_name, description, 
composite.get('/posts', async (req, res, next) => {
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
                    resp.posts[idx].phase_name = phase.name
                })
                .catch((err) => {
                    next(err)
                })
            let b = fetch(gen_url(`/composite${post.links.position}`, 0))
                .then((resp) => {
                    return resp.json()
                })
                .then((position) => {
                    resp.posts[idx].position = position
                    resp.posts[idx].position_name = position.name
                    resp.posts[idx].company_name = position.company.name
                })
                .catch((err) => {
                    next(err)
                })
            return Promise.all([a, b])
        });
        await Promise.all(promises)
        res.json(resp)
    } catch (err) {
        next(err)
    }
})

composite.get('/positions/:position_id/timeline', async (req, res, next) => {
    let position_id = req.params.position_id

    try {
        let timeline = await fetch(gen_url(`/positions/${position_id}/timeline`, 3))
            .then((resp) => {
                return resp.json()
            })
        try {
            let position = await fetch(gen_url(`/composite${timeline.links.position}`, 0))
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
                        next(err)
                    })
            });
            await Promise.all(promises)
            res.json(timeline)
        } catch (err) {
            next(err)
        }
    } catch (err) {
        next(err)
    }
})


module.exports = composite;
