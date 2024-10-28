import { Injectable } from '@nestjs/common';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { readdir } from 'fs';
import { extname } from 'path';

@Injectable()
export class DatabaseService {
  public client = new MongoClient(process.env.DATABASE_URI);

  constructor() {
    this.connectDatabase();
  }

  private async connectDatabase() {
    try {
      this.client = new MongoClient(process.env.DATABASE_URI, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        tlsCertificateKeyFile: `./certs/${await this.getPemCert()}`,
      });

      await this.client.connect();
    } catch (err) {
      console.error(err);
    }
  }

  private getPemCert(): Promise<string | null> {
    try {
      return new Promise((resolve, reject) => {
        readdir('./certs', (err, files) => {
          if (err) {
            reject(err);
          } else {
            const pemFile = files.find((file) => extname(file) === '.pem');
            resolve(pemFile || null);
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
}
