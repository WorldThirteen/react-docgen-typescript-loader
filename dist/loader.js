"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Import from "react-docgen-typescript" directly when
// https://github.com/styleguidist/react-docgen-typescript/pull/104 is hopefully
// merged in. Will be considering to make a peer dependency as that point.
var parser_js_1 = require("react-docgen-typescript/lib/parser.js");
var validateOptions_1 = __importDefault(require("./validateOptions"));
var generateDocgenCodeBlock_1 = __importDefault(require("./generateDocgenCodeBlock"));
var loader_utils_1 = require("loader-utils");
function loader(source) {
    // Loaders can operate in either synchronous or asynchronous mode. Errors in
    // asynchronous mode should be reported using the supplied callback.
    // Will return a callback if operating in asynchronous mode.
    var callback = this.async();
    try {
        var newSource = processResource(this, source);
        if (!callback)
            return newSource;
        callback(null, newSource);
        return;
    }
    catch (e) {
        if (callback) {
            callback(e);
            return;
        }
        throw e;
    }
}
exports.default = loader;
function processResource(context, source) {
    // Mark the loader as being cacheable since the result should be
    // deterministic.
    context.cacheable(true);
    var options = loader_utils_1.getOptions(context) || {};
    validateOptions_1.default(options);
    options.docgenCollectionName =
        options.docgenCollectionName || "STORYBOOK_REACT_CLASSES";
    if (typeof options.setDisplayName !== "boolean") {
        options.setDisplayName = true;
    }
    // Convert the loader's flat options into the expected structure for
    // react-docgen-typescript.
    // See: node_modules/react-docgen-typescript/lib/parser.d.ts
    var parserOptions = {
        propFilter: options.skipPropsWithName || options.skipPropsWithoutDoc
            ? {
                skipPropsWithName: options.skipPropsWithName || undefined,
                skipPropsWithoutDoc: options.skipPropsWithoutDoc || undefined,
            }
            : options.propFilter,
        componentNameResolver: function (symbol) {
            var declaration = symbol.declarations[0];
            if (declaration) {
                if (typeof declaration.name === "object" &&
                    "escapedText" in declaration.name) {
                    return String(declaration.name.escapedText);
                }
                return String(declaration.name);
            }
            return null;
        },
    };
    // Configure parser using settings provided to loader.
    // See: node_modules/react-docgen-typescript/lib/parser.d.ts
    var parser = parser_js_1.withDefaultConfig(parserOptions);
    if (options.tsconfigPath) {
        parser = parser_js_1.withCustomConfig(options.tsconfigPath, parserOptions);
    }
    else if (options.compilerOptions) {
        parser = parser_js_1.withCompilerOptions(options.compilerOptions, parserOptions);
    }
    var componentDocs = parser.parse(context.resourcePath);
    // Return amended source code if there is docgen information available.
    if (componentDocs.length) {
        return generateDocgenCodeBlock_1.default({
            filename: context.resourcePath,
            source: source,
            componentDocs: componentDocs,
            docgenCollectionName: options.docgenCollectionName,
            setDisplayName: options.setDisplayName,
        });
    }
    // Return unchanged source code if no docgen information was available.
    return source;
}
