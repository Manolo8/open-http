import { Configurator, IConfigurator } from 'open-observable';
import { useEffect, useMemo, useRef } from 'react';
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

    // Holds the latest `configure` without making it an effect dependency, so an inline
    // arrow function does not retrigger reset/reconfigure/refresh on every render.
    const configureRef = useRef(configure);
    configureRef.current = configure;

    useEffect(() => {
        configureRef.current?.(configurator);

        datasource.refresh();

        // Runs on unmount and whenever `provider` yields a new instance, so the replaced
        // datasource is always aborted and cleared instead of being abandoned.
        return () => {
            configurator.reset();
            datasource.destroy();
        };
    }, [configurator, datasource]);

    return datasource;
};
