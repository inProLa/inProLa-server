import { Base } from "javascript-plugin-architecture-with-typescript-definitions";
import {getTitle} from "../plugins/pluginGetTitle";
import {MongoClient} from "mongodb";
import {getSummary} from "../plugins/pluginGetSummary";
import {getAbstract} from "../plugins/pluginGetAbstract";

declare module "javascript-plugin-architecture-with-typescript-definitions" {
    namespace Base {
      interface Options {
        texContent?: string;
        fileId?: string;
        mongoDBClient?: MongoClient;
      }
    }
  }

export const MyBase = Base.withPlugins([getTitle, getSummary, getAbstract]);