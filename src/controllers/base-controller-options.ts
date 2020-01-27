import { Hook } from '../hooks';
import { Transformer } from '../transformers';

export interface BaseControllerOptions<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> {
  authHooks?: Array<Hook<any>>;
  requestTransformer?: Transformer<RequestDataT, DataT>;
  businessLogicSaveTransformers?: Array<Transformer<DataT, DataT>>;
  primaryKeyTransformer?: Transformer<string, PrimaryKeyT>;
  saveHooks?: Array<Hook<any>>;
  responseTransformer?: Transformer<DataT, ResponseDataT>;
}
