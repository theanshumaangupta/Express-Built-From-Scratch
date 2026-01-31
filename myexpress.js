import http from "http"
import fs from "fs"
function express() {
    const app = {
        routes: {},
        get(path, handler) {
            let parts = path.split(":")
            let obj = {
                "handler": handler,
            }
            this.routes[path] = obj
        },
        listen(port, fn) {
            fn()
            const server = http.createServer((hreq, hres) => {
                let req = {
                }
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
                // checking static urls 
                if (this.routes[hreq.url]) {
                    this.routes[hreq.url].handler(req, res)
                }
                // checking if parameters
                else {
                    //    hreq.url        = "/user/45"
                    //    this.routes[1]  = "/user/:id"

                    // let clientChunks = ['', 'user', '45']
                    let clientChunks = hreq.url.split("/")


                    let routesArray = Array.from(Object.keys(this.routes))
                    for (let index = 0; index < routesArray.length; index++) {
                        const route = routesArray[index];
                        if (route.includes(":")) {
                            const routeChunks = route.split("/")
                            // route = "/user/:id"
                            // routeChunks = ["", "user", ":id"] 
                            if (routeChunks.length == clientChunks.length) {
                                let params = {}
                                let found = true
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
                                    this.routes[route].handler(req, res)
                                    break
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