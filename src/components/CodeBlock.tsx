import { codeToHtml, type BundledLanguage } from 'shiki';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export async function CodeBlock({ code, language = 'plaintext' }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang: language as BundledLanguage,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  });

  return (
    <div
      className="code-block-wrapper rounded-lg overflow-hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
