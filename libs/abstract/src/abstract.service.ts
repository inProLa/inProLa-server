import { Injectable } from '@nestjs/common';
import { PluginService } from '../../../common/pluginService.decorator';
import { PluginServiceInterface } from '../../../common/models/plugin-service-interface';
import { PluginProcessPayload } from '../../../common/models/plugin-process-payload';
import { PluginSearchPayload } from '../../../common/models/plugin-search-payload';

@Injectable()
@PluginService()
export class AbstractService implements PluginServiceInterface {
  async process(payload: PluginProcessPayload): Promise<void> {
    const texContent = payload.texFile.texText;
    const firstPart = texContent.split(String.raw`\begin{resumo} `)[1];
    const summaryText = firstPart.split(String.raw`\end{resumo}`)[0];

    await payload.dataBaseClient
      .db('plugins')
      .collection('academic_works')
      .updateOne(
        { fileId: payload.texFile.fileId },
        {
          $set: {
            fileId: payload.texFile.fileId,
            summary: summaryText,
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
      .find({ summary: { $regex: regex } })
      .toArray();
  }

  get filterName(): string {
    return 'Resumo';
  }
}
