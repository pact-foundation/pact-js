export type AnyJson =
  | boolean
  | number
  | string
  | null
  | JsonArray
  | JsonMap
  | Date;
export interface JsonMap {
  [key: string]: AnyJson;
}
export type JsonArray = Array<AnyJson>;
