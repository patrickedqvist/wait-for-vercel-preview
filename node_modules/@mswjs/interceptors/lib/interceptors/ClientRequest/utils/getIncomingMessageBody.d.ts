/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare function getIncomingMessageBody(res: IncomingMessage): Promise<string>;
