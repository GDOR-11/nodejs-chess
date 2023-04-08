import {IncomingMessage, ServerResponse} from "http";
import {ParsedUrlQuery} from "querystring";

export type RequestListener = (request: IncomingMessage, response: ServerResponse, query: ParsedUrlQuery) => void;