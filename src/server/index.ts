import http from "http";
import querystring from "querystring";
import {RequestListener, fileRequestListener, EJSfileRequestListener, directoryRequestListener} from "./RequestListener.js";

const requestListeners: {[req: string]: RequestListener} = {
    "GET /": EJSfileRequestListener("./client/index.ejs"),
    "GET /play": EJSfileRequestListener("./client/play.ejs")
};

let reqlistener = directoryRequestListener("./client");

const server = http.createServer((request, response) => {
    const [url, query_str]: string[] = (request.url + "?").split("?");
    const query = querystring.parse(query_str);
    

    //#region
    reqlistener(request, response, query);
    return;
    //#endregion



    response.statusCode = 404;
    response.setHeader("content-type", "text/html");
    response.end("this page does not exist, stop messing around foolish hooman");
});

server.listen(3000, () => {
    console.log("server listening on port 3000");
});