/// <reference types="node" />
import { EventEmitter } from 'stream';
/**
 * Pipes all emitted events from one emitter to another.
 */
export declare function pipeEvents(source: EventEmitter, destination: EventEmitter): void;
