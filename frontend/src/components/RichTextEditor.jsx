// components/RichTextEditor.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, List, ListOrdered } from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-2 border-b border-gray-300 mb-2 pb-2">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className="p-1 hover:bg-gray-200 rounded">
        <Bold className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className="p-1 hover:bg-gray-200 rounded">
        <Italic className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="p-1 hover:bg-gray-200 rounded">
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-1 hover:bg-gray-200 rounded">
        <List className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="p-1 hover:bg-gray-200 rounded">
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          const url = prompt('Enter link URL');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        className="p-1 hover:bg-gray-200 rounded"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder = 'Write your content here...' }) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  return (
    <div className="border border-gray-300 rounded-lg p-2 bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="min-h-[160px] p-2 focus:outline-none" />
    </div>
  );
};

export default RichTextEditor;
