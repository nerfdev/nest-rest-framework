import { Hook } from '../hooks';
import { Transformer } from '../transformers';

export interface BaseControllerOptions<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> {
  requestTransformer?: Transformer<RequestDataT, DataT>;
  dataTransformer?: Transformer<DataT, ResponseDataT>;
  authHooks?: Array<Hook<any>>;
  primaryKeyTransformer?: Transformer<string, PrimaryKeyT>;
}
