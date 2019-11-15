import { RestAction } from '../controllers/rest-action.enum';

export abstract class Transformer<InputT, OutputT> {
  abstract transform(
    input: InputT,
    action?: RestAction,
    request?: any,
  ): OutputT | Promise<OutputT>;
}
