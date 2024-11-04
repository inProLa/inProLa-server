import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { drive_v3, google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import * as path from 'path';
import * as unzipper from 'unzipper';
import Drive = drive_v3.Drive;
import { OAuth2Client } from 'google-auth-library';
import { DriveFile } from './drive-file';

@Injectable()
export class GoogleDriveService {
  private drive: Drive;

  constructor() {
    this.authorize();
  }

  private async authorize(): Promise<void> {
    const oAuth2Client: any = await this.loadSavedCredentialsIfExist();

    if (oAuth2Client) {
      this.drive = google.drive({
        version: 'v3',
        auth: oAuth2Client,
      });
    } else {
      const client = await authenticate({
        scopes: [
          process.env.SCOPE_GOOGLE_DRIVE_API,
          process.env.SCOPE_GOOGLE_DRIVE_API_METADATA,
        ],
        keyfilePath: path.join(process.cwd(), process.env.CREDENTIALS_PATH),
      });

      if (client.credentials) {
        this.drive = google.drive({ version: 'v3', auth: client });
        await this.saveCredentials(client);
      }
    }
  }

  async loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
    try {
      const tokenPath = path.join(process.cwd(), process.env.TOKEN_PATH);
      const token = fs.readFileSync(tokenPath, 'utf-8');
      const credentials = JSON.parse(token);
      const client = new OAuth2Client(
        credentials.client_id,
        credentials.client_secret,
      );
      client.setCredentials({ refresh_token: credentials.refresh_token });
      return client;
    } catch (err) {
      console.error('Error loading saved credentials:', err);
      return null;
    }
  }

  async saveCredentials(client) {
    const content = fs.readFileSync(
      path.join(process.cwd(), process.env.CREDENTIALS_PATH),
    );
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    fs.writeFileSync(process.env.TOKEN_PATH, payload);
  }

  async listFiles() {
    const res = await this.drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
      q: `'${process.env.GOOGLE_FOLDER_ID}' in parents and trashed = false`,
    });
    const files = res.data.files;
    if (!files || files.length === 0) {
      console.log('No files found.');
      return;
    }

    if (!fs.existsSync('./latexProjects')) {
      fs.mkdirSync('./latexProjects');
    }

    return await Promise.all(
      files.map(async (file) => {
        const texText = await this.downloadFile(file.id as string);
        return { texText, fileId: file.id } as DriveFile;
      }),
    );
  }

  async downloadFile(fileId: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'arraybuffer' },
        );
        const buffer = Buffer.from(response.data as ArrayBuffer);
        const directory = await unzipper.Open.buffer(buffer);

        for (const file of directory.files) {
          if (file.path.endsWith('.tex')) {
            const content = await file.buffer();
            resolve(content.toString('utf-8'));
            return;
          }
        }

        reject(new Error('No .tex file found in the zip archive.'));
      } catch (error) {
        console.error(
          'An error occurred while downloading or extracting the file:',
          error,
        );
        reject(error);
      }
    });
  }

  async extrairArquivoZip(buffer: Buffer, folderPath: string): Promise<any> {
    const stream = await unzipper.Open.buffer(buffer);

    return await stream.extract({
      path: folderPath,
    });
  }
}
