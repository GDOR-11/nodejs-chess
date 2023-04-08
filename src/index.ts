import http from "http";
import querystring from "querystring";
import {RequestListener} from "./utils/requestListenerUtils";

const requestListeners: {[req: string]: RequestListener} = {
    "GET /": (request, response, query) => {
        response.end(`you are currently seeing the main page, with query ${JSON.stringify(query)}`);
    },
    "GET /play": (request, response, query) => {
        response.end(`you want to start a match, with query ${JSON.stringify(query)}`);
    }
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