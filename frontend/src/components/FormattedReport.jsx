/**
 * FormattedReport Component
 * Transforms raw AI-generated Markdown/Plaintext into a polished, professional SaaS report.
 * Handles headings, bold/italic, bullet/numbered lists, tables, blockquotes, and dividers.
 */
export default function FormattedReport({ content, className = "" }) {
  if (!content || typeof content !== "string") {
    return <p className="text-slate-400 italic text-xs">No analysis output available.</p>;
  }

  // Parse inline styles: bold (**text**), italic (*text*), inline code (`text`), links ([text](url))
  const renderFormattedInlineText = (text) => {
    if (!text) return null;

    // Split text by formatting markers
    // Tokens: **bold**, *italic*, `code`, [link](url)
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        const inner = part.slice(2, -2);
        return <strong key={index} className="font-extrabold text-slate-900">{inner}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2 && !part.startsWith("**")) {
        const inner = part.slice(1, -1);
        return <em key={index} className="italic text-slate-800">{inner}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        const inner = part.slice(1, -1);
        return (
          <code key={index} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] text-teal-700 font-semibold">
            {inner}
          </code>
        );
      }
      if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (match) {
          return (
            <a
              key={index}
              href={match[2]}
              target="_blank"
              rel="noreferrer"
              className="text-teal-600 hover:text-teal-700 font-semibold underline"
            >
              {match[1]}
            </a>
          );
        }
      }
      return part;
    });
  };

  // Helper to parse markdown blocks: headings, lists, tables, blockquotes, horizontal rules
  const parseBlocks = (rawText) => {
    const lines = rawText.split("\n");
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        i++;
        continue;
      }

      // Horizontal Rule: --- or ***
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        blocks.push({ type: "hr", id: `hr-${i}` });
        i++;
        continue;
      }

      // Headings: # H1, ## H2, ### H3, #### H4
      if (trimmed.startsWith("#")) {
        const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (match) {
          const level = match[1].length;
          const headingText = match[2];
          blocks.push({ type: "heading", level, text: headingText, id: `h-${i}` });
          i++;
          continue;
        }
      }

      // Standalone Bold Heading Line: e.g. **Heading Title:** or **Heading Title**
      if (/^\*\*[^*]+\*\*:?$/.test(trimmed)) {
        const cleanTitle = trimmed.replace(/^\*\*|\*\*:?$/g, "").trim();
        blocks.push({ type: "heading", level: 3, text: cleanTitle, id: `hbold-${i}` });
        i++;
        continue;
      }

      // Blockquotes: > Text
      if (trimmed.startsWith(">")) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
          i++;
        }
        blocks.push({ type: "blockquote", text: quoteLines.join(" "), id: `bq-${i}` });
        continue;
      }

      // Tables: lines starting and ending with |
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }

        // Parse Table
        if (tableLines.length >= 2) {
          const parseRow = (rowStr) =>
            rowStr
              .split("|")
              .slice(1, -1)
              .map((cell) => cell.trim());

          const header = parseRow(tableLines[0]);
          let bodyRowsStartIndex = 1;
          if (tableLines[1].includes("---")) {
            bodyRowsStartIndex = 2;
          }

          const rows = tableLines.slice(bodyRowsStartIndex).map(parseRow);
          blocks.push({ type: "table", header, rows, id: `tbl-${i}` });
          continue;
        }
      }

      // Bullet Lists: - Item or * Item
      if (/^[-*]\s+/.test(trimmed)) {
        const listItems = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i++;
        }
        blocks.push({ type: "unordered-list", items: listItems, id: `ul-${i}` });
        continue;
      }

      // Numbered Lists: 1. Item
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
          i++;
        }
        blocks.push({ type: "ordered-list", items: listItems, id: `ol-${i}` });
        continue;
      }

      // Paragraph
      const paragraphLines = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().startsWith("#") &&
        !lines[i].trim().startsWith(">") &&
        !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) &&
        !/^[-*]\s+/.test(lines[i].trim()) &&
        !/^\d+\.\s+/.test(lines[i].trim()) &&
        lines[i].trim() !== "---" &&
        lines[i].trim() !== "***"
      ) {
        paragraphLines.push(lines[i].trim());
        i++;
      }
      blocks.push({ type: "paragraph", text: paragraphLines.join(" "), id: `p-${i}` });
    }

    return blocks;
  };

  const blocks = parseBlocks(content);

  return (
    <div className={`space-y-4 font-sans text-slate-800 text-xs leading-relaxed ${className}`}>
      {blocks.map((block) => {
        switch (block.type) {
          case "heading": {
            if (block.level === 1) {
              return (
                <h1 key={block.id} className="text-xl font-extrabold text-slate-900 tracking-tight pt-3 pb-2 border-b border-slate-200">
                  {renderFormattedInlineText(block.text)}
                </h1>
              );
            }
            if (block.level === 2) {
              return (
                <h2 key={block.id} className="text-base font-bold text-slate-900 tracking-tight pt-3 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-teal-500 rounded-full inline-block"></span>
                  <span>{renderFormattedInlineText(block.text)}</span>
                </h2>
              );
            }
            return (
              <h3 key={block.id} className="text-xs font-bold text-teal-800 uppercase tracking-wider pt-2.5 pb-0.5">
                {renderFormattedInlineText(block.text)}
              </h3>
            );
          }

          case "paragraph":
            return (
              <p key={block.id} className="text-slate-700 font-medium leading-relaxed">
                {renderFormattedInlineText(block.text)}
              </p>
            );

          case "unordered-list":
            return (
              <ul key={block.id} className="space-y-1.5 my-2 pl-4 list-disc marker:text-teal-500 text-slate-700 font-medium">
                {block.items.map((item, idx) => (
                  <li key={idx} className="pl-1">
                    {renderFormattedInlineText(item)}
                  </li>
                ))}
              </ul>
            );

          case "ordered-list":
            return (
              <ol key={block.id} className="space-y-1.5 my-2 pl-4 list-decimal marker:text-teal-600 marker:font-bold text-slate-700 font-medium">
                {block.items.map((item, idx) => (
                  <li key={idx} className="pl-1">
                    {renderFormattedInlineText(item)}
                  </li>
                ))}
              </ol>
            );

          case "blockquote":
            return (
              <blockquote key={block.id} className="p-3.5 my-3 bg-teal-50/70 border-l-4 border-teal-500 rounded-r-xl text-xs text-teal-900 font-medium italic shadow-2xs">
                {renderFormattedInlineText(block.text)}
              </blockquote>
            );

          case "table":
            return (
              <div key={block.id} className="my-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                      {block.header.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-3.5">
                          {renderFormattedInlineText(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-3.5 text-slate-700 font-medium">
                            {renderFormattedInlineText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "hr":
            return <hr key={block.id} className="my-4 border-slate-200" />;

          default:
            return null;
        }
      })}
    </div>
  );
}
