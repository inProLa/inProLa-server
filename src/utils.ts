import * as fs from "fs"
import * as path from 'path';
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";
import * as unzipper from 'unzipper';
import {OAuth2Client} from "google-auth-library";

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_PATH = path.join(process.cwd(), './certs/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), './certs/credentials.json');

export const processTexFilesInLatexFolders = async () => {
    const baseDirectory = './latexProjects';
    const texContents: Array<{ texName: string, texContent: string }> = []

    if (fs.existsSync(baseDirectory) && fs.lstatSync(baseDirectory).isDirectory()) {
        const subfolders = fs.readdirSync(baseDirectory).filter((item) => {
            const itemPath = path.join(baseDirectory, item);
            return fs.lstatSync(itemPath).isDirectory();
        });

        subfolders.map(async (subfolder) => {
            const mainTexPath = path.join(baseDirectory, subfolder);

            if (fs.existsSync(mainTexPath) && fs.lstatSync(path.join(mainTexPath, 'main.tex')).isFile()) {
                fs.copyFileSync(path.join(mainTexPath, 'main.tex'), path.join(mainTexPath, 'main.txt'));
                texContents.push({
                    texName: subfolder,
                    texContent: fs.readFileSync(path.join(mainTexPath, 'main.txt'), 'utf8')
                });
                fs.rmSync(path.join(mainTexPath, 'main.txt'), {recursive: true});
            }
        });
    }

    return texContents;
}

export const loadSavedCredentialsIfExist = async () => {
    try {
        const content: any = await fs.readFileSync(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.error('Need get the token')
        return null;
    }
}

export const saveCredentials = async (client: OAuth2Client) => {
    const content: any = await fs.readFileSync(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFileSync(TOKEN_PATH, payload);
}

export const authorize = async () => {
    let client: any = await loadSavedCredentialsIfExist();

    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });

    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

export const listFiles = async (authClient: OAuth2Client) => {
    const drive = google.drive({version: 'v3', auth: authClient});
    const res = await drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
        q: `'${process.env.GOOGLE_FOLDER_ID}' in parents and trashed = false`
    });
    const files =  res.data.files;
    if (!files || files.length === 0) {
        console.log('No files found.');
        return;
    }

    // Crie a pasta de destino se ela não existir
    if (!fs.existsSync('./latexProjects')) {
        fs.mkdirSync('./latexProjects');
    }

    return await Promise.all(
        files.map(async (file) => {
            return await downloadFile(authClient, file.id as string);
        })
    );
}

async function downloadFile(authClient: OAuth2Client, fileId: string) {
    const drive = google.drive({version: 'v3', auth: authClient});
    const folderPath = path.join('./latexProjects', fileId);

    return new Promise(async (resolve, reject) => {
        try {
            // Create the destination folder if it doesn't exist
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }

            // Download the file from Google Drive
            drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' }).then(response => {
                extrairArquivoZip(Buffer.from(response.data as ArrayBuffer), folderPath).then(resolve);
            })

        } catch (error) {
            console.error('An error occurred while downloading or extracting the file:', error);
            reject(error);
        }
    });
}

export const getPemCert = (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      fs.readdir('./certs', (err, files) => {
        if (err) {
          reject(err);
        } else {
          const pemFile = files.find(file => path.extname(file) === '.pem');
          resolve(pemFile || null);
        }
      });
    });
  }

async function extrairArquivoZip(buffer: Buffer, folderPath: string): Promise<any> {

    // Crie um stream de leitura a partir do buffer
    const stream = await unzipper.Open.buffer(buffer);

    // Extraia cada arquivo do zip
    return await stream.extract({
        path: folderPath,
    });
}