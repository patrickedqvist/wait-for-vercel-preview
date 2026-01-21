import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

// This configures a request mocking server with the given request handlers.
export const server = setupServer();

export { http, HttpResponse };
