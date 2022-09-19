import { IDatasourceInput } from './i-datasource-input';

export type DatasourceFilter<TInput extends IDatasourceInput<TOutput>, TOutput> = Partial<
    Omit<TInput, 'size' | 'page' | 'sort'>
>;
