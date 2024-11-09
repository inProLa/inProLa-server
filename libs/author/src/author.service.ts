import { Injectable } from '@nestjs/common';
import { PluginService } from '../../../common/pluginService.decorator';
import { PluginServiceInterface } from '../../../common/models/plugin-service-interface';
import { PluginProcessPayload } from '../../../common/models/plugin-process-payload';
import { PluginSearchPayload } from '../../../common/models/plugin-search-payload';

@Injectable()
@PluginService()
export class AuthorService implements PluginServiceInterface {
  async Processamento(payload: PluginProcessPayload): Promise<void> {
    const authors = this.extractAuthors(payload.texFile.texText);
    console.log(authors);
    await payload.dataBaseClient
      .db('plugins')
      .collection('authors')
      .updateOne(
        { fileId: payload.texFile.fileId },
        {
          $set: {
            fileId: payload.texFile.fileId,
            authors: authors,
          },
        },
        { upsert: true },
      )
      .catch((err) => console.error(err));
  }

  async Busca(payload: PluginSearchPayload): Promise<Array<string>> {
    const regex = new RegExp(payload.searchText, 'i');

    const results = await payload.dataBaseClient
      .db('plugins')
      .collection('authors')
      .find({ authors: { $regex: regex } })
      .toArray();

    return results.map((r) => r.fileId);
  }

  extractAuthors(texText: string): string[] {
    const authorPattern = /\\author\{([^}]*)\}/;
    const match = texText.match(authorPattern);

    if (!match) {
      return [];
    }

    const authorsText = match[1];
    const authors = authorsText
      .split(/,(?![^{]*\})/) // Split by comma not within braces
      .map((author) => author.replace(/\\inst\{.*$/, '').trim());

    return authors;
  }
}
