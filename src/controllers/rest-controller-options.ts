import { ViewSet } from '../viewsets/base.viewsets';
import { Transformer } from '../transformers/base.transformer';
import { Hook } from '../hooks';

export interface RestControllerOptions<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> {
  viewset: ViewSet<PrimaryKeyT, DataT>;
  requestTransformer?: Transformer<RequestDataT, DataT>;
  dataTransformer?: Transformer<DataT, ResponseDataT>;
  saveHooks?: Hook<DataT>[];
  batchSaveHooks?: Hook<DataT[]>[];
  authHooks?: Hook<any>[];
}
