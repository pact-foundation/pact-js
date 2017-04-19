export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export class Request {
  constructor ();
  send (method: HTTPMethod, url: string, body: string): Promise<string>;
}
