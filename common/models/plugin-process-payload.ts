import { MongoClient } from 'mongodb';
import { DriveFile } from '../../src/shared/services/google-drive/drive-file';

export class PluginProcessPayload {
  texFile: DriveFile;
  dataBaseClient: MongoClient;

  constructor(texFile: DriveFile, dataBaseClient: MongoClient) {
    this.texFile = texFile;
    this.dataBaseClient = dataBaseClient;
  }
}
