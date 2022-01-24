import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface HttpConfig {
    axiosConfig?: AxiosRequestConfig;
    errorHandler?: (input: any, error: any) => void;
    successHandler?: (response: AxiosResponse) => any;
}
