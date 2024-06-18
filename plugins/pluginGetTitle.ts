import { Base } from "javascript-plugin-architecture-with-typescript-definitions";

export function getTitle(base: Base) {
  return {
    getTitle: () => {
      if (!base.options.texContent) return;
      let texContent = base.options.texContent;

      const firstPart = texContent.split(String.raw`\title{`)[1]
      const titleText = firstPart.split('}')[0]

      return base.options.mongoDBClient.db("plugins").collection("plugin_title").updateOne(
          {fileId: base.options.fileId},
          { $set: {fileId: base.options.fileId, titleText}},
          {upsert: true}
      )
    }
  }
}