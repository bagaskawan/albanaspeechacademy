export type ArticleInline =
  | { type: "text"; text: string; styles?: Record<string, boolean> }
  | { type: "link"; href: string; content: ArticleInline[] };

export type ArticleBlockType = "paragraph" | "heading" | "bulletListItem" | "numberedListItem" | "quote";

export type ArticleBlock = {
  type: ArticleBlockType;
  props?: { level?: 1 | 2 | 3 | 4 | 5 | 6 };
  content?: ArticleInline[];
  children?: ArticleBlock[];
};

const BLOCK_TYPES: ArticleBlockType[] = ["paragraph", "heading", "bulletListItem", "numberedListItem", "quote"];
const STYLE_KEYS = ["bold", "italic", "underline", "strike", "code"];
const MAX_DEPTH = 4;
const MAX_BLOCKS = 1000;
const MAX_TITLE = 200;
const MAX_EXCERPT = 400;

/** Only absolute web and mail links reach the public article renderer. */
export function safeArticleHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (href.length > 2048) return null;
  return /^https?:\/\/[^\s]+$/i.test(href) || /^mailto:[^\s]+$/i.test(href) ? href : null;
}

function normalizeInline(value: unknown): ArticleInline[] | null {
  if (!Array.isArray(value)) return null;
  const nodes: ArticleInline[] = [];
  for (const node of value) {
    if (!node || typeof node !== "object") return null;
    const item = node as Record<string, unknown>;
    if (item.type === "text") {
      if (typeof item.text !== "string" || item.text.length > 20000) return null;
      const source = item.styles && typeof item.styles === "object" ? (item.styles as Record<string, unknown>) : {};
      const styles: Record<string, boolean> = {};
      for (const key of STYLE_KEYS) if (source[key] === true) styles[key] = true;
      nodes.push({ type: "text", text: item.text, ...(Object.keys(styles).length ? { styles } : {}) });
    } else if (item.type === "link") {
      const href = safeArticleHref(item.href);
      const content = normalizeInline(item.content);
      if (!href || !content) return null;
      nodes.push({ type: "link", href, content });
    } else {
      return null;
    }
  }
  return nodes;
}

function normalizeBlocks(value: unknown, depth: number): ArticleBlock[] | null {
  if (!Array.isArray(value) || depth > MAX_DEPTH) return null;
  const blocks: ArticleBlock[] = [];
  for (const node of value) {
    if (blocks.length >= MAX_BLOCKS || !node || typeof node !== "object") return null;
    const item = node as Record<string, unknown>;
    if (!BLOCK_TYPES.includes(item.type as ArticleBlockType)) return null;
    const type = item.type as ArticleBlockType;
    let content: ArticleInline[] | undefined;
    if (item.content !== null && item.content !== undefined) {
      const parsed = normalizeInline(item.content);
      if (!parsed) return null;
      content = parsed;
    }
    let children: ArticleBlock[] | undefined;
    if (item.children !== undefined) {
      const parsed = normalizeBlocks(item.children, depth + 1);
      if (!parsed) return null;
      children = parsed;
    }

    if (type === "heading") {
      const level = (item.props as Record<string, unknown> | undefined)?.level;
      if (typeof level !== "number" || level < 1 || level > 6 || !Number.isInteger(level)) return null;
      blocks.push({ type, props: { level: level as 1 | 2 | 3 | 4 | 5 | 6 }, content, children });
    } else {
      blocks.push({ type, content, children });
    }
  }
  return blocks;
}

/** Returns null blocks when the article only has legacy text, and an error when stored JSON is invalid. */
export function normalizeArticleBlocks(value: unknown): { blocks: ArticleBlock[] | null; error: string | null } {
  if (value === null || value === undefined) return { blocks: null, error: null };
  const blocks = normalizeBlocks(value, 1);
  return blocks ? { blocks, error: null } : { blocks: null, error: "Isi artikel tidak dapat dibaca. Periksa format blok." };
}

export function inlineText(content: ArticleInline[] | undefined): string {
  return (content ?? [])
    .map((node) => (node.type === "text" ? node.text : inlineText(node.content)))
    .join("");
}

export function articleHasText(blocks: ArticleBlock[]): boolean {
  return blocks.some((block) => inlineText(block.content).trim().length > 0 || (block.children ? articleHasText(block.children) : false));
}

/** The first block is the title line; the rest is the article body. */
export function splitTitleBlock(blocks: ArticleBlock[]): { title: string; blocks: ArticleBlock[] } {
  if (!blocks.length) return { title: "", blocks: [] };
  const [first, ...rest] = blocks;
  return {
    title: inlineText(first.content).trim().slice(0, MAX_TITLE),
    blocks: [...(first.children ?? []), ...rest],
  };
}

export function titleBlock(title: string): ArticleBlock {
  return { type: "paragraph", content: [{ type: "text", text: title }] };
}

/** First non-empty line after the title becomes the list/dek summary. */
export function deriveExcerpt(blocks: ArticleBlock[]): string {
  for (const block of blocks) {
    const text = inlineText(block.content).replace(/\s+/g, " ").trim();
    if (text) return text.slice(0, MAX_EXCERPT);
    const nested = block.children ? deriveExcerpt(block.children) : "";
    if (nested) return nested;
  }
  return "";
}


export function articleBlocksToText(blocks: ArticleBlock[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    const text = inlineText(block.content);
    if (block.type === "heading") lines.push(`${"#".repeat(Math.min(block.props?.level ?? 1, 3))} ${text}`);
    else if (block.type === "bulletListItem") lines.push(`- ${text}`);
    else if (block.type === "numberedListItem") lines.push(`1. ${text}`);
    else if (block.type === "quote") lines.push(`> ${text}`);
    else lines.push(text);
    if (block.children?.length) lines.push(articleBlocksToText(block.children));
  }
  return lines.join("\n\n").trim();
}

/** Converts the legacy text/Markdown body so old articles open in the block editor. */
export function legacyBodyToBlocks(body: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  for (const chunk of body.trim().split(/\n\s*\n/)) {
    if (!chunk.trim()) continue;
    const lines = chunk.split("\n");
    const heading = /^(#{1,3})\s+(.+)$/.exec(chunk);
    if (heading && lines.length === 1) {
      blocks.push({ type: "heading", props: { level: heading[1].length as 1 | 2 | 3 }, content: [{ type: "text", text: heading[2] }] });
    } else if (lines.every((line) => /^-\s+/.test(line))) {
      for (const line of lines) blocks.push({ type: "bulletListItem", content: [{ type: "text", text: line.slice(2) }] });
    } else {
      blocks.push({ type: "paragraph", content: [{ type: "text", text: chunk }] });
    }
  }
  return blocks;
}

export function validateArticleMeta(title: unknown, excerpt: unknown) {
  const fields: Record<string, string> = {};
  const cleanTitle = typeof title === "string" ? title.trim() : "";
  const cleanExcerpt = typeof excerpt === "string" ? excerpt.trim() : "";
  if (!cleanTitle) fields.title = "Judul wajib diisi.";
  else if (cleanTitle.length > MAX_TITLE) fields.title = `Judul maksimal ${MAX_TITLE} karakter.`;
  if (!cleanExcerpt) fields.excerpt = "Ringkasan wajib diisi.";
  else if (cleanExcerpt.length > MAX_EXCERPT) fields.excerpt = `Ringkasan maksimal ${MAX_EXCERPT} karakter.`;
  return { title: cleanTitle, excerpt: cleanExcerpt, fields };
}
