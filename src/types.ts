export type FilterValue = string | number | [number, number];
export type FilterMethod = "text" | "between";

export interface Filter<T> {
  id: string;
  value: T;
}
