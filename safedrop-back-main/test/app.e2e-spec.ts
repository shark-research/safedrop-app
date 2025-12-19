import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('VerificationController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.VERIFICATION_API_KEY = 'test-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/verification (POST) unsupported exchange', () => {
    return request(app.getHttpServer())
      .post('/api/verification')
      .set('x-api-key', 'test-key')
      .send({
        exchange: 'unsupported',
        key: 'key',
        secret: 'secret',
        wallet: 'wallet',
      })
      .expect(400);
  });
});
