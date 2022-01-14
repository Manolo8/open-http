import { AxiosRequestConfig } from 'axios';

export type HttpRequestOptions = Pick<AxiosRequestConfig, 'onDownloadProgress' | 'onUploadProgress' | 'cancelToken'>;
