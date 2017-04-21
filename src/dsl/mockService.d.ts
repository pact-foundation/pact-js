import {Interaction} from './interaction';

export class MockService {
  constructor (consumer: string, provider: string, port?: number, host?: string, ssl?: boolean);
  addInteraction(interaction: Interaction): Promise<string>;
  removeInteractions(): Promise<string>;
  verify(): Promise<string>;
  writePact(): Promise<string>;
}
