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
    const data = await this.viewset.list(query);
    const dataToReturn = await Promise.all(data.map(d => {
        return Promise.resolve(this.dataTransformer.transform(d, RestAction.BatchGet));
    }));
    return dataToReturn;
  }

  @Get(':id')
  async getOne(@Param('id') id: PrimaryKeyT, @Req() request) {
    await this.runAuthHooks(request);
    const data = await this.viewset.retrieve(id);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data, RestAction.GetOne));
    return dataToReturn;
  }

  @Post()
  async post(@Body() update: RequestDataT, @Req() request) {
    await this.runAuthHooks(request);
    const dataToSave = await Promise.resolve(this.requestTransformer.transform(update, RestAction.Post, request));
    const data = await this.viewset.create(dataToSave);
    await this.runSaveHooks(dataToSave);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data, RestAction.Post));
    return dataToReturn;
  }

  @Put(':id')
  async put(@Param('id') id: PrimaryKeyT, @Body() update: RequestDataT, @Req() request) {
    await this.runAuthHooks(request);
    const dataToSave = await Promise.resolve(this.requestTransformer.transform(update, RestAction.Put, request));
    const data = await this.viewset.replace(id, dataToSave);
    await this.runSaveHooks(dataToSave);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data, RestAction.Put));
    return dataToReturn;
  }

  @Patch(':id')
  async patch(@Param('id') id: PrimaryKeyT, @Body() update: RequestDataT, @Req() request) {
    await this.runAuthHooks(request);
    const dataToSave = await Promise.resolve(this.requestTransformer.transform(update, RestAction.Patch, request));
    const data = await this.viewset.modify(id, dataToSave);
    await this.runSaveHooks(dataToSave);
    const dataToReturn = await Promise.resolve(this.dataTransformer.transform(data, RestAction.Patch));
    return dataToReturn;
  }

  @Delete(':id')
  async delete(@Param('id') id: PrimaryKeyT, @Req() request) {
    await this.runAuthHooks(request);
    await Promise.resolve(this.viewset.destroy(id));
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
