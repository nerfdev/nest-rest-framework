import { RestControllerOptions } from './rest-controller-options';
import { Get, Param, Post, Body, Put, Patch, Delete, Query, Req } from '@nestjs/common';
import { ViewSetQuery } from '../viewsets/viewset-query';
import { RestAction } from './rest-action.enum';

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
  async get(@Query() query: ViewSetQuery, @Req() request) {
    await this.runAuthHooks(request);

    const data = await this.viewset.query(query);

    return await Promise.all(data.map(d => this.transformData(d, RestAction.Get)));
  }

  @Get(':id')
  async getOne(@Param('id') id: PrimaryKeyT, @Req() request) {
    await this.runAuthHooks(request);

    const data = await this.viewset.retrieve(id);

    return await this.transformData(data, RestAction.GetOne);
  }

  @Post()
  async post(@Body() update: RequestDataT, @Req() request) {
    await this.runAuthHooks(request);

    const dataToSave = await this.transformRequest(update, RestAction.Post, request);

    const data = await this.viewset.create(dataToSave);

    await this.runSaveHooks(dataToSave);

    return await this.transformData(data, RestAction.Post);
  }

  @Put(':id')
  async put(@Param('id') id: PrimaryKeyT, @Body() update: RequestDataT, @Req() request) {
    await this.runAuthHooks(request);

    const dataToSave = await this.transformRequest(update, RestAction.Put, request);

    const data = await this.viewset.replace(id, dataToSave);

    await this.runSaveHooks(dataToSave);
    
    return await this.transformData(data, RestAction.Put);
  }

  @Patch(':id')
  async patch(@Param('id') id: PrimaryKeyT, @Body() update: RequestDataT, @Req() request) {
    await this.runAuthHooks(request);

    const dataToSave = await this.transformRequest(update, RestAction.Patch, request);

    const data = await this.viewset.modify(id, dataToSave);

    await this.runSaveHooks(dataToSave);

    return await this.transformData(data, RestAction.Patch);
  }

  @Delete(':id')
  async delete(@Param('id') id: PrimaryKeyT, @Req() request) {
    await this.runAuthHooks(request);
    await Promise.resolve(this.viewset.destroy(id));
  }

  private async transformRequest(input: RequestDataT, action?: RestAction, request?: any) {
    if (!this.requestTransformer) {
      // if there is no request transformer, assume the data type is the same as the request type.
      return input as any as DataT;
    }

    return await Promise.resolve(this.requestTransformer.transform(input, action, request));
  }

  private async transformData(input: DataT, action?: RestAction, request?: any) {
    if (!this.dataTransformer) {
      // if there is no data transformer, assume the data type is the same as the request type.
      return input as any as ResponseDataT;
    }

    return await Promise.resolve(this.dataTransformer.transform(input, action, request));
  }

  private async runAuthHooks(request) {
    const hookPromises = (this.options.authHooks || []).map(hook => Promise.resolve(hook.execute(request)));
    await Promise.all(hookPromises);
  }

  private async runSaveHooks(data: DataT) {
    const hookPromises = (this.options.saveHooks || []).map(hook => Promise.resolve(hook.execute(data)));
    await Promise.all(hookPromises);
  }
}
