"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const run_1 = require("./run");
const handler = async (event) => {
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
        let metrics = await (0, run_1.run)(argsJSON);
        return {
            statusCode: 200,
            body: JSON.stringify({
                metrics: metrics
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
};
exports.handler = handler;
