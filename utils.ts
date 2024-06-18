import * as fs from "fs"
import * as path from 'path';
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";
import * as unzipper from 'unzipper';
import * as AdmZip from 'adm-zip';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

export const getTexFileContent = async (fileName: string) => {
    let fileContent: string;
    const zipPath = `./zippedLatexProjects/${fileName}.zip`;
    const tempPath = `./temp/${fileName}`;

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
    if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);

    return await new Promise(
        (resolve, reject) => {
            fs.createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: tempPath }))
                .on('finish', async () => {
                    await fs.copyFileSync(`${tempPath}/main.tex`, `${tempPath}/main.txt`);
                    fileContent = await fs.readFileSync(`${tempPath}/main.tex`, 'utf8');
                    //TODO remove temp folder
                    // await fs.rmSync(tempPath, {recursive: true});
                    resolve(fileContent);
                })
                .on('error', reject);
        }
    )
}

export const processTexFilesInLatexFolders = async () => {
    const files = []
    const latexDir = './zippedLatexProjects';
    const texFiles = fs.readdirSync(latexDir, { withFileTypes: true })
        .map(dirent => dirent.name);

    for (const tex of texFiles) {
        const fileName = tex.split('.')[0];
        const texContent = await getTexFileContent(fileName);
        files.push({texContent, texName: fileName});
    }

    return files;
}

export const loadSavedCredentialsIfExist = async () => {
    try {
        const content: any = await fs.readFileSync(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.error(err)
        return null;
    }
}

export const saveCredentials = async (client) => {
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

export const listFiles = async (authClient) => {
    const drive = google.drive({version: 'v3', auth: authClient});
    const res = await drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
        q: `'${process.env.GOOGLE_FOLDER_ID}' in parents and trashed = false`
    });
    const files = res.data.files;
    if (files.length === 0) {
        console.log('No files found.');
        return;
    }

    files.map((file) => {
        downloadFile(authClient, file.id);
    });
}

export const downloadFile = (authClient, fileId) => {
    const drive = google.drive({version: 'v3', auth: authClient});
    if (!fs.existsSync('./zippedLatexProjects')) {
        fs.mkdirSync('./zippedLatexProjects');
    }

    drive.files.get({fileId: fileId, alt: 'media'}, {responseType: 'stream'},
        function(err, res){
            const fileStream = fs.createWriteStream(`./zippedLatexProjects/${fileId}.zip`)
            res.data
                .on('error', err => {
                    console.log('Error', err);
                })
                .pipe(fileStream)
        });
}

