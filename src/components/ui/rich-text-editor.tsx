import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered } from 'lucide-react';
import { cn } from '@/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  id?: string;
}

const ToolbarButton = ({
  onClick,
  isActive,
  label,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  label: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={isActive}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={cn(
      'flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
      isActive && 'bg-muted text-foreground',
    )}
  >
    {children}
  </button>
);

const Toolbar = ({ editor }: { editor: Editor }) => (
  <div className="flex items-center gap-0.5 border-b border-input px-1.5 py-1">
    <ToolbarButton
      label="Bold"
      isActive={editor.isActive('bold')}
      onClick={() => editor.chain().focus().toggleBold().run()}
    >
      <Bold className="size-3.5" aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      label="Italic"
      isActive={editor.isActive('italic')}
      onClick={() => editor.chain().focus().toggleItalic().run()}
    >
      <Italic className="size-3.5" aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      label="Underline"
      isActive={editor.isActive('underline')}
      onClick={() => editor.chain().focus().toggleUnderline().run()}
    >
      <UnderlineIcon className="size-3.5" aria-hidden="true" />
    </ToolbarButton>
    <div className="mx-1 h-4 w-px bg-input" aria-hidden="true" />
    <ToolbarButton
      label="Bullet list"
      isActive={editor.isActive('bulletList')}
      onClick={() => editor.chain().focus().toggleBulletList().run()}
    >
      <List className="size-3.5" aria-hidden="true" />
    </ToolbarButton>
    <ToolbarButton
      label="Numbered list"
      isActive={editor.isActive('orderedList')}
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
    >
      <ListOrdered className="size-3.5" aria-hidden="true" />
    </ToolbarButton>
  </div>
);

/**
 * A minimal WYSIWYG field backed by Tiptap. Stores content as an HTML string
 * (empty editor reports `''`, not `<p></p>`, so callers can keep using plain
 * truthy checks like `value && ...`). Consumers must sanitize this HTML with
 * DOMPurify before rendering it elsewhere — see `rich-text-content.tsx`.
 */
export const RichTextEditor = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? '' : editor.getHTML());
    },
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: 'min-h-16 px-3 py-2 text-sm outline-none [&_p]:leading-relaxed',
        ...(ariaInvalid ? { 'aria-invalid': 'true' } : {}),
        ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
      },
    },
  });

  // Keep the editor in sync when `value` changes externally (e.g. form reset).
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        'w-full rounded-lg border border-input bg-transparent transition-colors has-[.ProseMirror-focused]:border-ring has-[.ProseMirror-focused]:ring-3 has-[.ProseMirror-focused]:ring-ring/50',
        className,
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className={cn(
          '[&_.ProseMirror]:relative',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
        )}
      />
    </div>
  );
};
