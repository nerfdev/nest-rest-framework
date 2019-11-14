import { Hook } from '../hooks';

export interface BaseControllerOptions<
PrimaryKeyT,
DataT,
RequestDataT,
ResponseDataT
> {
    requestTransformer?: Transformer<RequestDataT, DataT>;
    dataTransformer?: Transformer<DataT, ResponseDataT>;
    authHooks?: Array<Hook<any>>;
}
