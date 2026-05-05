import axios, { type AxiosResponse } from 'axios';

/** A product returned by the Product API. */
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  createdAt: string;
  tags: string[];
}

/** A catalog entry — a map of product codes to price summaries. */
export interface Catalog {
  [productCode: string]: { name: string; price: number };
}

/**
 * HTTP client for the Product API.
 *
 * Used in the matchers example to show how different matcher types handle
 * different field types. The provider test (provider.ts) returns slightly
 * different values than the consumer's examples — demonstrating that the
 * contract cares about structure and types, not specific values.
 */
export class ProductApiClient {
  constructor(private readonly baseUrl: string) {}

  async getProduct(id: number): Promise<Product> {
    const { data }: AxiosResponse<Product> = await axios.get(
      `${this.baseUrl}/products/${id}`,
      { headers: { Accept: 'application/json' } },
    );
    return data;
  }

  async getProducts(): Promise<Product[]> {
    const { data }: AxiosResponse<Product[]> = await axios.get(
      `${this.baseUrl}/products`,
      { headers: { Accept: 'application/json' } },
    );
    return data;
  }

  async getCatalog(): Promise<Catalog> {
    const { data }: AxiosResponse<Catalog> = await axios.get(
      `${this.baseUrl}/catalog`,
      { headers: { Accept: 'application/json' } },
    );
    return data;
  }
}
