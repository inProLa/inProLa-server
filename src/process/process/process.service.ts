import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProcessService {
  async processTexFilesInLatexFolders() {
    const baseDirectory = './latexProjects';
    const texContents: Array<{ texName: string; texContent: string }> = [];

    if (
      fs.existsSync(baseDirectory) &&
      fs.lstatSync(baseDirectory).isDirectory()
    ) {
      const subfolders = fs.readdirSync(baseDirectory).filter((item) => {
        const itemPath = path.join(baseDirectory, item);
        return fs.lstatSync(itemPath).isDirectory();
      });

      subfolders.map(async (subfolder) => {
        const mainTexPath = path.join(baseDirectory, subfolder);

        if (
          fs.existsSync(mainTexPath) &&
          fs.lstatSync(path.join(mainTexPath, 'main.tex')).isFile()
        ) {
          fs.copyFileSync(
            path.join(mainTexPath, 'main.tex'),
            path.join(mainTexPath, 'main.txt'),
          );
          texContents.push({
            texName: subfolder,
            texContent: fs.readFileSync(
              path.join(mainTexPath, 'main.txt'),
              'utf8',
            ),
          });
          fs.rmSync(path.join(mainTexPath, 'main.txt'), { recursive: true });
        }
      });
    }

    return texContents;
  }
}
