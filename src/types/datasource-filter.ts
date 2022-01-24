import { DatasourceInput } from './datasource-input';

export type DatasourceFilter<TInput extends DatasourceInput<TOutput>, TOutput> = Partial<
    Omit<TInput, 'size' | 'page' | 'sort'>
>;
