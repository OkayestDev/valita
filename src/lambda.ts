import {
    APIGatewayProxyEvent,
    APIGatewayProxyResultV2,
    Context as LambdaContext,
} from "aws-lambda";
import { Options } from "./types/options.type";
import { requestHandler } from "./handlers/request.handler";
import { parseCookies } from "./utils/request.utils";
import { Method } from "./constants/enums";
import { configureLogger } from "./handlers/logger.handler";
import { configureErrorHandler, errorHandler } from "./handlers/error.handler";
import { sendLambdaResponse } from "./utils/response.utils";
import { setLoggerOptions } from "./utils/logger.utils";
import { configureOptionsHandler } from "./handlers/options.handler";
import {
    contentTypeFromHeaders,
    DEFAULT_MAX_BODY_BYTES,
    parseIncomingBody,
} from "./utils/body.utils";

export function createLambda(options: Options = {}) {
    configureErrorHandler(options);
    configureLogger(options);
    setLoggerOptions(options);
    configureOptionsHandler(options);
    const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
    return async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> {
        try {
            const raw = lambdaRawBody(event);
            const { path, httpMethod: method, headers, queryStringParameters: query } = event;
            const { body, files } = parseIncomingBody(
                raw,
                contentTypeFromHeaders(headers),
                maxBodyBytes,
            );
            const cookies = parseCookies(headers.cookie || headers.Cookie);
            const response = await requestHandler({
                headers: headers as Record<string, string>,
                query: (query as Record<string, any>) ?? {},
                body,
                files,
                cookies: cookies as Record<string, string>,
                method: method as Method,
                pathname: path,
            });
            return sendLambdaResponse(response);
        } catch (err: any) {
            return sendLambdaResponse(errorHandler(err));
        }
    };
}

function lambdaRawBody(event: APIGatewayProxyEvent): Buffer | undefined {
    if (!event.body) {
        return undefined;
    }
    if (event.isBase64Encoded) {
        return Buffer.from(event.body, "base64");
    }
    return Buffer.from(event.body);
}
