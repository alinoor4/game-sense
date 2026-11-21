import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  // children is the <code> element react-markdown puts inside <pre>
  const text = String(children?.props?.children ?? '').replace(/\n$/, '');

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="codeblock">
      <button type="button" className="btn btn-small codeblock-copy" onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre>
        <code>{text}</code>
      </pre>
    </div>
  );
}

function InlineCode({ children }) {
  const text = String(children);
  // `key:A` in lesson Markdown renders as a keyboard key.
  if (text.startsWith('key:')) return <kbd>{text.slice(4)}</kbd>;
  return <code>{text}</code>;
}

const components = { pre: CodeBlock, code: InlineCode };

// Lesson bodies are Markdown. react-markdown never renders raw HTML, so admin-written content cannot inject scripts.
export default function Markdown({ children }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
