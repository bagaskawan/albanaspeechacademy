"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { useEffect, useState } from "react";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { ArticleBlock } from "@/lib/article-blocks";

/** Only block types the public renderer supports exist in this schema. */
const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    quote: defaultBlockSpecs.quote,
  },
  inlineContentSpecs: {
    text: defaultInlineContentSpecs.text,
    link: defaultInlineContentSpecs.link,
  },
  styleSpecs: {
    bold: defaultStyleSpecs.bold,
    italic: defaultStyleSpecs.italic,
    underline: defaultStyleSpecs.underline,
    strike: defaultStyleSpecs.strike,
    code: defaultStyleSpecs.code,
  },
});

const SLASH_TITLES = new Set(["paragraph", "heading 1", "heading 2", "heading 3", "bullet list", "numbered list", "quote"]);

export default function ArticleBlockEditor({
  initialBlocks,
  onChange,
  getBlocksRef,
}: {
  initialBlocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  /** Lets the parent read the live document at save/preview time. */
  getBlocksRef: { current: (() => ArticleBlock[]) | null };
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const editor = useCreateBlockNote({
    schema,
    initialContent: initialBlocks.length ? (initialBlocks as never) : undefined,
    trailingBlock: false,
  });

  useEffect(() => {
    getBlocksRef.current = () => editor.document as unknown as ArticleBlock[];
    return () => {
      getBlocksRef.current = null;
    };
  }, [editor, getBlocksRef]);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="article-editor">
      <BlockNoteView
        editor={editor}
        theme={theme}
        slashMenu={false}
        onChange={() => onChange(editor.document as unknown as ArticleBlock[])}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(
              getDefaultReactSlashMenuItems(editor).filter((item) => SLASH_TITLES.has(item.title.toLowerCase())),
              query,
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}
