import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { run } from './run'; 

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

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
    await run(argsJSON);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Run completed'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message
      })
    };
  }
}