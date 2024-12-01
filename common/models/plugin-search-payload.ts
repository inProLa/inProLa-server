import { MongoClient } from 'mongodb';

export class PluginSearchPayload {
  searchText: string;
  filters: string[];
  dataBaseClient: MongoClient;

  constructor(
    searchText: string,
    filters: string[],
    dataBaseClient: MongoClient,
  ) {
    this.searchText = searchText;
    this.filters = filters;
    this.dataBaseClient = dataBaseClient;
  }
}
