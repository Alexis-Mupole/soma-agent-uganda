import React from 'react';

/**
 * Lightweight, dependency-free Markdown renderer for AI output.
 * Supports headings, bold/italic/inline-code, links, lists, blockquotes,
 * horizontal rules, fenced code and tables.
 */

type Inline = React.ReactNode;

const INLINE_RE = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, keyPrefix: string): Inline[] {
  const parts = text.split(INLINE_RE).filter((p) => p !== '' && p !== undefined);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={key} href={link[2]} target="_blank" rel="noreferrer noopener">
          {link[1]}
        </a>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

const isTableDivider = (line: string) =>
  /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line) ||
  /^\s*\|?(\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?\s*$/.test(line);

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

export interface MarkdownProps {
  content: string;
  compact?: boolean;
  className?: string;
  cursor?: boolean;
}

export const Markdown: React.FC<MarkdownProps> = ({ content, compact, className = '', cursor }) => {
  const lines = (content || '').replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Blank line
    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre key={key++}>
          <code data-lang={lang || undefined}>{buf.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Headings
    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = Math.min(heading[1].length, 4);
      const text = heading[2].replace(/\s*#+\s*$/, '');
      const Tag = (`h${level}` as unknown) as 'h4';
      blocks.push(<Tag key={key++}>{renderInline(text, `h-${key}`)}</Tag>);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^([-*_])\1{2,}$/.test(trimmed.replace(/\s/g, ''))) {
      blocks.push(<hr key={key++} />);
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        buf.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const text = buf.join(' ');
      blocks.push(<blockquote key={key++}>{renderInline(text, `q-${key}`)}</blockquote>);
      continue;
    }

    // Table
    if (trimmed.includes('|') && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      const header = splitRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key++} className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {header.map((h, ci) => (
                  <th key={ci}>{renderInline(h, `th-${key}-${ci}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {header.map((_, ci) => (
                    <td key={ci}>{renderInline(row[ci] || '', `td-${key}-${ri}-${ci}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Unordered list
    if (/^([-*•])\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*•])\s+/.test(lines[i])) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={key++}>
          {items.map((item, ii) => (
            <li key={ii}>{renderInline(item, `li-${key}-${ii}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={key++}>
          {items.map((item, ii) => (
            <li key={ii}>{renderInline(item, `oli-${key}-${ii}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph — collect until a structural line
    const para: string[] = [trimmed];
    i++;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (
        !next ||
        next.startsWith('#') ||
        next.startsWith('>') ||
        next.startsWith('```') ||
        /^([-*•])\s+/.test(next) ||
        /^\d+[.)]\s+/.test(next) ||
        next.includes('|') ||
        /^([-*_])\1{2,}$/.test(next.replace(/\s/g, ''))
      ) {
        break;
      }
      para.push(next);
      i++;
    }
    blocks.push(<p key={key++}>{renderInline(para.join(' '), `p-${key}`)}</p>);
  }

  return (
    <div className={`markdown-body ${compact ? 'markdown-compact' : ''} ${className}`}>
      {blocks.length ? blocks : <p className="text-slate-400">…</p>}
      {cursor && (
        <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse rounded-full bg-uni-blue/60" />
      )}
    </div>
  );
};

export default Markdown;
