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
export function fileRequestListener(filepath, mimeType, EJS = filepath.endsWith(".ejs")) {
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
    /** stores the requests that have been made while the file has not been read yet */
    let pendingRequests = [];
    /** undefined if the file has not been read yet, a string otherwise */
    let filedata = undefined;
    // read the file beforehand
    fs.readFile(filepath, "utf8").then(data => {
        filedata = data;
        // respond to the pending requests
        while (pendingRequests.length > 0) {
            let pendingRequest = pendingRequests[pendingRequests.length - 1];
            requestListener(pendingRequest[0], pendingRequest[1]);
            pendingRequests.length--;
        }
    }).catch(error => {
        throw error;
    });
    let requestListener = (request, response) => {
        // send content
        response.setHeader("content-type", mimeType);
        response.statusCode = 200;
        response.end(filedata);
    };
    return (request, response) => {
        if (filedata === undefined) {
            // if the file has not been read yet, push this request to the pending requests so it can be resolved later
            pendingRequests.push([request, response]);
        }
        else {
            // otherwise, just resolve the request
            requestListener(request, response);
        }
    };
}
export function EJSfileRequestListener(filepath, EJSdata, EJSoptions) {
    /** stores the requests that have been made while the file has not been read yet */
    let pendingRequests = [];
    // read and process the given file beforehand
    let filedata = undefined;
    ejs.renderFile(filepath, EJSdata, EJSoptions).then(data => {
        filedata = data;
        // respond to the pending requests
        while (pendingRequests.length > 0) {
            let pendingRequest = pendingRequests[pendingRequests.length - 1];
            requestListener(pendingRequest[0], pendingRequest[1]);
            pendingRequests.length--;
        }
    }).catch(error => {
        throw error;
    });
    let requestListener = (request, response) => {
        // send content
        response.statusCode = 200;
        response.setHeader("content-type", "text/html");
        response.end(filedata);
    };
    return (request, response) => {
        if (filedata === undefined) {
            // if the file has not been read yet, push this request to the pending requests so it can be resolved later
            pendingRequests.push([request, response]);
        }
        else {
            // otherwise, just resolve the request
            requestListener(request, response);
        }
    };
}
/**
 * returns the paths of all of the files in the given directory. Basically fs.readdir, but recursive.
 * @param dirpath the directory to read the files from
 * @returns an array with the names of all the files of the folder
 */
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
/**
 * returns the contents of all of the files in the given directory
 * @param dirpath the directory to read
 * @param includeDirpath wether the path to the directory should be included ot not in the filenames
 * @returns all the files of the directory
 */
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
/**
 * renders all the EJS files of the given files, and keeps the rest untouched
 * @param files the files to process
 * @param render the files that should be rendered no matter their extension (.ejs or not)
 * @param ignore the files that should not be rendered no matter their extension (.ejs or not)
 */
function renderAllEJSfiles(files, render = [], ignore = []) {
    for (let i = 0; i < files.length; i++) {
        let { filename, filedata } = files[i];
        if (filename.endsWith(".ejs")) {
            // remove the extension and render the EJS file
            files[i].filename = filename.split(".")[0];
            files[i].filedata = ejs.render(filedata);
        }
    }
}
/**
 * sets up a listener for a directory in your file hierarchy
 * @param dirpath the path to the directory to read from
 * @param baseUrl the base url (e.g. a base url "/users" means that the request with URL "/users/bots/noobmaster69/script.js" would access the file "/bots/noobmaster69/script.js", relative to dirpath)
 * @param renderEJSfiles wether EJS files should be automatically rendered or not
 * @returns the request listener
 */
export function directoryRequestListener(dirpath = "./", baseUrl = "", renderEJSfiles = true) {
    /** undefined if the files have not been read yet. An object of the files otherwise */
    let files = undefined;
    /** stores the requests that have been made while the files have not been read yet */
    let pendingRequests = [];
    // read the files beforehand
    readAllFilesInDirectory(dirpath, false).then(_files => {
        if (renderEJSfiles) {
            renderAllEJSfiles(_files);
        }
        files = {};
        for (let file of _files) {
            files[file.filename] = { filedata: file.filedata, mimetype: file.mimetype };
        }
        // respond to the pending requests
        while (pendingRequests.length > 0) {
            let pendingRequest = pendingRequests[pendingRequests.length - 1];
            requestListener(pendingRequest[0], pendingRequest[1]);
            pendingRequests.length--;
        }
    }).catch(error => {
        throw error;
    });
    let requestListener = (request, response) => {
        if (files === undefined)
            throw Error("this function is only supposed to be called after the \"files\" variable has been assigned. find out what the hell is happening.");
        let url = request.url;
        let questionMarkIdx = url.indexOf("?");
        let filepath = url.substring(baseUrl.length, questionMarkIdx == -1 ? url.length : questionMarkIdx);
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
    return (request, response) => {
        if (files === undefined) {
            // if the file has not been read yet, push this request to the pending requests so it can be resolved later
            pendingRequests.push([request, response]);
        }
        else {
            // otherwise, just resolve the request
            requestListener(request, response);
        }
    };
}
