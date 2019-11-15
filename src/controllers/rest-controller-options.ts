import { ViewSet } from '../viewsets';
import { BaseControllerOptions } from './base-controller-options';
import { Hook } from '../hooks';

export interface RestControllerOptions<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
>
  extends BaseControllerOptions<
    PrimaryKeyT,
    DataT,
    RequestDataT,
    ResponseDataT
  > {
  viewset: ViewSet<PrimaryKeyT, DataT>;
  saveHooks?: Array<Hook<DataT>>;
}
