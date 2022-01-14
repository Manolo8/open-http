import { Sort } from './sort';

export type DatasourceInput<TOutput = any> = {
    size: number;
    page: number;
    sort: Sort<TOutput>;
};
