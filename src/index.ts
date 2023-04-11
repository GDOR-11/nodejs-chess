import http from "http";
import querystring from "querystring";
import {RequestListener, fileRequestListener, EJSfileRequestListener} from "./RequestListener.js";

const requestListeners: {[req: string]: RequestListener} = {
    "GET /": EJSfileRequestListener("./public/index.ejs"),
    "GET /play": EJSfileRequestListener("./public/play.ejs")
};

const server = http.createServer((request, response) => {
    const [url, query_str]: string[] = (request.url + "?").split("?") as string[];
    const query = querystring.parse(query_str);
    
    const requestListener = requestListeners[`${request.method} ${url}`] as RequestListener | undefined;
    
    if(requestListener === undefined) {
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