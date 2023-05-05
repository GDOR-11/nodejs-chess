import http from "http";
import { EJSfileRequestListener, directoryRequestListener } from "./RequestListener.js";
const requestListeners = {
    "GET /": EJSfileRequestListener("./client/index.ejs"),
    "GET /play": EJSfileRequestListener("./client/play.ejs")
};
let reqlistener = directoryRequestListener("./client");
const server = http.createServer((request, response) => {
    //#region
    reqlistener(request, response);
    return;
    //#endregion
    response.statusCode = 404;
    response.setHeader("content-type", "text/html");
    response.end("this page does not exist, stop messing around foolish hooman");
});
server.listen(3000, () => {
    console.log("server listening on port 3000");
});
