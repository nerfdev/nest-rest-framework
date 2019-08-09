import { RestControllerOptions } from './rest-controller-options';
import { Get, Param, Post, Body, Put, Patch, Delete, Query } from '@nestjs/common';
import { BatchUpdate } from '../viewsets/base.viewsets';
import { ViewSetQuery } from '../viewsets/viewset-query';

export abstract class RestController<
  PrimaryKeyT,
  DataT,
  RequestDataT,
  ResponseDataT
> {
  get viewset() {
    return this.options.viewset;
  }

  get requestTransformer() {
    return this.options.requestTransformer;
  }

  get dataTransformer() {
    return this.options.dataTransformer;
  }

  constructor(
    protected readonly options: RestControllerOptions<
      PrimaryKeyT,
      DataT,
      RequestDataT,
      ResponseDataT
    >,
  ) {}

  @Get('')
  async get(@Query() query: ViewSetQuery) {
    return await this.viewset.list(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: PrimaryKeyT) {
    return await this.viewset.retrieve(id);
  }

  @Post()
  async post(@Body() request: RequestDataT) {
    const dataToSave = await Promise.resolve(this.requestTransformer.transform(request));
    const data = await this.viewset.create(dataToSave);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data));
    return dataToReturn;
  }

  @Put(':id')
  async put(@Param('id') id: PrimaryKeyT, @Body() request: RequestDataT) {
    const dataToSave = await Promise.resolve(this.requestTransformer.transform(request));
    const data = await this.viewset.replace(id, dataToSave);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data));
    return dataToReturn;
  }

  @Patch(':id')
  async patch(@Param('id') id: PrimaryKeyT, @Body() request: RequestDataT) {
    const dataToSave = await Promise.resolve(this.requestTransformer.transform(request));
    const data = await this.viewset.modify(id, dataToSave);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data));
    return dataToReturn;
  }

  @Delete(':id')
  async delete(@Param('id') id: PrimaryKeyT) {
    await Promise.resolve(this.viewset.destroy(id));
  }

  @Get('batch')
  async batchGet(@Query('ids') ids: string) {
    const pks = ids.split(',') as any as PrimaryKeyT[];
    return await this.viewset.batchRetrieve(pks);
  }

  @Post('batch')
  async batchPost(@Body() request: RequestDataT[]) {
    const dataToSave = await Promise.all(request.map(r => {
        return Promise.resolve(this.requestTransformer.transform(r));
    }));
    const data = await this.viewset.batchCreate(dataToSave);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d));
    }));
    return dataToReturn;
  }

  @Put('batch')
  async batchPut(@Body() request: BatchUpdate<PrimaryKeyT, RequestDataT>) {
    const dataToSave: BatchUpdate<PrimaryKeyT, DataT> = await Promise.all(request.map(async r => {
        return {
            pk: r.pk,
            data: await Promise.resolve(this.requestTransformer.transform(r.data)),
        };
    }));
    const data = await this.viewset.batchReplace(dataToSave);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d));
    }));
    return dataToReturn;
  }

  @Patch('batch')
  async batchPatch(@Body() request: BatchUpdate<PrimaryKeyT, RequestDataT>) {
    const dataToSave: BatchUpdate<PrimaryKeyT, DataT> = await Promise.all(request.map(async r => {
        return {
            pk: r.pk,
            data: await Promise.resolve(this.requestTransformer.transform(r.data)),
        };
    }));
    const data = await this.viewset.batchModify(dataToSave);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d));
    }));
    return dataToReturn;
  }

  @Delete('batch')
  async batchDelete(@Query('ids') ids: string) {
    const pks = ids.split(',') as any as PrimaryKeyT[];
    await this.viewset.batchDestroy(pks);
  }
}
