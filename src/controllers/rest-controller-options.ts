import { ViewSet } from '../viewsets/base.viewsets';
import { Transformer } from '../transformers/base.transformer';

export interface RestControllerOptions<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> {
  viewset: ViewSet<PrimaryKeyT, DataT>;
  requestTransformer?: Transformer<RequestDataT, DataT>;
  dataTransformer?: Transformer<DataT, ResponseDataT>;
  enableBatch?: boolean;
}
