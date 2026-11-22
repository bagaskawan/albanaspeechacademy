import type { ReactNode } from "react";
import {
  extractArticleImageId,
  normalizeArticleBlocks,
  safeArticleHref,
  type ArticleBlock,
  type ArticleInline,
} from "@/lib/article-blocks";
import type { ArticleImageDimensions } from "@/lib/server/public-articles";
import { ArticleInlineImage } from "./article-inline-image";

const inlineStyles: Record<string, string> = {
  bold: "font-semibold",
  italic: "italic",
  underline: "underline underline-offset-2",
  strike: "line-through",
  code: "rounded bg-[#F3F7FC] px-1 py-0.5 font-mono text-[0.9em]",
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
      <a key={index} href={safeArticleHref(node.href) ?? undefined} rel="noopener noreferrer">
        {renderInline(node.content)}
      </a>
    );
  });
}

const headingTag: Record<number, "h2" | "h3" | "h4"> = {
  1: "h2",
  2: "h3",
  3: "h4",
};

function renderBlocks(
  blocks: ArticleBlock[],
  dimensions: Record<string, ArticleImageDimensions>,
  seenFirstImage: { value: boolean },
): ReactNode {
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
          <ol key={`list-${index}`}>
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {renderInline(item.content)}
                {item.children?.length ? renderBlocks(item.children, dimensions, seenFirstImage) : null}
              </li>
            ))}
          </ol>
        ) : (
          <ul key={`list-${index}`}>
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {renderInline(item.content)}
                {item.children?.length ? renderBlocks(item.children, dimensions, seenFirstImage) : null}
              </li>
            ))}
          </ul>
        ),
      );
      continue;
    }

    if (block.type === "image" && block.props && "url" in block.props) {
      const id = extractArticleImageId(block.props.url);
      const dims = (id && dimensions[id]) || { width: 1600, height: 900 };
      const alt = block.props.alt?.trim() || "";
      const caption = block.props.caption?.trim() || "";
      const isFirst = !seenFirstImage.value;
      seenFirstImage.value = true;
      const eager = isFirst && index < 3;

      output.push(
        <figure key={`img-${index}`} className="-mx-4 w-[calc(100%+2rem)] max-w-none md:mx-0 md:w-full">
          <ArticleInlineImage
            src={block.props.url}
            alt={alt}
            width={dims.width}
            height={dims.height}
            eager={eager}
          />
          {caption ? <figcaption className="px-4 md:px-0">{caption}</figcaption> : null}
        </figure>,
      );
      continue;
    }

    if (block.type === "heading") {
      const rawLevel = block.props && "level" in block.props ? (block.props.level ?? 1) : 1;
      const Tag = headingTag[rawLevel] ?? "h2";
      output.push(<Tag key={index}>{renderInline(block.content)}</Tag>);
    } else if (block.type === "quote") {
      output.push(
        <blockquote key={index}>
          {renderInline(block.content)}
          {block.children?.length ? renderBlocks(block.children, dimensions, seenFirstImage) : null}
        </blockquote>,
      );
    } else {
      output.push(
        <p key={index} className="whitespace-pre-wrap">
          {renderInline(block.content)}
        </p>,
      );
    }

    if (block.children?.length) {
      output.push(<div key={`children-${index}`}>{renderBlocks(block.children, dimensions, seenFirstImage)}</div>);
    }
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
          return heading[1].length === 1 ? <h2 key={index}>{heading[2]}</h2> : <h3 key={index}>{heading[2]}</h3>;
        }
        if (lines.every((line) => /^-\s+/.test(line))) {
          return (
            <ul key={index}>
              {lines.map((line, position) => (
                <li key={position}>{line.slice(2)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p className="whitespace-pre-wrap" key={index}>
            {block}
          </p>
        );
      })}
    </>
  );
}

export function ArticleBody({
  body,
  blocks,
  dimensions = {},
}: {
  body: string;
  blocks?: unknown;
  dimensions?: Record<string, ArticleImageDimensions>;
}) {
  const normalized = normalizeArticleBlocks(blocks);
  const content = normalized.blocks?.length
    ? renderBlocks(normalized.blocks, dimensions, { value: false })
    : <LegacyBody body={body} />;
  return <div className="article-prose mt-8">{content}</div>;
}
