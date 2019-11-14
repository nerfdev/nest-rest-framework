import { ViewSetBatch } from '../viewsets';
import { BaseControllerOptions } from './base-controller-options';
import { Hook} from '../hooks';

export interface RestBatchControllerOptions<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> extends BaseControllerOptions<
PrimaryKeyT,
DataT,
RequestDataT,
ResponseDataT> {
  viewset: ViewSetBatch<PrimaryKeyT, DataT>;
  batchSaveHooks?: Array<Hook<DataT[]>>;
}
