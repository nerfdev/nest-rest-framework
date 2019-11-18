import { Hook } from './base.hook';

interface Person {
  name: string;
}

class TestHook extends Hook<Person> {
  async execute(data: Person): Promise<void> {
    await this.sendToEther(data);
  }

  private async sendToEther(data: Person) {
    const promise = Promise.resolve(data);
    const response = await promise;
  }
}

describe('TestHook', () => {
  let testHook: TestHook;

  beforeEach(() => {
    testHook = new TestHook();
  });

  it('should execute', async () => {
    await testHook.execute({ name: 'John Smith' });
  });
});
