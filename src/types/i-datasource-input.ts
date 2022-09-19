import { Sort } from './sort';

export interface IDatasourceInput<TOutput = any> {
    size: number;
    page: number;
    sort: Sort<TOutput>;
}
