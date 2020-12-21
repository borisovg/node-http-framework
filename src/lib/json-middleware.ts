/**
 * Middleware will parse `req.body` as JSON, replacing it with the result.
 * If parsing fails, a 400 response will be returned to the client.
 * It also binds a `res.json()` convenience method to send JSON response to the client.
 * @author George Borisov <git@gir.me.uk>
 * @copyright George Borisov 2018
 * @license LGPL-3.0
 */

import { IncomingMessage, ServerResponse, STATUS_CODES } from 'http';

interface ClientRequestWithBody extends IncomingMessage {
    body?: Buffer;
}

interface JSONClientRequest extends ClientRequestWithBody {
    body: any,
}

interface JSONServerResponse extends ServerResponse {
    json: (data: any) => void;
}

const jsonType = 'application/json';

function json_middleware (req: ClientRequestWithBody, res: ServerResponse, next: () => void) {
    if (req.body && req.headers['content-type'] === jsonType) {
        const req2 = (req as JSONClientRequest);

        try {
            req2.body = JSON.parse((req.body as any ));

        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end(`400 ${STATUS_CODES[400]}\n\n${e.message}`);
        }
    }

    const res2 = (res as JSONServerResponse);
    
    res2.json = function (data) {
        res.setHeader('Content-Type', jsonType);
        res.end(JSON.stringify(data));
    };

    next();
};

export { json_middleware };
