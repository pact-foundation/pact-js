import { Test } from '@nestjs/testing';
import { PactVerifierService } from 'nestjs-pact';
import { INestApplication, Logger, LoggerService } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AppRepository } from '../src/app.repository';
import { PactModule } from './pact/pact.module';

describe('Pact Verification', () => {
  let verifierService: PactVerifierService;
  let logger: LoggerService;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, PactModule],
      providers: [AppRepository, Logger],
    }).compile();

    verifierService = moduleRef.get(PactVerifierService);
    logger = moduleRef.get(Logger);

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it('validates the expectations of Matching Service', async () => {
    const output = await verifierService.verify(app);

    logger.log('Pact Verification Complete!');
    logger.log(output);
  });

  afterAll(async () => {
    await app.close();
  });
});
