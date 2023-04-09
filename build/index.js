import http from "http";
import querystring from "querystring";
import { fileRequestListener, EJSfileRequestListener } from "./RequestListener.js";
const requestListeners = {
    "GET /": EJSfileRequestListener("./public/index.ejs"),
    "GET /play": (request, response, query) => {
        response.end(`you want to start a match, with query ${JSON.stringify(query)}`);
    },
    "GET /index.js": fileRequestListener("./public/index.js")
};
const server = http.createServer((request, response) => {
    const [url, query_str] = (request.url + "?").split("?");
    const query = querystring.parse(query_str);
    const requestListener = requestListeners[`${request.method} ${url}`];
    if (requestListener === undefined) {
        response.statusCode = 404;
        response.setHeader("content-type", "text/html");
        response.end("this page does not exist, stop messing around foolish hooman");
        return;
    }
    requestListener(request, response, query);
});
server.listen(3000, () => {
    console.log("server listening on port 3000");
});
