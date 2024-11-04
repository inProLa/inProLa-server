import { Injectable } from '@nestjs/common';
import { ProcessamentoService } from '../../../common/processamentoService.decorator';
import { ProcessamentoServiceInterface } from '../../../common/models/processamento-service-interface';
import { PluginPayload } from '../../../common/models/plugin-payload';

@Injectable()
@ProcessamentoService()
export class FrameworksNamesService implements ProcessamentoServiceInterface {
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

  async Processamento(payload: PluginPayload): Promise<void> {
    const foundFrameworks: string[] = this.frameworksNames.filter((framework) =>
      payload.texFile.texText.includes(framework),
    );

    await payload.dataBaseClient
      .db('plugins')
      .collection('frameworks-names')
      .updateOne(
        { fileId: payload.texFile.fileId },
        { $set: { fileId: payload.texFile.fileId, foundFrameworks } },
        { upsert: true },
      );
  }
}
