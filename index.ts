import { MyBase } from "./base";
import { processTexFilesInLatexFolders, authorize, listFiles, downloadFile} from "./utils";
import express, { Express, Request, Response } from "express";
import { MongoClient, ServerApiVersion } from 'mongodb';
import * as dotenv from 'dotenv';

const app: Express = express();
const port = 3030;
const uri = `mongodb+srv://ifbainprola:CgpdhnGzuTP2xJa4@inprola.qv1pauu.mongodb.net/?retryWrites=true&w=majority&appName=InProLa`;

dotenv.config();

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tlsCertificateKeyFile: "./certs/X509-cert-5223493686402689113.pem",
});

app.get("/process", async (req: Request, res: Response) => {

  processTexFilesInLatexFolders().then((listTexContents) => {
    listTexContents.map( async (tex) => {
      const myBase = new MyBase({
        texContent: tex.texContent,
        mongoDBClient: client,
        fileId: tex.texName
      });
      await myBase.getSummary();
      await myBase.getTitle();
      // await myBase.getConclusion();
    });
  }).catch((e) => {res.send(e)}).finally(() => {
      res.send('Finished')
  });
});

app.get("/", async (req: Request, res: Response) => {
  const db = await client.db("admin").command({ ping: 1 });
  const gg = await authorize();

  res.send(`Running!`);
});

app.get("/download", async (req: Request, res: Response) => {
  authorize().then(auth => {res.send(listFiles(auth))}).catch(e => res.send(e));
});

app.get("/downloadAndProcess", async (req: Request, res: Response) => {
  authorize().then(auth => {
    listFiles(auth).then(files => {
      processTexFilesInLatexFolders().then((listTexContents) => {
        listTexContents.map( async (tex) => {
          const myBase = new MyBase({
            texContent: tex.texContent,
            mongoDBClient: client,
            fileId: tex.texName
          });
          await myBase.getSummary();
          await myBase.getTitle();
          await myBase.getConclusion();
        });
      }).catch((e) => {res.send(e)}).finally(() => {
        res.send('Finished')
      });
    })
  }).catch(e => res.send(e));
});

app.listen(port, () => {
  startDb().catch(console.dir);
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

async function startDb() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    await client.db("admin").command({ ping: 1 }).catch(console.error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}