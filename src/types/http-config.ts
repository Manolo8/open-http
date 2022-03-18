import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface HttpConfig<Response, SuccessData, ErrorData> {
    axiosConfig?: AxiosRequestConfig;
    responseHandler: (response: AxiosResponse<Response>) => Promise<SuccessData>;
    errorHandler: (input: any, data: ErrorData) => void;
    successHandler: (data: SuccessData) => any;
}
