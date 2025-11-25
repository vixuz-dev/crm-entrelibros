import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  FiBold, 
  FiItalic, 
  FiList, 
  FiType,
  FiCornerUpLeft,
  FiCornerUpRight
} from 'react-icons/fi';

const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Escribe aquí...',
  className = '',
  minHeight = '200px',
  showToolbar = true
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror prose prose-sm max-w-none focus:outline-none',
        style: 'font-family: "Cabin", sans-serif;',
      },
    },
  });

  // Actualizar el contenido cuando value cambia externamente
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {showToolbar && (
        <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap items-center gap-2">
          {/* Text formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('bold') ? 'bg-amber-100 text-amber-700' : 'text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Negrita"
            >
              <FiBold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('italic') ? 'bg-amber-100 text-amber-700' : 'text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Cursiva"
            >
              <FiItalic className="w-4 h-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-amber-100 text-amber-700' : 'text-gray-700'
              }`}
              title="Título 1"
            >
              <span className="text-xs font-bold">H1</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-amber-100 text-amber-700' : 'text-gray-700'
              }`}
              title="Título 2"
            >
              <span className="text-xs font-bold">H2</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('heading', { level: 3 }) ? 'bg-amber-100 text-amber-700' : 'text-gray-700'
              }`}
              title="Título 3"
            >
              <span className="text-xs font-bold">H3</span>
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('bulletList') ? 'bg-amber-100 text-amber-700' : 'text-gray-700'
              }`}
              title="Lista con viñetas"
            >
              <FiList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('orderedList') ? 'bg-amber-100 text-amber-700' : 'text-gray-700'
              }`}
              title="Lista numerada"
            >
              <span className="text-xs font-bold">1.</span>
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Deshacer"
            >
              <FiCornerUpLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Rehacer"
            >
              <FiCornerUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div 
        className="p-4 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 relative"
        style={{ minHeight }}
      >
        <style>{`
          .ProseMirror strong {
            font-weight: 700 !important;
          }
          .ProseMirror em {
            font-style: italic !important;
          }
        `}</style>
        <EditorContent 
          editor={editor}
          style={{ minHeight }}
        />
        {placeholder && !editor.getText() && (
          <div className="absolute top-4 left-4 pointer-events-none text-gray-400 text-sm font-cabin-regular">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;

