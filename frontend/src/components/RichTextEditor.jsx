import React, { useCallback, useMemo, useState } from 'react';
import { createEditor, Transforms, Text } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Smile
} from 'lucide-react';
import isHotkey from 'is-hotkey';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const RichTextEditor = ({ value = '', onChange, placeholder = 'Enter your text here...' }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const initialValue = useMemo(() => [
    {
      type: 'paragraph',
      children: [{ text: value }],
    },
  ], [value]);

  const emojis = ['😀', '😃', '😄', '😊', '😂', '😍', '🤔', '👍', '❤️'];

  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  const handleChange = (newValue) => {
    const plainText = newValue.map(n => Node.string(n)).join('\n');
    onChange?.(plainText);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-2">
      <Slate editor={editor} value={initialValue} onChange={handleChange}>
        <div className="flex gap-2 border-b border-gray-200 pb-2 mb-2">
          <FormatButton format="bold" icon={<Bold className="w-4 h-4" />} />
          <FormatButton format="italic" icon={<Italic className="w-4 h-4" />} />
          <FormatButton format="strikethrough" icon={<Strikethrough className="w-4 h-4" />} />
          <FormatButton format="bulleted-list" icon={<List className="w-4 h-4" />} />
          <FormatButton format="numbered-list" icon={<ListOrdered className="w-4 h-4" />} />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Smile className="w-4 h-4" />
            </button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <div className="grid grid-cols-5 gap-1">
                  {emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => insertEmoji(editor, emoji)}
                      className="text-lg p-1 hover:bg-gray-100 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Editable
          className="min-h-[160px] p-2"
          placeholder={placeholder}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
        />
      </Slate>
    </div>
  );
};

const insertEmoji = (editor, emoji) => {
  editor.insertText(emoji);
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    editor.removeMark(format);
  } else {
    editor.addMark(format, true);
  }
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const FormatButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <button
      type="button"
      onClick={() => toggleMark(editor, format)}
      className="p-1 hover:bg-gray-200 rounded"
    >
      {icon}
    </button>
  );
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.strikethrough) children = <del>{children}</del>;
  return <span {...attributes}>{children}</span>;
};

export default RichTextEditor;
