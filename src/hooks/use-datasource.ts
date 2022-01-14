import { useEffect, useState } from 'react';
import { Datasource } from '../other/datasource';
import { DatasourceInput } from '../types/datasource-input';
import { DatasourceProvider } from '../types/datasource-provider';

export const useDatasource = <TInput extends DatasourceInput<TOutput>, TOutput>(
    provider: DatasourceProvider<TInput, TOutput>,
    configure?: (datasource: Datasource<TInput, TOutput>) => void
): Datasource<TInput, TOutput> => {
    const [value] = useState(() => new Datasource(provider));

    useEffect(() => {
        configure?.(value);

        value.refresh();
    }, [configure, value]);

    return value;
};
