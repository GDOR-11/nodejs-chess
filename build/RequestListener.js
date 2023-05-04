var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs/promises";
import ejs from "ejs";
import mime from "mime-types";
import path from "path";
const extraMimetypes = {
    ".ejs": "text/html"
};
mime.lookup = (() => {
    const mime_lookup = mime.lookup;
    return (filenameOrExt) => {
        var _a;
        let extension = filenameOrExt.slice(filenameOrExt.lastIndexOf("."));
        return (_a = extraMimetypes[extension]) !== null && _a !== void 0 ? _a : mime_lookup(extension);
    };
})();
export function fileRequestListener(filepath, mimeType) {
    // if mime type was not given, look it up
    if (mimeType === undefined) {
        let tmp_mimeType = mime.lookup(filepath);
        if (tmp_mimeType === false) {
            throw Error("unrecognized file extension, please provide a mime type for it.");
        }
        else {
            mimeType = tmp_mimeType;
        }
    }
    // read the file beforehand
    let responseData = undefined;
    fs.readFile(filepath, "utf8").then(data => {
        responseData = data;
    }).catch(error => {
        throw error;
    });
    // return request listener
    return (request, response, query) => {
        // if the file has not been read yet, send 503 failure response
        if (responseData === undefined) {
            response.setHeader("content-type", "text/html");
            response.statusCode = 503;
            response.end("<h1>503 lol<h1>");
        }
        else {
            // send content
            response.setHeader("content-type", mimeType);
            response.statusCode = 200;
            response.end(responseData);
        }
    };
}
export function EJSfileRequestListener(filepath, EJSdata, EJSoptions) {
    // read and process the given file
    let responseData = undefined;
    ejs.renderFile(filepath, EJSdata, EJSoptions).then(data => {
        responseData = data;
    }).catch(error => {
        throw error;
    });
    // return request listener
    return (request, response, query) => {
        response.setHeader("content-type", "text/html");
        // if the file has not been processed yet, send 503 failure response
        if (responseData === undefined) {
            response.statusCode = 503;
            response.end("<h1>503 lol<h1>");
        }
        else {
            // send content
            response.statusCode = 200;
            response.end(responseData);
        }
    };
}
/** returns the paths of all of the files in the given directory */
function readdirRecursive(dirpath) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileapths = [];
        let dirents = yield fs.readdir(dirpath, { withFileTypes: true });
        for (let dirent of dirents) {
            let relativeDirentName = path.relative(".", path.resolve(dirpath, dirent.name));
            if (dirent.isFile()) {
                fileapths.push(relativeDirentName);
            }
            else if (dirent.isDirectory()) {
                let subdirectoryFileapths = yield readdirRecursive(relativeDirentName);
                fileapths.push(...subdirectoryFileapths); // https://jsperf.app/vobiwa
            }
        }
        return fileapths;
    });
}
/** returns the contents of all of the files in the given directory */
function readAllFilesInDirectory(dirpath, includeDirpath = true) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = [];
        let filepaths = yield readdirRecursive(dirpath);
        for (let filepath of filepaths) {
            let filename = filepath;
            if (!includeDirpath) {
                let dirpathLengthError = 0; // if dirpath starts with "./" or ends with "/", use this as a factor to adjust its length
                dirpathLengthError += dirpath.startsWith("./") ? 2 : 0;
                dirpathLengthError += dirpath.endsWith("/") ? 1 : 0;
                filename = filepath.slice(dirpath.length - dirpathLengthError);
            }
            files.push({
                filename,
                filedata: yield fs.readFile(filepath, { encoding: "utf-8" }),
                mimetype: mime.lookup(filepath.slice(filepath.lastIndexOf("."))) || (() => { throw Error("Unknown extension."); })()
            });
        }
        return files;
    });
}
/** processes all the EJS files of the given files, and keeps the rest untouched */
function processAllEJSfiles(files, EJSfiles = [], ignore = []) {
    for (let i = 0; i < files.length; i++) {
        let { filename, filedata } = files[i];
        if ((filename.endsWith(".ejs") || EJSfiles.includes(filename)) && !ignore.includes(filename)) {
            // remove the extension and render the EJS file
            files[i].filename = filename.split(".")[0];
            files[i].filedata = ejs.render(filedata);
        }
    }
}
export function directoryRequestListener(dirpath = "./", baseUrl = "") {
    let requestListeners = {};
    let files = undefined;
    /** stores the requests that have been made while the files have not been read yet */
    let pendingRequests = [];
    readAllFilesInDirectory(dirpath, false).then(_files => {
        processAllEJSfiles(_files);
        files = {};
        for (let file of _files) {
            files[file.filename] = { filedata: file.filedata, mimetype: file.mimetype };
        }
        while (pendingRequests.length > 0) {
            let pendingRequest = pendingRequests[pendingRequests.length - 1];
            requestListener(pendingRequest[0], pendingRequest[1], pendingRequest[2]);
            pendingRequests.length--;
        }
    }).catch(error => {
        throw error;
    });
    let requestListener = (request, response, query) => {
        if (files === undefined)
            throw Error("this function is only supposed to be called after the \"files\" variable has been assigned. find out what the hell is happening.");
        let url = request.url;
        let questionMark = url.indexOf("?");
        let filepath = url.substring(baseUrl.length, questionMark == -1 ? url.length : questionMark);
        let file = files[filepath];
        if (file === undefined) {
            response.statusCode = 404;
            response.setHeader("content-type", "text/html");
            response.end("this page does not exist, stop messing around foolish hooman");
            return;
        }
        response.statusCode = 200;
        response.setHeader("content-type", file.mimetype);
        response.end(file.filedata);
    };
    return (request, response, query) => {
        if (files === undefined) {
            pendingRequests.push([request, response, query]);
        }
        else {
            requestListener(request, response, query);
        }
    };
}
