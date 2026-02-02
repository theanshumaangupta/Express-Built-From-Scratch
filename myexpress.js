import http from "http"
import fs from "fs"
import { strict } from "assert"
function express() {
    let routeObject = {}
    let middlewareObject = {}
    function render(req, res) {
        routeObject[req.url].handler(req, res)
    }

    function renderMiddleware(req, res) {
        let functionChain = []
        let currIndex = 1
        function next() {
            if (functionChain.length > currIndex ) {
                currIndex+=1
                functionChain[currIndex-1](req, res, next)
            }
        }
        Object.keys(middlewareObject).forEach((route) => {
            // collecting all middlewares into fn chain
            if (req.url === route || req.url.startsWith(route + "/") || route=="*" ) {
                functionChain = [...functionChain, ...middlewareObject[route]]
            }
        })
        functionChain.length>0 && functionChain[0](req, res, next)
        // functionChain.length > 0 && functionChain.forEach((fn) => {
        //    fn(req, res, next)
        // })
        render(req, res)
    }
    const app = {

        get(path, handler) {
            let obj = {
                "handler": handler,
            }
            routeObject[path] = obj
        },
        use(arg1, arg2="*") {
            let path, middleware
            if(typeof(arg1)=="function"){
                path = "*"
                middleware = arg1
            }else if(typeof(arg1) == "string" && typeof(arg2) == "function"){
                path = arg1
                middleware = arg2
            }
            if (middlewareObject[path]) {
                middlewareObject[path] = [...middlewareObject[path], middleware]

            }
            else {
                let existing = { ...middlewareObject }
                existing[path] = [middleware]
                middlewareObject = existing
            }
        },
        listen(port, fn) {
            fn()
            const server = http.createServer((hreq, hres) => {
                // Request 
                let req = {
                    url: hreq.url,
                    method: hreq.method,
                    headers: hreq.headers,
                    httpVersion: hreq.httpVersion,
                    ip: hreq.socket.remoteAddress,
                    raw: hreq   // reference to original node request
                }

                // Response
                let res = {
                    sandesh: function (message) {
                        hres.writeHead(200, { 'Content-Type': 'text/plain' });
                        hres.end(message);
                    },
                    fileBhejo: function (file, head) {
                        let data = fs.readFileSync(file, 'utf-8')
                        hres.writeHead(200, { 'Content-Type': head });
                        hres.end(data);
                    }
                }



                if (hreq.url.includes("?")) {
                    const clientQueryChunks = hreq.url.split("?")
                    let queryObject = {}
                    // For query variable ?a=8&b=0
                    const singleQuery = clientQueryChunks[1].split("&")
                    singleQuery.forEach(query => {
                        let a = query.split("=")
                        queryObject[a[0]] = a[1]
                    });
                    req.query = queryObject
                    hreq.url = clientQueryChunks[0]
                }
                if (routeObject[hreq.url]) {
                    // Static Routes
                    req.url = hreq.url
                    renderMiddleware(req, res)
                }
                else {
                    // For routes like /:id
                    let clientChunks = hreq.url.split("/")
                    let routesArray = Array.from(Object.keys(routeObject))
                    for (let index = 0; index < routesArray.length; index++) {
                        const route = routesArray[index];
                        if (route.includes(":")) {
                            const routeChunks = route.split("/")
                            // Ex - route = "/user/:id"
                            // routeChunks = ["", "user", ":id"] 
                            if (routeChunks.length == clientChunks.length) {
                                let found = true
                                let params = {}
                                for (let index = 0; index < routeChunks.length; index++) {
                                    const segment = routeChunks[index];
                                    if (segment.includes(":")) {
                                        params[(routeChunks[index]).replace(":", "")] = clientChunks[index]
                                        found = true
                                        continue
                                    }
                                    else {
                                        if (routeChunks[index] != clientChunks[index]) {
                                            params = {}
                                            found = false
                                            break
                                        }
                                    }

                                }
                                if (found) {
                                    req.params = params
                                    // routeObject[route].handler(req, res)
                                    req.url = route
                                    renderMiddleware(req, res)
                                    return
                                }
                            }

                        }

                    }
                }

            })
            server.listen(port)
        }
    }
    return app;
}
export default express;