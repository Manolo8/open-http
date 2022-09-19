import { AxiosRequestConfig } from 'axios';

export type HttpRequestOptions = Partial<
    Pick<AxiosRequestConfig, 'onDownloadProgress' | 'onUploadProgress' | 'headers' | 'signal'>
>;
