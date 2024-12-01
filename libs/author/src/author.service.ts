import { Injectable } from '@nestjs/common';
import { PluginService } from '../../../common/pluginService.decorator';
import { PluginServiceInterface } from '../../../common/models/plugin-service-interface';
import { PluginProcessPayload } from '../../../common/models/plugin-process-payload';
import { PluginSearchPayload } from '../../../common/models/plugin-search-payload';

@Injectable()
@PluginService()
export class AuthorService implements PluginServiceInterface {
  async process(payload: PluginProcessPayload): Promise<void> {
    const authors = this.extractAuthors(payload.texFile.texText);

    await payload.dataBaseClient
      .db('plugins')
      .collection('academic_works')
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

  async search(payload: PluginSearchPayload): Promise<Array<any>> {
    const regex = new RegExp(payload.searchText, 'i');

    return await payload.dataBaseClient
      .db('plugins')
      .collection('academic_works')
      .find({ authors: { $regex: regex } })
      .toArray();
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

  get filterName(): string {
    return 'Autor';
  }
}
