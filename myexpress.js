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
        // Continuing the chain f middlewares
        function next() {
            if (currIndex < functionChain.length) {
                currIndex += 1
                functionChain[currIndex - 1](req, res, next)
            }
            else if (currIndex == functionChain.length) {
                render(req, res)
            }
        }
        Object.keys(middlewareObject).forEach((route) => {
            // collecting all middlewares into fn chain
            if (req.url === route || req.url.startsWith(route + "/") || route == "*") {
                functionChain = [...functionChain, ...middlewareObject[route]]
            }
        })
        // Running the first middleware and starting the chain
        functionChain.length > 0 && functionChain[0](req, res, next)
    }
    const app = {
        get(path, handler) {
            let obj = {
                "handler": handler,
            }
            routeObject[path] = obj
        },
        use(...args) {
            if (args.length == 0) {
                throw new Error ("Bhkk Bosdike")
            }
            let path, middlewareArray
            if (typeof (args[0]) != "string") {
                path = "*"
                middlewareArray = args

            } else if(typeof args[0] == "string" && args.length > 1){
                path = args[0]
                middlewareArray = args.slice(1, args.length)
            }else{
                console.log(args);
            }


            if (middlewareObject[path]) {
                middlewareObject[path] = [...middlewareObject[path], ...middlewareArray]
            }
            else {
                middlewareObject[path] = [...middlewareArray]

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