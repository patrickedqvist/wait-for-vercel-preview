/// <reference types="node" />
import { ClientRequest, OutgoingHttpHeaders } from 'http';
export declare function inheritRequestHeaders(req: ClientRequest, headers: OutgoingHttpHeaders | undefined): void;
