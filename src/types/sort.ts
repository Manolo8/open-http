import { SortDirection } from './sort-direction';

export type Sort<T = any> = [keyof T, SortDirection][];