import {
    APIGatewayProxyEvent,
    APIGatewayProxyResultV2,
    Context as LambdaContext,
} from "aws-lambda";
import { Options } from "./types/options.type";
import { Request } from "./types/request.type";
import { safeParseJson } from "./utils/json.utils";
import { ValidationError } from "./constants/validation-error";
import { requestHandler } from "./request-handler";
import { parseCookies } from "./utils/request.utils";
import { Method } from "./constants/enums";

// TODO handle options
export function createLambda(options: Options = {}) {
    return async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> {
        const body = safeParseJson(event.body ?? "");
        const { path, httpMethod: method, headers, queryStringParameters: query } = event;
        const cookies = parseCookies(headers.cookie || headers.Cookie);
        const response = await requestHandler({
            headers: headers as Record<string, string>,
            query: (query as Record<string, any>) ?? {},
            body: body as Record<string, any>,
            cookies: cookies as Record<string, string>,
            method: method as Method,
            pathname: path,
        });
        return {
            statusCode: response.status,
            headers: response.headers,
            body: JSON.stringify(response.body),
        };
    };
}
