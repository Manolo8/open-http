import { DatasourceInput } from './datasource-input';
import { DatasourceOutput } from './datasource-output';

export type DatasourceProvider<TInput extends DatasourceInput<TOutput>, TOutput> = (
    input: TInput
) => Promise<DatasourceOutput<TOutput>> | DatasourceOutput<TOutput>;
