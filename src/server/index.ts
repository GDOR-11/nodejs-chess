import http from "http";
import {directoryRequestListener} from "./defaultRequestListeners.js";

const server = http.createServer(directoryRequestListener("./client"));

server.listen(3000, () => {
    console.log("server listening on port 3000");
});