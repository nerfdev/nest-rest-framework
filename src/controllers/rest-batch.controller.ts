import { RestBatchControllerOptions } from './rest-batch-controller-options';
import {
  Get,
  Post,
  Body,
  Put,
  Patch,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { RestAction } from './rest-action.enum';
import { BatchUpdate } from '../viewsets';
import { BaseController } from './base-controller';
import { flatMap } from 'lodash';

export abstract class RestBatchController<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> extends BaseController<PrimaryKeyT, DataT, RequestDataT, ResponseDataT> {
  get viewset() {
    return this.options.viewset;
  }

  constructor(
    protected readonly options: RestBatchControllerOptions<
      PrimaryKeyT,
      DataT,
      RequestDataT,
      ResponseDataT
    >,
  ) {
    super(options);
  }

  @Get('')
  async batchGet(@Query('ids') ids: string, @Req() request) {
    await this.runAuthHooks(request);
    const pks = ids.split(',');
    const pksTransformed = await Promise.all(
      pks.map(pk => this.transformPrimaryKey(pk)),
    );
    const data = await this.viewset.batchRetrieve(pksTransformed);
    const dataToReturn = await Promise.all(
      data.map(d => {
        return Promise.resolve(this.transformResponse(d, RestAction.BatchGet));
      }),
    );
    return dataToReturn;
  }

  @Post('')
  async batchPost(@Body() creates: RequestDataT[], @Req() request) {
    await this.runAuthHooks(request);
    const dataPreBusinessLogic = await Promise.all(
      creates.map(r => {
        return Promise.resolve(
          this.transformRequest(r, RestAction.BatchPost, request),
        );
      }),
    );
    const dataToSave = await Promise.all(
      dataPreBusinessLogic.map(obj => this.transformBusinessLogicSave(obj)),
    );
    const data = await this.viewset.batchCreate(dataToSave);
    await this.runAllSaveHooks(dataToSave);
    const dataToReturn = await Promise.all(
      data.map(d => {
        return Promise.resolve(this.transformResponse(d, RestAction.BatchPost));
      }),
    );
    return dataToReturn;
  }

  @Put('')
  async batchPut(
    @Body() updates: BatchUpdate<PrimaryKeyT, RequestDataT>,
    @Req() request,
  ) {
    await this.runAuthHooks(request);
    const dataPreBusinessLogic: BatchUpdate<
      PrimaryKeyT,
      DataT
    > = await Promise.all(
      updates.map(async r => {
        return {
          pk: r.pk,
          data: await Promise.resolve(
            this.transformRequest(r.data, RestAction.BatchPut, request),
          ),
        };
      }),
    );
    const dataToSave = await Promise.all(
      dataPreBusinessLogic.map(async obj => ({
        pk: obj.pk,
        data: await this.transformBusinessLogicSave(obj.data),
      })),
    );
    const data = await this.viewset.batchReplace(dataToSave);
    await this.runAllSaveHooks(dataToSave.map(x => x.data));
    const dataToReturn = await Promise.all(
      data.map(d => {
        return Promise.resolve(this.transformResponse(d, RestAction.BatchPut));
      }),
    );
    return dataToReturn;
  }

  @Patch('')
  async batchPatch(
    @Body() updates: BatchUpdate<PrimaryKeyT, RequestDataT>,
    @Req() request,
  ) {
    await this.runAuthHooks(request);
    const dataPreBusinessLogic: BatchUpdate<
      PrimaryKeyT,
      DataT
    > = await Promise.all(
      updates.map(async r => {
        return {
          pk: r.pk,
          data: await Promise.resolve(
            this.transformRequest(r.data, RestAction.BatchPatch, request),
          ),
        };
      }),
    );
    const dataToSave = await Promise.all(
      dataPreBusinessLogic.map(async obj => ({
        pk: obj.pk,
        data: await this.transformBusinessLogicSave(obj.data),
      })),
    );
    const data = await this.viewset.batchModify(dataToSave);
    await this.runAllSaveHooks(dataToSave.map(x => x.data));
    const dataToReturn = await Promise.all(
      data.map(d => {
        return Promise.resolve(
          this.transformResponse(d, RestAction.BatchPatch),
        );
      }),
    );
    return dataToReturn;
  }

  @Delete('')
  async batchDelete(@Query('ids') ids: string, @Req() request) {
    await this.runAuthHooks(request);
    const pks = ids.split(',');
    const pksTransformed = await Promise.all(
      pks.map(pk => this.transformPrimaryKey(pk)),
    );
    await this.viewset.batchDestroy(pksTransformed);
  }

  async runAllSaveHooks(data: DataT[]) {
    const batchHookPromises = (this.options.batchSaveHooks || []).map(hook =>
      Promise.resolve(hook.execute(data)),
    );
    const individualPromises = flatMap(
      (this.options.saveHooks || []).map(hook =>
        data.map(obj => Promise.resolve(hook.execute(obj))),
      ),
    );
    const allPromises = [...batchHookPromises, ...individualPromises];
    await Promise.all(allPromises);
  }
}
