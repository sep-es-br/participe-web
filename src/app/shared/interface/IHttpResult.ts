export interface IHttpResult<T> {
    success: boolean;
    data: T;
    error: any;
}
