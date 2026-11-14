import type { ReactNode } from "react";
import {
  normalizeArticleBlocks,
  safeArticleHref,
  type ArticleBlock,
  type ArticleInline,
} from "@/lib/article-blocks";

const inlineStyles: Record<string, string> = {
  bold: "font-semibold",
  italic: "italic",
  underline: "underline underline-offset-2",
  strike: "line-through",
  code: "rounded bg-bg-well px-1 py-0.5 font-mono text-[0.9em]",
};

function StyledText({ node }: { node: Extract<ArticleInline, { type: "text" }> }) {
  return (
    <span className={Object.keys(node.styles ?? {}).map((key) => inlineStyles[key]).filter(Boolean).join(" ")}>
      {node.text}
    </span>
  );
}

function renderInline(content: ArticleInline[] | undefined): ReactNode {
  return (content ?? []).map((node, index) => {
    if (node.type === "text") return <StyledText key={index} node={node} />;
    return (
      <a key={index} href={safeArticleHref(node.href) ?? undefined} className="underline underline-offset-4" rel="noopener noreferrer">
        {renderInline(node.content)}
      </a>
    );
  });
}

const headingClass: Record<number, string> = {
  1: "font-display text-3xl font-semibold",
  2: "font-display text-2xl font-semibold",
  3: "font-display text-xl font-semibold",
  4: "font-display text-lg font-semibold",
  5: "font-display text-base font-semibold",
  6: "font-display text-base font-semibold",
};

const headingTag: Record<number, "h2" | "h3" | "h4" | "h5" | "h6"> = {
  1: "h2",
  2: "h3",
  3: "h4",
  4: "h5",
  5: "h6",
  6: "h6",
};

function renderBlocks(blocks: ArticleBlock[]): ReactNode {
  const output: ReactNode[] = [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (block.type === "bulletListItem" || block.type === "numberedListItem") {
      const listType = block.type;
      const items: ArticleBlock[] = [];
      while (index < blocks.length && blocks[index].type === listType) {
        items.push(blocks[index]);
        index += 1;
      }
      index -= 1;
      output.push(
        listType === "numberedListItem" ? (
          <ol key={`list-${index}`} className="list-decimal space-y-2 pl-6">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {renderInline(item.content)}
                {item.children?.length ? renderBlocks(item.children) : null}
              </li>
            ))}
          </ol>
        ) : (
          <ul key={`list-${index}`} className="list-disc space-y-2 pl-6">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {renderInline(item.content)}
                {item.children?.length ? renderBlocks(item.children) : null}
              </li>
            ))}
          </ul>
        ),
      );
      continue;
    }

    if (block.type === "heading") {
      const level = block.props?.level ?? 1;
      const Tag = headingTag[level] ?? "h2";
      output.push(
        <Tag key={index} className={headingClass[level] ?? headingClass[1]}>
          {renderInline(block.content)}
        </Tag>,
      );
    } else if (block.type === "quote") {
      output.push(
        <blockquote key={index} className="border-l-2 border-rule pl-5 text-muted italic">
          {renderInline(block.content)}
          {block.children?.length ? renderBlocks(block.children) : null}
        </blockquote>,
      );
    } else {
      output.push(
        <p key={index} className="whitespace-pre-wrap">
          {renderInline(block.content)}
        </p>,
      );
    }

    if (block.children?.length) output.push(<div key={`children-${index}`}>{renderBlocks(block.children)}</div>);
  }
  return output;
}

function LegacyBody({ body }: { body: string }) {
  const blocks = body.trim().split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        const heading = /^(#{1,3})\s+(.+)$/.exec(block);
        if (heading && lines.length === 1) {
          const className = "font-display text-2xl font-semibold";
          return heading[1].length === 1 ? (
            <h2 className={className} key={index}>{heading[2]}</h2>
          ) : (
            <h3 className={className} key={index}>{heading[2]}</h3>
          );
        }
        if (lines.every((line) => /^-\s+/.test(line))) {
          return (
            <ul className="list-disc space-y-2 pl-6" key={index}>
              {lines.map((line, position) => <li key={position}>{line.slice(2)}</li>)}
            </ul>
          );
        }
        return <p className="whitespace-pre-wrap" key={index}>{block}</p>;
      })}
    </>
  );
}

export function ArticleBody({ body, blocks }: { body: string; blocks?: unknown }) {
  const normalized = normalizeArticleBlocks(blocks);
  const content = normalized.blocks?.length ? renderBlocks(normalized.blocks) : <LegacyBody body={body} />;
  return <div className="mt-10 space-y-6 text-lg leading-[1.65] break-words">{content}</div>;
}
