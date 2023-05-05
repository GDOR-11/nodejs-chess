import {ServerResponse} from "http";
import ejs from "ejs";

export async function sendUnsuccessfulResponse(response: ServerResponse, errorCode: number, shortErrorMessage: string, longErrorMessage: string): Promise<void> {
    let renderedFile = await ejs.renderFile("./client/error.ejs", {errorCode, shortErrorMessage, longErrorMessage});

    response.statusCode = errorCode;
    response.setHeader("content-type", "text/html");
    response.end(renderedFile);
}