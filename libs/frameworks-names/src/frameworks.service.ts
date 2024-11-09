import { Injectable } from '@nestjs/common';
import { PluginService } from '../../../common/pluginService.decorator';
import { PluginServiceInterface } from '../../../common/models/plugin-service-interface';
import { PluginProcessPayload } from '../../../common/models/plugin-process-payload';
import { PluginSearchPayload } from '../../../common/models/plugin-search-payload';

@Injectable()
@PluginService()
export class FrameworksService implements PluginServiceInterface {
  frameworksNames: string[] = [
    'React',
    'Angular',
    'Vue.js',
    'Spring',
    'Django',
    'Flask',
    'Ruby on Rails',
    'Laravel',
    'Express',
    'ASP.NET',
    'Ember.js',
    'Backbone.js',
    'Svelte',
    'Meteor',
    'Next.js',
    'Nuxt.js',
    'Gatsby',
    'Symfony',
    'CakePHP',
    'Phoenix',
  ];

  async Processamento(payload: PluginProcessPayload): Promise<void> {
    const foundFrameworks: string[] = this.foundedFrameworks(
      payload.texFile.texText,
    );

    await payload.dataBaseClient
      .db('plugins')
      .collection('frameworks')
      .updateOne(
        { fileId: payload.texFile.fileId },
        {
          $set: {
            fileId: payload.texFile.fileId,
            foundFrameworks,
          },
        },
        { upsert: true },
      )
      .catch((err) => console.error(err));
  }

  async Busca(payload: PluginSearchPayload): Promise<Array<string>> {
    const frameworksDetected = await this.foundedFrameworks(payload.searchText);

    return await payload.dataBaseClient
      .db('plugins')
      .collection('frameworks')
      .find({ foundFrameworks: { $in: frameworksDetected } })
      .toArray()
      .then((res) => res.map((r) => r.fileId));
  }

  private foundedFrameworks(text: string): string[] {
    return this.frameworksNames.filter((framework) =>
      text.toLowerCase().includes(framework?.toLowerCase()),
    );
  }
}
