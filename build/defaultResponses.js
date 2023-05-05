var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ejs from "ejs";
export function sendUnsuccessfulResponse(response, errorCode, shortErrorMessage, longErrorMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        let renderedFile = yield ejs.renderFile("./client/error.ejs", { errorCode, shortErrorMessage, longErrorMessage });
        response.statusCode = errorCode;
        response.setHeader("content-type", "text/html");
        response.end(renderedFile);
    });
}
