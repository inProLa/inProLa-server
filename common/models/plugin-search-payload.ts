import { MongoClient } from 'mongodb';

export class PluginSearchPayload {
  searchText: string;
  dataBaseClient: MongoClient;

  constructor(searchText: string, dataBaseClient: MongoClient) {
    this.searchText = searchText;
    this.dataBaseClient = dataBaseClient;
  }
}
