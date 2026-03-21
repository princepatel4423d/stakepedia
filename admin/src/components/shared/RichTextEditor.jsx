import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Image as ImageIcon, Undo, Redo,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'

const getBlockTypeLabel = (editor) => {
  if (!editor) return 'Paragraph'
  if (editor.isActive('heading', { level: 2 })) return 'Heading 2'
  if (editor.isActive('heading', { level: 3 })) return 'Heading 3'
  if (editor.isActive('bulletList')) return 'Bullet list'
  if (editor.isActive('orderedList')) return 'Ordered list'
  if (editor.isActive('blockquote')) return 'Blockquote'
  if (editor.isActive('codeBlock')) return 'Code block'
  return 'Paragraph'
}

const getActiveMarks = (editor) => {
  if (!editor) return []
  const marks = []
  if (editor.isActive('bold')) marks.push('Bold')
  if (editor.isActive('italic')) marks.push('Italic')
  if (editor.isActive('strike')) marks.push('Strike')
  if (editor.isActive('code')) marks.push('Inline code')
  if (editor.isActive('link')) marks.push('Link')
  return marks
}

const ToolbarButton = ({ onClick, active, disabled, children, title }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick() }}
    disabled={disabled}
    className={cn(
      'p-1.5 rounded text-sm transition-colors hover:bg-accent',
      active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
      disabled && 'opacity-40 cursor-not-allowed'
    )}
  >
    {children}
  </button>
)

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  minHeight = '300px',
}) => {
  const isSyncingFromExternal = useRef(false)
  const [formatInfo, setFormatInfo] = useState({
    blockType: 'Paragraph',
    marks: [],
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      if (isSyncingFromExternal.current) return
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4',
          `min-h-[${minHeight}]`
        ),
      },
    },
  })

  const setLink = useCallback(() => {
    const url = window.prompt('URL')
    if (!url) return
    editor?.chain().focus().setLink({ href: url }).run()
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const nextValue = value || ''
    const currentValue = editor.getHTML()
    if (currentValue === nextValue) return

    isSyncingFromExternal.current = true
    editor.commands.setContent(nextValue, false)
    isSyncingFromExternal.current = false
  }, [editor, value])

  useEffect(() => {
    if (!editor) return

    const updateFormatInfo = () => {
      setFormatInfo({
        blockType: getBlockTypeLabel(editor),
        marks: getActiveMarks(editor),
      })
    }

    updateFormatInfo()
    editor.on('selectionUpdate', updateFormatInfo)
    editor.on('update', updateFormatInfo)

    return () => {
      editor.off('selectionUpdate', updateFormatInfo)
      editor.off('update', updateFormatInfo)
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className={cn('rounded-lg border bg-background overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
        <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton title="Link" onClick={setLink} active={editor.isActive('link')}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-background text-xs">
        <span className="text-muted-foreground">Block:</span>
        <span className="px-2 py-0.5 rounded-md border bg-muted/40">{formatInfo.blockType}</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-muted-foreground">Marks:</span>
        {formatInfo.marks.length ? (
          formatInfo.marks.map((mark) => (
            <span key={mark} className="px-2 py-0.5 rounded-md border bg-muted/40">{mark}</span>
          ))
        ) : (
          <span className="text-muted-foreground">None</span>
        )}
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor