import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

export function SafeMarkdown({ content, className = "safe-markdown" }: { content: string; className?: string }) {
  const lines = content.replaceAll("\r\n", "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(<CodeBlock code={code.join("\n")} language={language} key={`code-${index}`} />);
      continue;
    }

    if (isTableStart(lines, index)) {
      const headers = parseTableRow(lines[index]);
      const alignments = parseTableRow(lines[index + 1]).map(tableAlignment);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && lines[index].trim() && looksLikeTableRow(lines[index])) {
        const cells = parseTableRow(lines[index]);
        rows.push(headers.map((_, cellIndex) => cells[cellIndex] ?? ""));
        index += 1;
      }

      blocks.push(
        <div className="markdown-table-wrap" key={`table-${index}`}>
          <table>
            <thead>
              <tr>
                {headers.map((cell, cellIndex) => (
                  <th className={alignments[cellIndex]} key={`table-${index}-head-${cellIndex}`}>
                    {renderInline(cell, `table-${index}-head-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`table-${index}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td className={alignments[cellIndex]} key={`table-${index}-row-${rowIndex}-${cellIndex}`}>
                      {renderInline(cell, `table-${index}-row-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const children = renderInline(heading[2], `heading-${index}`);
      blocks.push(heading[1].length === 1 ? <h1 key={`h-${index}`}>{children}</h1> : heading[1].length === 2 ? <h2 key={`h-${index}`}>{children}</h2> : <h3 key={`h-${index}`}>{children}</h3>);
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(<ul key={`ul-${index}`}>{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{renderInline(item, `ul-${index}-${itemIndex}`)}</li>)}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(<ol key={`ol-${index}`}>{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{renderInline(item, `ol-${index}-${itemIndex}`)}</li>)}</ol>);
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        quote.push(lines[index].slice(2));
        index += 1;
      }
      blocks.push(<blockquote key={`quote-${index}`}>{renderInlineLines(quote, `quote-${index}`)}</blockquote>);
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(<p key={`p-${index}`}>{renderInlineLines(paragraph, `p-${index}`)}</p>);
  }

  return <div className={className}>{blocks}</div>;
}

function isBlockStart(lines: string[], index: number) {
  const line = lines[index];
  return line.startsWith("```") || isTableStart(lines, index) || /^(#{1,3})\s+/.test(line) || /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line) || line.startsWith("> ");
}

function isTableStart(lines: string[], index: number) {
  if (index + 1 >= lines.length) return false;
  const headers = parseTableRow(lines[index]);
  const dividers = parseTableRow(lines[index + 1]);
  return headers.length >= 2
    && dividers.length === headers.length
    && dividers.every((cell) => /^:?-{3,}:?$/.test(cell.replaceAll(" ", "")));
}

function looksLikeTableRow(line: string) {
  return line.includes("|") && parseTableRow(line).length >= 2;
}

function parseTableRow(line: string) {
  const source = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cell = "";

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === "\\" && source[index + 1] === "|") {
      cell += "|";
      index += 1;
    } else if (source[index] === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += source[index];
    }
  }

  cells.push(cell.trim());
  return cells;
}

function tableAlignment(divider: string) {
  const value = divider.replaceAll(" ", "");
  if (value.startsWith(":") && value.endsWith(":")) return "align-center";
  if (value.endsWith(":")) return "align-right";
  return "align-left";
}

function renderInlineLines(lines: string[], keyPrefix: string): ReactNode[] {
  return lines.flatMap((line, lineIndex) => [
    ...(lineIndex > 0 ? [<br key={`${keyPrefix}-break-${lineIndex}`} />] : []),
    ...renderInline(line, `${keyPrefix}-line-${lineIndex}`),
  ]);
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const tokens = text.split(/(!?\[[^\]]*\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    const media = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (media && /^\/media\/[a-f0-9-]{36}$/i.test(media[2])) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={media[2]} alt={media[1]} loading="lazy" key={key} />;
    }
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeLink(link[2]);
      return href ? <a href={href} key={key} rel={href.startsWith("http") ? "noreferrer" : undefined}>{link[1]}</a> : link[1];
    }
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={key}>{token.slice(2, -2)}</strong>;
    if (token.startsWith("`") && token.endsWith("`")) return <code key={key}>{token.slice(1, -1)}</code>;
    return token;
  });
}

function safeLink(value: string) {
  const href = value.trim();
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (/^https:\/\//i.test(href) || /^mailto:/i.test(href)) return href;
  return null;
}
