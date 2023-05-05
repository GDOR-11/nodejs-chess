import {IncomingMessage, ServerResponse} from "http";
import {ParsedUrlQuery} from "querystring";
import {RequestListener} from "http";

import fs from "fs/promises";
import ejs from "ejs";
import mime from "mime-types";
import path from "path";

const extraMimetypes: {[ext: string]: string} = {
    ".ejs": "text/html"
};
mime.lookup = (() => {
    const mime_lookup = mime.lookup;
    return (filenameOrExt: string): string | false => {
        let extension = filenameOrExt.slice(filenameOrExt.lastIndexOf("."));
        return extraMimetypes[extension] ?? mime_lookup(extension);
    };
})();

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
    return (request, response) => {
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
    return (request, response) => {
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

/**
 * returns the paths of all of the files in the given directory. Basically fs.readdir, but recursive.
 * @param dirpath the directory to read the files from
 * @returns an array with the names of all the files of the folder
 */
async function readdirRecursive(dirpath: string): Promise<string[]> {
    let fileapths: string[] = [];
    let dirents = await fs.readdir(dirpath, {withFileTypes: true})
    for(let dirent of dirents) {
        let relativeDirentName = path.relative(".", path.resolve(dirpath, dirent.name));
        if(dirent.isFile()) {
            fileapths.push(relativeDirentName);
        } else if(dirent.isDirectory()) {
            let subdirectoryFileapths = await readdirRecursive(relativeDirentName);
            fileapths.push(...subdirectoryFileapths); // https://jsperf.app/vobiwa
        }
    }
    return fileapths;
}


/**
 * returns the contents of all of the files in the given directory
 * @param dirpath the directory to read
 * @param includeDirpath wether the path to the directory should be included ot not in the filenames
 * @returns all the files of the directory
 */
async function readAllFilesInDirectory(dirpath: string, includeDirpath: boolean = true): Promise<{filename: string, filedata: string, mimetype: string}[]> {
    let files: {filename: string, filedata: string, mimetype: string}[] = [];
    let filepaths = await readdirRecursive(dirpath);
    for(let filepath of filepaths) {
        let filename = filepath;
        if(!includeDirpath) {
            let dirpathLengthError = 0; // if dirpath starts with "./" or ends with "/", use this as a factor to adjust its length
            dirpathLengthError += dirpath.startsWith("./") ? 2 : 0;
            dirpathLengthError += dirpath.endsWith("/") ? 1 : 0;
            filename = filepath.slice(dirpath.length - dirpathLengthError);
        }
        files.push({
            filename,
            filedata: await fs.readFile(filepath, {encoding: "utf-8"}),
            mimetype: mime.lookup(filepath.slice(filepath.lastIndexOf("."))) || (() => { throw Error("Unknown extension."); })()
        });
    }
    return files;
}

/**
 * renders all the EJS files of the given files, and keeps the rest untouched
 * @param files the files to process
 * @param render the files that should be rendered no matter their extension (.ejs or not)
 * @param ignore the files that should not be rendered no matter their extension (.ejs or not)
 */
function renderAllEJSfiles(files: {filename: string, filedata: string}[], render: string[] = [], ignore: string[] = []) {
    for(let i = 0;i < files.length;i++) {
        let {filename, filedata} = files[i];
        if(filename.endsWith(".ejs")) {
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
export function directoryRequestListener(dirpath: string = "./", baseUrl: string = "", renderEJSfiles: boolean = true): RequestListener {
    let requestListeners = {};
    let files: undefined | {[filename: string]: {filedata: string, mimetype: string}} = undefined;

    /** stores the requests that have been made while the files have not been read yet */
    let pendingRequests: [IncomingMessage, ServerResponse][] = [];

    readAllFilesInDirectory(dirpath, false).then(_files => {
        if(renderEJSfiles) {
            renderAllEJSfiles(_files);
        }

        files = {};
        for(let file of _files) {
            files[file.filename] = {filedata: file.filedata, mimetype: file.mimetype};
        }

        while(pendingRequests.length > 0) {
            let pendingRequest = pendingRequests[pendingRequests.length - 1];
            requestListener(pendingRequest[0], pendingRequest[1]);
            pendingRequests.length--;
        }
    }).catch(error => {
        throw error;
    });

    let requestListener: RequestListener = (request, response) => {
        if(files === undefined) throw Error("this function is only supposed to be called after the \"files\" variable has been assigned. find out what the hell is happening.");

        let url = request.url as string;
        let questionMarkIdx = url.indexOf("?");
        let filepath = url.substring(baseUrl.length, questionMarkIdx == -1 ? url.length : questionMarkIdx);
        let file = files[filepath];

        if(file === undefined) {
            response.statusCode = 404;
            response.setHeader("content-type", "text/html");
            response.end("this page does not exist, stop messing around foolish hooman");
            return;
        }

        response.statusCode = 200;
        response.setHeader("content-type", file.mimetype);
        response.end(file.filedata);
    }

    return (request, response) => {
        if(files === undefined) {
            pendingRequests.push([request, response]);
        } else {
            requestListener(request, response);
        }
    };
}