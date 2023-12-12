"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const run_1 = require("./run");
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    // Get arguments from event
    const args = event.body;
    let argsJSON;
    try {
        if (!args || (argsJSON = JSON.parse(args)).length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'No arguments provided'
                })
            };
        }
        // Call run.ts passing arguments
        yield (0, run_1.run)(argsJSON);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Run completed'
            })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: error.message
            })
        };
    }
});
exports.handler = handler;
