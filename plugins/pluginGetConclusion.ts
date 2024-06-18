import { Base } from "javascript-plugin-architecture-with-typescript-definitions";
import { getTexFileContent } from "../utils";

export function getConclusion(base: Base) {
  return {
      getConclusion: () => {
        if (!base.options.texContent) return;
        let texContent = base.options.texContent;

        const firstPart = texContent.split(String.raw`\begin{abstract}`)[1]
        const conclusionText = firstPart.split(String.raw`\end{abstract}`)[0]

        return base.options.mongoDBClient.db("plugins").collection("plugin_abstract").updateOne(
            {fileId: base.options.fileId},
            { $set: {fileId: base.options.fileId, conclusionText}},
            {upsert: true}
        )
    }
  }
}