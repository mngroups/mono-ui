import {
  Controls,
  Description,
  Primary,
  Source,
  Stories,
  Subtitle,
  Title,
  useOf,
} from "@storybook/addon-docs/blocks";

type DocsParameters = { importPath?: string };

/**
 * Storybook's standard docs layout (title, description, primary example, props, all
 * examples) plus the import line from `parameters.docs.importPath` on the story file's meta.
 */
export function DocsPage() {
  const { preparedMeta } = useOf("meta");
  const importCode = (preparedMeta.parameters?.docs as DocsParameters | undefined)?.importPath;

  return (
    <>
      <Title />
      <Subtitle />
      <Description of="meta" />
      {importCode && <Source code={importCode} language="tsx" />}
      <Primary />
      {preparedMeta.component && <Controls />}
      <Stories />
    </>
  );
}
