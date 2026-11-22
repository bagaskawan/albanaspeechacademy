"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
  blockTypeSelectItems,
  createReactBlockSpec,
  useBlockNoteEditor,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import {
  Bold,
  ChevronDown,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Plus,
  Quote,
  RefreshCw,
  Trash2,
  Type,
  X,
} from "lucide-react";
import type { ArticleBlock } from "@/lib/article-blocks";
import { canonicalArticleImageUrl, safeArticleHref } from "@/lib/article-blocks";
import { uploadArticleImage } from "@/lib/article-image-upload";

const ALLOWED_BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "bulletListItem",
  "numberedListItem",
  "quote",
]);

type UploadTracker = {
  increment: () => void;
  decrement: () => void;
};

const uploadTrackerRef: { current: UploadTracker | null } = { current: null };

function ArticleImageBlockView({
  block,
  editor,
}: {
  block: { id: string; props: { url: string; alt: string; caption: string } };
  editor: ReturnType<typeof useBlockNoteEditor>;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const altInputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selected, setSelected] = useState(false);
  const [showAltInput, setShowAltInput] = useState(false);

  const canonicalUrl = canonicalArticleImageUrl(block.props.url);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    const checkSelection = () => {
      try {
        const pos = editor.getTextCursorPosition();
        setSelected(pos.block.id === block.id);
      } catch {
        setSelected(false);
      }
    };
    checkSelection();
    return editor.onSelectionChange(checkSelection);
  }, [editor, block.id]);

  const startUpload = useCallback(
    async (file: File) => {
      setLastFile(file);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const previewUrl = URL.createObjectURL(file);
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return previewUrl;
      });
      setUploadError(null);
      setUploading(true);
      uploadTrackerRef.current?.increment();

      try {
        const uploaded = await uploadArticleImage(file, "inline", controller.signal);
        editor.updateBlock(block.id, {
          props: { url: uploaded.url },
        } as never);
        setLocalPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } catch (err) {
        if (controller.signal.aborted) {
          setLocalPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          return;
        }
        setUploadError(err instanceof Error ? err.message : "Gambar gagal diunggah. Coba lagi.");
      } finally {
        setUploading(false);
        uploadTrackerRef.current?.decrement();
      }
    },
    [block.id, editor],
  );

  const cancelUpload = () => {
    abortRef.current?.abort();
    setUploading(false);
    setUploadError(null);
    if (!canonicalUrl) {
      editor.removeBlocks([block.id]);
    }
  };

  const removeBlock = () => {
    abortRef.current?.abort();
    editor.removeBlocks([block.id]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void startUpload(file);
  };

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="sr-only"
      onChange={handleFileChange}
    />
  );

  if (uploading && localPreview) {
    return (
      <div className="my-6 overflow-hidden rounded border border-admin-line bg-admin-surface p-3" contentEditable={false}>
        {fileInput}
        <div className="relative overflow-hidden rounded">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={localPreview} alt="" className="max-h-96 w-full object-contain opacity-50" />
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-admin-line">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-admin-ink" />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[13px] text-admin-text-secondary">
          <span>Mengoptimalkan gambar…</span>
          <button
            type="button"
            onClick={cancelUpload}
            className="min-h-[36px] rounded px-2.5 text-xs font-medium text-admin-ink hover:bg-admin-surface-muted"
          >
            Batal
          </button>
        </div>
      </div>
    );
  }

  if (uploadError) {
    return (
      <div
        role="alert"
        className="my-6 overflow-hidden rounded border border-admin-rose-ink/40 bg-admin-rose-soft/30 p-3"
        contentEditable={false}
      >
        {fileInput}
        {localPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={localPreview} alt="" className="mb-3 max-h-64 w-full rounded object-contain opacity-60" />
        ) : null}
        <p className="text-[13px] font-medium text-admin-rose-ink">{uploadError}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {lastFile ? (
            <button
              type="button"
              onClick={() => void startUpload(lastFile)}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded border border-admin-line bg-admin-canvas px-3 text-xs font-medium text-admin-ink hover:bg-admin-surface"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Coba lagi
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded border border-admin-line bg-admin-canvas px-3 text-xs font-medium text-admin-ink hover:bg-admin-surface"
          >
            Ganti file
          </button>
          <button
            type="button"
            onClick={removeBlock}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded px-2.5 text-xs font-medium text-admin-text-secondary hover:bg-admin-surface"
          >
            Hapus
          </button>
        </div>
      </div>
    );
  }

  if (!canonicalUrl) {
    return (
      <div
        className="my-6 flex h-40 flex-col items-center justify-center gap-2 rounded border border-dashed border-admin-line bg-admin-surface/60 px-4 text-center"
        contentEditable={false}
      >
        {fileInput}
        <ImageIcon className="h-6 w-6 text-admin-text-secondary" aria-hidden="true" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[44px] rounded-md border border-admin-line bg-admin-canvas px-4 text-sm font-medium text-admin-ink hover:bg-admin-surface"
        >
          Pilih gambar
        </button>
        <p className="text-xs text-admin-text-secondary">JPEG, PNG, atau WebP. Maks. 10 MB.</p>
      </div>
    );
  }

  const missingAlt = !block.props.alt.trim();

  return (
    <figure
      data-article-image-block={block.id}
      data-missing-alt={missingAlt ? "true" : "false"}
      className="my-6 select-none"
      contentEditable={false}
      onClick={() => {
        editor.setTextCursorPosition(block.id, "end");
        setSelected(true);
      }}
    >
      {fileInput}
      <div className={`relative overflow-hidden rounded ${selected ? "ring-2 ring-[#26599A] ring-offset-2" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={canonicalUrl} alt={block.props.alt} className="w-full rounded object-contain" />
        {missingAlt ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAltInput(true);
              setTimeout(() => altInputRef.current?.focus(), 0);
            }}
            className="absolute left-2.5 top-2.5 rounded bg-amber-950/85 px-2 py-1 text-[11px] font-medium text-amber-100"
          >
            Alt belum diisi
          </button>
        ) : null}
        {selected ? (
          <div className="absolute right-2.5 top-2.5 hidden items-center gap-1 rounded-md border border-admin-line bg-admin-canvas/95 p-1 shadow-sm md:flex">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="rounded px-2.5 py-1 text-xs font-medium text-admin-ink hover:bg-admin-surface"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAltInput((v) => !v);
                setTimeout(() => altInputRef.current?.focus(), 0);
              }}
              className="rounded px-2.5 py-1 text-xs font-medium text-admin-ink hover:bg-admin-surface"
            >
              Teks alternatif
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeBlock();
              }}
              aria-label="Hapus gambar"
              className="rounded p-1.5 text-admin-rose-ink hover:bg-admin-rose-soft/40"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <input
        type="text"
        value={block.props.caption}
        maxLength={500}
        placeholder="Tulis keterangan (opsional)"
        aria-label="Keterangan gambar"
        onChange={(e) =>
          editor.updateBlock(block.id, {
            props: { caption: e.target.value },
          } as never)
        }
        className="mt-2.5 w-full border-0 bg-transparent text-center text-[14px] font-medium leading-normal text-[#47607D] placeholder:text-[#47607D]/60 focus:outline-none"
      />

      {selected || showAltInput ? (
        <div className="mt-2 rounded-md border border-admin-line bg-admin-surface p-3">
          <label className="block text-xs font-semibold text-admin-ink" htmlFor={`alt-${block.id}`}>
            Teks alternatif
          </label>
          <input
            ref={altInputRef}
            id={`alt-${block.id}`}
            type="text"
            value={block.props.alt}
            maxLength={250}
            placeholder="Contoh: Peserta berlatih intonasi di depan kelas"
            onChange={(e) =>
              editor.updateBlock(block.id, {
                props: { alt: e.target.value },
              } as never)
            }
            className="mt-1.5 w-full rounded border border-admin-line bg-admin-canvas px-2.5 py-1.5 text-sm text-admin-ink focus:border-[#26599A] focus:outline-none"
          />
          <p className="mt-1 text-xs text-admin-text-secondary">
            Jelaskan isi gambar untuk pembaca yang tidak dapat melihatnya. Maks. 250 karakter.
          </p>
        </div>
      ) : null}
    </figure>
  );
}

const ArticleImageBlock = createReactBlockSpec(
  {
    type: "image",
    propSchema: {
      url: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => <ArticleImageBlockView block={props.block as never} editor={props.editor as never} />,
  },
);

const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    quote: defaultBlockSpecs.quote,
    image: ArticleImageBlock(),
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

function serializeBlocks(rawBlocks: unknown[]): ArticleBlock[] {
  const out: ArticleBlock[] = [];
  for (const raw of rawBlocks) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    const type = item.type;
    const children = Array.isArray(item.children) ? serializeBlocks(item.children) : undefined;
    if (type === "image") {
      const props = (item.props ?? {}) as Record<string, unknown>;
      const url = canonicalArticleImageUrl(props.url);
      if (!url) continue;
      const alt = typeof props.alt === "string" ? props.alt.trim() : "";
      const caption = typeof props.caption === "string" ? props.caption.trim() : "";
      out.push({
        type: "image",
        props: { url, ...(alt ? { alt } : {}), ...(caption ? { caption } : {}) },
        ...(children?.length ? { children } : {}),
      });
      continue;
    }
    if (typeof type === "string" && ALLOWED_BLOCK_TYPES.has(type)) {
      out.push({
        type: type as ArticleBlock["type"],
        ...(item.props ? { props: item.props as ArticleBlock["props"] } : {}),
        ...(Array.isArray(item.content) ? { content: item.content as ArticleBlock["content"] } : {}),
        ...(children?.length ? { children } : {}),
      });
    }
  }
  return out;
}

export type ArticleBlockEditorHandle = {
  focusStart: () => void;
  focusFirstMissingAlt: () => void;
};

export default function ArticleBlockEditor({
  initialBlocks,
  onChange,
  getBlocksRef,
  onUploadingChange,
  editorHandleRef,
}: {
  initialBlocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  getBlocksRef: { current: (() => ArticleBlock[]) | null };
  onUploadingChange?: (count: number) => void;
  editorHandleRef?: { current: ArticleBlockEditorHandle | null };
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [uploadingCount, setUploadingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [viewportStyle, setViewportStyle] = useState<{ bottom: number; keyboardOpen: boolean }>({
    bottom: 0,
    keyboardOpen: false,
  });
  const mobileImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    uploadTrackerRef.current = {
      increment: () => setUploadingCount((c) => c + 1),
      decrement: () => setUploadingCount((c) => Math.max(0, c - 1)),
    };
    return () => {
      uploadTrackerRef.current = null;
    };
  }, []);

  useEffect(() => {
    onUploadingChange?.(uploadingCount);
  }, [uploadingCount, onUploadingChange]);

  const editor = useCreateBlockNote({
    schema,
    initialContent: initialBlocks.length ? (initialBlocks as never) : undefined,
    trailingBlock: false,
    uploadFile: async (file: File) => {
      setUploadingCount((c) => c + 1);
      try {
        const uploaded = await uploadArticleImage(file, "inline");
        return uploaded.url;
      } finally {
        setUploadingCount((c) => Math.max(0, c - 1));
      }
    },
  });

  useEffect(() => {
    getBlocksRef.current = () => serializeBlocks(editor.document as unknown[]);
    return () => {
      getBlocksRef.current = null;
    };
  }, [editor, getBlocksRef]);

  useEffect(() => {
    if (!editorHandleRef) return;
    editorHandleRef.current = {
      focusStart: () => {
        editor.focus();
      },
      focusFirstMissingAlt: () => {
        const el = document.querySelector<HTMLElement>('[data-missing-alt="true"]');
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.click();
        }
      },
    };
    return () => {
      editorHandleRef.current = null;
    };
  }, [editor, editorHandleRef]);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Track selected block to switch mobile toolbar into image mode when an image is selected.
  useEffect(() => {
    return editor.onSelectionChange(() => {
      try {
        const pos = editor.getTextCursorPosition();
        setSelectedImageId(pos.block.type === "image" ? pos.block.id : null);
      } catch {
        setSelectedImageId(null);
      }
    });
  }, [editor]);

  // Anchor mobile format toolbar above virtual keyboard using visualViewport.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setViewportStyle({ bottom: keyboardHeight, keyboardOpen: keyboardHeight > 80 });
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // Keep cursor visible above mobile toolbar (24px threshold -> 96px margin).
  const ensureCursorVisible = useCallback(() => {
    if (window.innerWidth >= 768) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (!rect || (rect.top === 0 && rect.bottom === 0)) return;
    const vvHeight = window.visualViewport?.height ?? window.innerHeight;
    const toolbarTop = vvHeight - 48;
    if (toolbarTop - rect.bottom < 24) {
      window.scrollBy({ top: rect.bottom - (toolbarTop - 96), behavior: "smooth" });
    }
  }, []);

  const insertImageFile = async (file: File) => {
    setUploadingCount((c) => c + 1);
    try {
      const uploaded = await uploadArticleImage(file, "inline");
      const current = editor.getTextCursorPosition().block;
      editor.insertBlocks([{ type: "image", props: { url: uploaded.url, alt: "", caption: "" } } as never], current, "after");
    } finally {
      setUploadingCount((c) => Math.max(0, c - 1));
    }
  };

  const slashItems = [
    {
      title: "Paragraf",
      subtext: "Teks biasa",
      aliases: ["paragraph", "text", "p"],
      group: "Blok",
      icon: <Type className="h-4 w-4" />,
      onItemClick: () => {
        const block = editor.getTextCursorPosition().block;
        editor.updateBlock(block, { type: "paragraph" });
      },
    },
    {
      title: "Heading 1",
      subtext: "Judul bagian besar",
      aliases: ["h1", "h2", "heading", "judul"],
      group: "Blok",
      icon: <Heading2 className="h-4 w-4" />,
      onItemClick: () => {
        const block = editor.getTextCursorPosition().block;
        editor.updateBlock(block, { type: "heading", props: { level: 1 } });
      },
    },
    {
      title: "Heading 2",
      subtext: "Subjudul bagian",
      aliases: ["h2", "h3", "subjudul"],
      group: "Blok",
      icon: <Heading3 className="h-4 w-4" />,
      onItemClick: () => {
        const block = editor.getTextCursorPosition().block;
        editor.updateBlock(block, { type: "heading", props: { level: 2 } });
      },
    },
    {
      title: "Heading 3",
      subtext: "Subjudul kecil",
      aliases: ["h3", "h4"],
      group: "Blok",
      icon: <Heading3 className="h-4 w-4" />,
      onItemClick: () => {
        const block = editor.getTextCursorPosition().block;
        editor.updateBlock(block, { type: "heading", props: { level: 3 } });
      },
    },
    {
      title: "Daftar berpoin",
      subtext: "Daftar poin tanpa nomor",
      aliases: ["bullet", "ul", "list"],
      group: "Blok",
      icon: <List className="h-4 w-4" />,
      onItemClick: () => {
        const block = editor.getTextCursorPosition().block;
        editor.updateBlock(block, { type: "bulletListItem" });
      },
    },
    {
      title: "Daftar bernomor",
      subtext: "Daftar berurutan",
      aliases: ["numbered", "ol", "list"],
      group: "Blok",
      icon: <ListOrdered className="h-4 w-4" />,
      onItemClick: () => {
        const block = editor.getTextCursorPosition().block;
        editor.updateBlock(block, { type: "numberedListItem" });
      },
    },
    {
      title: "Kutipan",
      subtext: "Blok kutipan",
      aliases: ["quote", "blockquote"],
      group: "Blok",
      icon: <Quote className="h-4 w-4" />,
      onItemClick: () => {
        const block = editor.getTextCursorPosition().block;
        editor.updateBlock(block, { type: "quote" });
      },
    },
    {
      title: "Gambar",
      subtext: "Unggah foto atau ilustrasi",
      aliases: ["image", "img", "foto", "picture"],
      group: "Media",
      icon: <ImageIcon className="h-4 w-4" />,
      onItemClick: () => {
        const block = editor.getTextCursorPosition().block;
        editor.insertBlocks([{ type: "image", props: { url: "", alt: "", caption: "" } } as never], block, "after");
      },
    },
  ];

  const allowedBlockSelect = blockTypeSelectItems(editor.dictionary).filter((item) =>
    ["Paragraph", "Heading 1", "Heading 2", "Heading 3", "Bullet List", "Numbered List", "Quote"].includes(item.name),
  );

  const applyLink = () => {
    const safe = safeArticleHref(linkUrl);
    if (!safe) {
      setLinkError("Gunakan tautan https://, http://, atau mailto:.");
      return;
    }
    editor.createLink(safe);
    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkError(null);
  };

  return (
    <div className="article-editor article-prose pb-16 md:pb-0">
      <input
        ref={mobileImageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void insertImageFile(file);
        }}
      />

      <BlockNoteView
        editor={editor}
        theme={theme}
        slashMenu={false}
        formattingToolbar={false}
        onChange={() => {
          onChange(serializeBlocks(editor.document as unknown[]));
          ensureCursorVisible();
        }}
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key="blockTypeSelect" items={allowedBlockSelect} />
              <BasicTextStyleButton key="bold" basicTextStyle="bold" />
              <BasicTextStyleButton key="italic" basicTextStyle="italic" />
              <BasicTextStyleButton key="underline" basicTextStyle="underline" />
              <BasicTextStyleButton key="strike" basicTextStyle="strike" />
              <BasicTextStyleButton key="code" basicTextStyle="code" />
              <CreateLinkButton key="link" />
            </FormattingToolbar>
          )}
        />
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => filterSuggestionItems(slashItems, query)}
        />
      </BlockNoteView>

      {/* Mobile bottom format toolbar (§B.4) */}
      <div
        className="fixed inset-x-0 z-30 border-t border-admin-line bg-admin-canvas md:hidden"
        style={{
          bottom: `${viewportStyle.bottom}px`,
          paddingBottom: viewportStyle.keyboardOpen ? "0px" : "env(safe-area-inset-bottom)",
        }}
      >
        {mobileMenuOpen ? (
          <div className="flex items-center gap-1 overflow-x-auto border-b border-admin-line bg-admin-surface px-2 py-1.5">
            {slashItems.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  item.onItemClick();
                  setMobileMenuOpen(false);
                }}
                className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded px-2.5 text-xs font-medium text-admin-ink hover:bg-admin-canvas"
              >
                {item.icon}
                {item.title}
              </button>
            ))}
          </div>
        ) : null}

        {selectedImageId ? (
          <div className="flex h-12 items-center justify-between gap-2 px-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => mobileImageInputRef.current?.click()}
                className="min-h-[36px] rounded border border-admin-line px-3 text-xs font-medium text-admin-ink"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={() => document.getElementById(`alt-${selectedImageId}`)?.focus()}
                className="min-h-[36px] rounded border border-admin-line px-3 text-xs font-medium text-admin-ink"
              >
                Teks alternatif
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                editor.removeBlocks([selectedImageId]);
                setSelectedImageId(null);
              }}
              className="min-h-[36px] rounded px-3 text-xs font-medium text-admin-rose-ink"
            >
              Hapus
            </button>
          </div>
        ) : (
          <div className="flex h-12 items-center gap-1 overflow-x-auto px-2">
            <button
              type="button"
              aria-label="Tambah blok"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-ink hover:bg-admin-surface"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Tebal"
              onClick={() => editor.toggleStyles({ bold: true })}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-ink hover:bg-admin-surface"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Miring"
              onClick={() => editor.toggleStyles({ italic: true })}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-ink hover:bg-admin-surface"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Heading 1"
              onClick={() => editor.updateBlock(editor.getTextCursorPosition().block, { type: "heading", props: { level: 1 } })}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-ink hover:bg-admin-surface"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Heading 2"
              onClick={() => editor.updateBlock(editor.getTextCursorPosition().block, { type: "heading", props: { level: 2 } })}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-ink hover:bg-admin-surface"
            >
              <Heading3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Kutipan"
              onClick={() => editor.updateBlock(editor.getTextCursorPosition().block, { type: "quote" })}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-ink hover:bg-admin-surface"
            >
              <Quote className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Daftar berpoin"
              onClick={() => editor.updateBlock(editor.getTextCursorPosition().block, { type: "bulletListItem" })}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-ink hover:bg-admin-surface"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Daftar bernomor"
              onClick={() => editor.updateBlock(editor.getTextCursorPosition().block, { type: "numberedListItem" })}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-ink hover:bg-admin-surface"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Sisipkan tautan"
              onClick={() => {
                setLinkUrl(editor.getSelectedLinkUrl() ?? "");
                setLinkError(null);
                setLinkDialogOpen(true);
              }}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-ink hover:bg-admin-surface"
            >
              <Link2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Sisipkan gambar"
              onClick={() => mobileImageInputRef.current?.click()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-ink hover:bg-admin-surface"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Tutup keyboard"
              onClick={() => (document.activeElement as HTMLElement | null)?.blur()}
              className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-admin-text-secondary hover:bg-admin-surface"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {linkDialogOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sisipkan tautan"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
        >
          <div className="w-full max-w-sm rounded-xl border border-admin-line bg-admin-canvas p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-admin-ink">Tautan</h2>
              <button
                type="button"
                aria-label="Tutup dialog tautan"
                onClick={() => setLinkDialogOpen(false)}
                className="rounded p-1 text-admin-text-secondary hover:bg-admin-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://contoh.id"
              className="mt-3 w-full rounded-md border border-admin-line bg-admin-canvas px-3 py-2 text-sm text-admin-ink focus:border-[#26599A] focus:outline-none"
              autoFocus
            />
            {linkError ? (
              <p role="alert" className="mt-1.5 text-[13px] text-admin-rose-ink">
                {linkError}
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  editor.createLink("");
                  setLinkDialogOpen(false);
                }}
                className="min-h-[40px] rounded-md px-3 text-xs font-medium text-admin-text-secondary hover:bg-admin-surface"
              >
                Hapus tautan
              </button>
              <button
                type="button"
                onClick={applyLink}
                className="min-h-[40px] rounded-md bg-admin-ink px-4 text-xs font-medium text-admin-on-ink"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
