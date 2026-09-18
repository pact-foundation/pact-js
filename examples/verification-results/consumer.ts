/**
 * Minimal HTTP client shared by both consumers in this example.
 *
 * The three endpoints mirror the reference project
 * (frudisch/pact-beforeeach-desync-repro): GET /one, /two and /three,
 * each answering `{ ok: true }`.
 */
export class DemoClient {
  constructor(private readonly baseUrl: string) {}

  one(): Promise<{ ok: boolean }> {
    return this.get('/one');
  }

  two(): Promise<{ ok: boolean }> {
    return this.get('/two');
  }

  three(): Promise<{ ok: boolean }> {
    return this.get('/three');
  }

  private async get(path: string): Promise<{ ok: boolean }> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`GET ${path} failed with status ${res.status}`);
    }
    return (await res.json()) as { ok: boolean };
  }
}
