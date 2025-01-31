import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { drive_v3, google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import * as path from 'path';
import * as unzipper from 'unzipper';
import Drive = drive_v3.Drive;
import { OAuth2Client } from 'google-auth-library';
import { DriveFile } from './drive-file';
import * as process from 'node:process';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private drive: Drive;

  constructor() {
    this.authorize();
  }

  public async authorize(): Promise<void> {
    try {
      const oAuth2Client: any = await this.loadSavedCredentialsIfExist();

      if (oAuth2Client) {
        this.drive = google.drive({
          version: 'v3',
          auth: oAuth2Client,
        });
      } else {
        console.log(
          'Token não encontrado. Iniciando processo de autenticação...',
        );
        console.log(
          'Por favor, aguarde a abertura do navegador e siga as instruções para autenticar.',
        );

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
        } else {
          throw new Error('Failed to obtain client credentials');
        }
      }
    } catch (error) {
      throw new Error(`Authorization failed: ${error.message}`);
    }
  }

  async loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
    try {
      const tokenPath = path.join(process.cwd(), process.env.TOKEN_PATH);

      if (!fs.existsSync(tokenPath)) {
        return null;
      }

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

    return await Promise.all(
      files.map(async (file) => {
        const texText = await this.getTexFileTextAndDownloadPdf(
          file.id as string,
        );
        return { texText, fileId: file.id } as DriveFile;
      }),
    );
  }

  async getTexFileTextAndDownloadPdf(fileId: string) {
    return new Promise(async (resolve, reject) => {
      this.downloadFile(fileId)
        .then(async (buffer) => {
          const directory = await unzipper.Open.buffer(buffer);
          let texText = '';

          for (const file of directory.files) {
            if (file.path.endsWith('.tex')) {
              const content = await file.buffer();
              texText = content.toString('utf-8');
            }

            if (file.path.endsWith('artigo.pdf')) {
              const content = await file.buffer();
              const filePath = path.join(
                process.cwd(),
                'latexProjects',
                `${fileId}.pdf`,
              );

              if (fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, content);
              } else {
                fs.writeFileSync(filePath, content);
              }
            }
          }

          if (texText) resolve(texText);

          reject(new Error('No .tex file found in the zip archive.'));
        })
        .catch((error) => {
          console.error(
            'An error occurred while downloading or extracting the file:',
            error,
          );
          reject(error);
        });
    });
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' },
      );
      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      console.error('An error occurred while downloading the file:', error);
    }
  }

  async uploadAndProcess(file: Express.Multer.File, title: string) {
    try {
      if (!(file.buffer instanceof Buffer))
        throw new Error('Unexpected file buffer type');

      const bufferStream = new Readable({
        read() {
          this.push(file.buffer);
          this.push(null); // Indica o fim do stream
        },
      });

      const fileMetadata = {
        name: `${title}.zip`,
        parents: [process.env.GOOGLE_FOLDER_ID],
      };

      const media = {
        mimeType: file.mimetype,
        body: bufferStream,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name',
      });

      const directory = await unzipper.Open.buffer(file.buffer);
      let texText = '';

      for (const file of directory.files) {
        if (file.path.endsWith('.tex')) {
          const content = await file.buffer();
          texText = content.toString('utf-8');
        }
      }

      if (texText) return { texText, fileId: response.data.id } as DriveFile;

      throw new Error('No .tex file found in the zip archive.');
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Error uploading file');
    }
  }
}
