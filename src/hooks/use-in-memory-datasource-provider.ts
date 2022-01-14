import {ISubscriber} from 'open-observable';
import {useState} from 'react';
import {InMemoryDatasourceProvider} from '../other/in-memory-datasource-provider';
import {DatasourceInput} from '../types/datasource-input';
import {DatasourceProvider} from '../types/datasource-provider';

export const useInMemoryDatasourceProvider = <T>(
    initial: T[] | ISubscriber<T[]>
): DatasourceProvider<DatasourceInput<T>, T> => {
    const [provider] = useState(() => new InMemoryDatasourceProvider<DatasourceInput<T>, T>(initial));

    return provider.toProvider();
};
