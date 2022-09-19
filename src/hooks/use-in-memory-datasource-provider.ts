import {ISubscriber} from 'open-observable';
import {useState} from 'react';
import {InMemoryDatasourceProvider} from '../other/in-memory-datasource-provider';
import {IDatasourceInput} from '../types/i-datasource-input';
import {DatasourceProvider} from '../types/datasource-provider';

export const useInMemoryDatasourceProvider = <T>(
    initial: T[] | ISubscriber<T[]>
): DatasourceProvider<IDatasourceInput<T>, T> => {
    const [provider] = useState(() => new InMemoryDatasourceProvider<IDatasourceInput<T>, T>(initial));

    return provider.toProvider();
};
