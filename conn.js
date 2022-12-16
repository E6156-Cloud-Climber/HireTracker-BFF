const svc_port = process.env.SVCPORT || 3000
const svc_endpoint = process.env.SVCENDPOINT
const svc_prefix = process.env.SVCPREFIX || "/api"
const svc_port1 = process.env.SVCPORT1 || svc_port
const svc_endpoint1 = process.env.SVCENDPOINT1 || svc_endpoint
const svc_prefix1 = process.env.SVCPREFIX1 || svc_prefix
const svc_port2 = process.env.SVCPORT2 || svc_port
const svc_endpoint2 = process.env.SVCENDPOINT2 || svc_endpoint
const svc_prefix2 = process.env.SVCPREFIX2 || svc_prefix
const svc_port3 = process.env.SVCPORT3 || svc_port
const svc_endpoint3 = process.env.SVCENDPOINT3 || svc_endpoint
const svc_prefix3 = process.env.SVCPREFIX3 || svc_prefix

console.log("svc_endpoint:", svc_endpoint)
console.log("svc_endpoint1:", `${svc_endpoint1}:${svc_port1}${svc_prefix1}`)
console.log("svc_endpoint2:", `${svc_endpoint2}:${svc_port2}${svc_prefix2}`)
console.log("svc_endpoint3:", `${svc_endpoint3}:${svc_port3}${svc_prefix3}`)

function gen_url(path, svc = 0, params = {}) {
    let url = ''
    if (svc == 0)
        url = `${svc_endpoint}:${svc_port}${svc_prefix}${path}`
    else if (svc == 1)
        url = `${svc_endpoint1}:${svc_port1}${svc_prefix1}${path}`
    else if (svc == 2)
        url = `${svc_endpoint2}:${svc_port2}${svc_prefix2}${path}`
    else if (svc == 3)
        url = `${svc_endpoint3}:${svc_port3}${svc_prefix3}${path}`
    strarr = []
    for (let key in params) {
        if (params[key] || params[key] === 0)
            strarr.push(`${key}=${params[key]}`)
    }
    if (strarr.length) url += '?' + strarr.join('&')
    console.log(url)
    return url
}

module.exports = gen_url