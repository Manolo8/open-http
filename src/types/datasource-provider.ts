import { IDatasourceInput } from './i-datasource-input';
import { DatasourceOutput } from './datasource-output';
import {HttpRequestOptions} from "./http-request-options";

export type DatasourceProvider<TInput extends IDatasourceInput<TOutput>, TOutput> = (
    input: TInput, options?: HttpRequestOptions
) => Promise<DatasourceOutput<TOutput>> | DatasourceOutput<TOutput>;
