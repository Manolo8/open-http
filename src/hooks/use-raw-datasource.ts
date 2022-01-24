import { useEffect, useState } from 'react';
import { Datasource } from '../other/datasource';
import { DatasourceInput } from '../types/datasource-input';
import { DatasourceProvider } from '../types/datasource-provider';
import { Configurator, IConfigurator } from 'open-observable';

export const useRawDatasource = <TInput extends DatasourceInput<TOutput>, TOutput>(
    provider: DatasourceProvider<TInput, TOutput>,
    configure?: (configurator: IConfigurator<Datasource<TInput, TOutput>>) => void
): Datasource<TInput, TOutput> => {
    const [{ datasource, configurator }] = useState(() => {
        const datasource = new Datasource(provider);
        const configurator = new Configurator(datasource);
        return { datasource, configurator };
    });

    useEffect(() => {
        configure?.(configurator);

        datasource.refresh();

        return () => configurator.reset();
    }, [configurator, configure, datasource]);

    return datasource;
};
