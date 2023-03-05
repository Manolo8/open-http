import { Configurator, IConfigurator } from 'open-observable';
import { useEffect, useMemo } from 'react';
import { Datasource } from '../other/datasource';
import { DatasourceProvider } from '../types/datasource-provider';
import { IDatasource } from '../types/i-datasource';
import { IDatasourceInput } from '../types/i-datasource-input';

export const useRawDatasource = <TInput extends IDatasourceInput<TOutput>, TOutput>(
    provider: DatasourceProvider<TInput, TOutput>,
    configure?: (configurator: IConfigurator<Datasource<TInput, TOutput>>) => void
): IDatasource<TInput, TOutput> => {
    const { datasource, configurator } = useMemo(() => {
        const datasource = new Datasource(provider);
        const configurator = new Configurator(datasource);
        return { datasource, configurator };
    }, [provider]);

    useEffect(() => {
        configure?.(configurator);

        if (configurator.isCalled() || !configure) datasource.refresh();

        return () => configurator.reset();
    }, [configurator, configure, datasource]);

    useEffect(() => () => datasource.destroy(), [datasource]);

    return datasource;
};
