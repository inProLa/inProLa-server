import { Injectable } from '@nestjs/common';
import { PluginServiceInterface } from '../../../common/models/plugin-service-interface';
import { PluginProcessPayload } from '../../../common/models/plugin-process-payload';
import { PluginSearchPayload } from '../../../common/models/plugin-search-payload';
import { PluginService } from '../../../common/pluginService.decorator';

@Injectable()
@PluginService()
export class TitleService implements PluginServiceInterface {
  async process(payload: PluginProcessPayload): Promise<void> {
    const texContent = payload.texFile.texText;
    const firstPart = texContent.split(String.raw`\title{`)[1];
    const titleText = firstPart.split('}')[0];

    await payload.dataBaseClient
      .db('plugins')
      .collection('academic_works')
      .updateOne(
        { fileId: payload.texFile.fileId },
        {
          $set: {
            fileId: payload.texFile.fileId,
            title: titleText,
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
      .find({ title: { $regex: regex } })
      .toArray();
  }
}
