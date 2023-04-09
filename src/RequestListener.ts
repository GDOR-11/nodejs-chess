import {IncomingMessage, ServerResponse} from "http";
import {ParsedUrlQuery} from "querystring";
import fs from "fs/promises";
import ejs from "ejs";
import mime from "mime-types";

export type RequestListener = (request: IncomingMessage, response: ServerResponse, query: ParsedUrlQuery) => void;

export function fileRequestListener(filepath: string, mimeType?: string): RequestListener {
    // if mime type was not given, look it up
    if(mimeType === undefined) {
        let tmp_mimeType = mime.lookup(filepath);
        if(tmp_mimeType === false) {
            throw Error("unrecognized file extension, please provide a mime type for it.");
        } else {
            mimeType = tmp_mimeType;
        }
    }

    // read the file beforehand
    let responseData: string | undefined = undefined;
    fs.readFile(filepath, "utf8").then(data => {
        responseData = data;
    }).catch(error => {
        throw error;
    });

    // return request listener
    return (request, response, query) => {
        // if the file has not been read yet, send 503 failure response
        if(responseData === undefined) {
            response.setHeader("content-type", "text/html");
            response.statusCode = 503;
            response.end("<h1>503 lol<h1>");
        } else {
            // send content
            response.setHeader("content-type", mimeType as string);
            response.statusCode = 200;
            response.end(responseData);
        }
    }
}

export function EJSfileRequestListener(filepath: string, EJSdata?: ejs.Data, EJSoptions?: ejs.Options): RequestListener {
    // read and process the given file
    let responseData: string | undefined = undefined;
    ejs.renderFile(filepath, EJSdata, EJSoptions).then(data => {
        responseData = data;
    }).catch(error => {
        throw error;
    });

    // return request listener
    return (request, response, query) => {
        response.setHeader("content-type", "text/html");
        
        // if the file has not been processed yet, send 503 failure response
        if(responseData === undefined) {
            response.statusCode = 503;
            response.end("<h1>503 lol<h1>");
        } else {
            // send content
            response.statusCode = 200;
            response.end(responseData);
        }
    }
}