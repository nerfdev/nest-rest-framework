export abstract class Transformer<InputT, OutputT> {
  abstract transform(input: InputT): OutputT | Promise<OutputT>;
}
