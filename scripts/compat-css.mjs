import { readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";

const cssFile = new URL("../dist/exp-ui.css", import.meta.url);
const css = await readFile(cssFile, "utf8");
const root = postcss.parse(css, { from: cssFile.pathname });

root.walkAtRules("layer", (rule) => {
  if (rule.nodes?.length) {
    rule.replaceWith(...rule.nodes);
    return;
  }

  rule.remove();
});

await writeFile(cssFile, root.toString(), "utf8");
