import type { ClipboardEvent, FocusEvent, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

type SafeMarkdownProps = {
  content: string;
  className?: string;
  editable?: boolean;
  onContentChange?: (content: string) => void;
};

export function SafeMarkdown({ content, className = "safe-markdown", editable = false, onContentChange }: SafeMarkdownProps) {
  const lines = content.replaceAll("\r\n", "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  function editableBlock(start: number, end: number, serialize: (element: HTMLElement) => string) {
    if (!editable || !onContentChange) return {};
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: true,
      tabIndex: 0,
      "aria-label": "可直接編輯此段文字",
      "data-preview-editable": "true",
      onBlur(event: FocusEvent<HTMLElement>) {
        const replacement = serialize(event.currentTarget);
        const current = lines.slice(start, end).join("\n");
        if (replacement === current) return;
        const replacementLines = replacement ? replacement.split("\n") : [];
        onContentChange([...lines.slice(0, start), ...replacementLines, ...lines.slice(end)].join("\n"));
      },
      onPaste: pastePlainText,
      onKeyDown: finishEditingWithEscape,
      onClick(event: MouseEvent<HTMLElement>) {
        if ((event.target as HTMLElement).closest("a")) event.preventDefault();
      },
    };
  }

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
      const start = index;
      const children = renderInline(heading[2], `heading-${index}`);
      index += 1;
      const props = editableBlock(start, index, (element) => `${heading[1]} ${serializeEditableContent(element)}`);
      blocks.push(heading[1].length === 1 ? <h1 {...props} key={`h-${index}`}>{children}</h1> : heading[1].length === 2 ? <h2 {...props} key={`h-${index}`}>{children}</h2> : <h3 {...props} key={`h-${index}`}>{children}</h3>);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const start = index;
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ""));
        index += 1;
      }
      const props = editableBlock(start, index, (element) => serializeEditableList(element, false));
      blocks.push(<ul {...props} key={`ul-${index}`}>{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{renderInline(item, `ul-${index}-${itemIndex}`)}</li>)}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const start = index;
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      const props = editableBlock(start, index, (element) => serializeEditableList(element, true));
      blocks.push(<ol {...props} key={`ol-${index}`}>{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{renderInline(item, `ol-${index}-${itemIndex}`)}</li>)}</ol>);
      continue;
    }

    if (line.startsWith("> ")) {
      const start = index;
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        quote.push(lines[index].slice(2));
        index += 1;
      }
      const props = editableBlock(start, index, (element) => serializeEditableContent(element).split("\n").map((value) => `> ${value}`).join("\n"));
      blocks.push(<blockquote {...props} key={`quote-${index}`}>{renderInlineLines(quote, `quote-${index}`)}</blockquote>);
      continue;
    }

    const start = index;
    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index]);
      index += 1;
    }
    const props = editableBlock(start, index, serializeEditableContent);
    blocks.push(<p {...props} key={`p-${index}`}>{renderInlineLines(paragraph, `p-${index}`)}</p>);
  }

  if (editable && blocks.length === 0) {
    const props = editableBlock(0, lines.length, serializeEditableContent);
    blocks.push(<p {...props} className="markdown-edit-placeholder" data-placeholder="點這裡開始輸入文章內容" key="editable-placeholder" />);
  }

  return <div className={`${className}${editable ? " safe-markdown-editable" : ""}`}>{blocks}</div>;
}

function serializeEditableList(element: HTMLElement, ordered: boolean) {
  return Array.from(element.children)
    .filter((child) => child.tagName === "LI")
    .map((child, index) => `${ordered ? `${index + 1}.` : "-"} ${serializeEditableContent(child as HTMLElement)}`)
    .join("\n");
}

function serializeEditableContent(element: HTMLElement) {
  return serializeEditableChildren(element)
    .replaceAll("\u00a0", " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function serializeEditableChildren(element: HTMLElement) {
  return Array.from(element.childNodes).map((node, index, nodes) => {
    const value = serializeEditableNode(node);
    if (node instanceof HTMLElement && (node.tagName === "DIV" || node.tagName === "P") && index < nodes.length - 1) {
      return `${value}\n`;
    }
    return value;
  }).join("");
}

function serializeEditableNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";
  if (node.tagName === "BR") return "\n";

  const content = serializeEditableChildren(node);
  if (node.tagName === "STRONG" || node.tagName === "B") return `**${content}**`;
  if (node.tagName === "CODE") return `\`${content}\``;
  if (node.tagName === "A") {
    const href = safeLink(node.getAttribute("href") ?? "");
    return href ? `[${content}](${href})` : content;
  }
  if (node.tagName === "IMG") {
    const source = node.getAttribute("src") ?? "";
    return /^\/media\/[a-f0-9-]{36}$/i.test(source) ? `![${node.getAttribute("alt") ?? ""}](${source})` : "";
  }
  return content;
}

function pastePlainText(event: ClipboardEvent<HTMLElement>) {
  event.preventDefault();
  const text = event.clipboardData.getData("text/plain");
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function finishEditingWithEscape(event: KeyboardEvent<HTMLElement>) {
  if (event.key === "Escape") event.currentTarget.blur();
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
