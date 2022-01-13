/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class StrictEventEmitter<EventsMap extends Record<string | symbol, any>> extends EventEmitter {
    constructor();
    on<K extends keyof EventsMap>(event: K, listener: EventsMap[K]): this;
    once<K extends keyof EventsMap>(event: K, listener: EventsMap[K]): this;
    off<K extends keyof EventsMap>(event: K, listener: EventsMap[K]): this;
    emit<K extends keyof EventsMap>(event: K, ...data: Parameters<EventsMap[K]>): boolean;
    addListener<K extends keyof EventsMap>(event: K, listener: EventsMap[K]): this;
    removeListener<K extends keyof EventsMap>(event: K, listener: EventsMap[K]): this;
}
