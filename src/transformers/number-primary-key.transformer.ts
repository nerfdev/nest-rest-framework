import { Transformer } from "./base.transformer";

export class NumberPrimaryKeyTransformer extends Transformer<string, number> {
    transform(pk: string) {
        return parseInt(pk, 10);
    }
}