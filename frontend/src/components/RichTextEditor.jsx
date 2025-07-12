import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List,
  ListOrdered
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-2 border-b border-[#5c4f6e] mb-3 pb-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="p-1 rounded hover:bg-[#5c4f6e] text-[#b3a8c9]"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="p-1 rounded hover:bg-[#5c4f6e] text-[#b3a8c9]"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="p-1 rounded hover:bg-[#5c4f6e] text-[#b3a8c9]"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="p-1 rounded hover:bg-[#5c4f6e] text-[#b3a8c9]"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className="p-1 rounded hover:bg-[#5c4f6e] text-[#b3a8c9]"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          const url = prompt('Enter link URL');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        className="p-1 rounded hover:bg-[#5c4f6e] text-[#b3a8c9]"
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
    <div className="border border-[#5c4f6e] rounded-lg p-3 bg-[#1e1a2e] text-[#b3a8c9]">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="min-h-[160px] p-2 focus:outline-none placeholder:text-[#7a6c9c]"
      />
    </div>
  );
};

export default RichTextEditor;
