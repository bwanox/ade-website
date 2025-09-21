"use client";
import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Quote, ListOrdered, List, Undo2, Redo2, Link2, RemoveFormatting, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Highlighter, Palette, Subscript as SubscriptIcon, Superscript as SuperscriptIcon, Code2, SquareCode, Minus, ListTodo } from "lucide-react";

export interface TiptapEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

// A small TipTap-based rich text editor that returns HTML as a string
export function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      // New rich text helpers
      TextStyle,
      Color,
      Highlight,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[180px] p-3 focus:outline-none",
      },
    },
  });

  // Keep editor content in sync when external value changes (e.g., editing existing article)
  useEffect(() => {
    if (editor && typeof value === "string" && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {/* Headings */}
        <Button type="button" variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3">
          <Heading3 className="h-4 w-4" />
        </Button>
        {/* Emphasis */}
        <Button type="button" variant={editor.isActive("bold") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("italic") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("underline") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("strike") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} title="Strike">
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("highlight") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
          <Highlighter className="h-4 w-4" />
        </Button>
        {/* Text color */}
        <label className="inline-flex items-center gap-1 px-2 border rounded-md bg-background/50">
          <Palette className="h-3.5 w-3.5 opacity-70" />
          <input
            type="color"
            className="h-7 w-7 cursor-pointer bg-transparent p-0 border-0"
            value={(editor.getAttributes("textStyle").color as string) || "#000000"}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            title="Text color"
          />
        </label>
        {/* Font size */}
        <select
          className="h-8 px-2 text-xs border rounded-md bg-background/50"
          value={(editor.getAttributes("textStyle").fontSize as string) || ""}
          onChange={(e) => {
            const v = e.target.value;
            const attrs = editor.getAttributes("textStyle") as { color?: string };
            if (!v) {
              editor.chain().focus().unsetMark('textStyle').run();
              if (attrs?.color) editor.chain().focus().setColor(attrs.color).run();
            } else {
              editor.chain().focus().setMark('textStyle', { fontSize: v }).run();
            }
          }}
          title="Font size"
        >
          <option value="">Size</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="28px">28</option>
        </select>
        {/* Align */}
        <Button type="button" variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right">
          <AlignRight className="h-4 w-4" />
        </Button>
        {/* Lists */}
        <Button type="button" variant={editor.isActive("bulletList") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("orderedList") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("taskList") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleTaskList().run()} title="Task list">
          <ListTodo className="h-4 w-4" />
        </Button>
        {/* Quotes & Rules */}
        <Button type="button" variant={editor.isActive("blockquote") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
          <Quote className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus className="h-4 w-4" />
        </Button>
        {/* Code */}
        <Button type="button" variant={editor.isActive("code") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
          <Code2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("codeBlock") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
          <SquareCode className="h-4 w-4" />
        </Button>
        {/* Sub/Superscript */}
        <Button type="button" variant={editor.isActive("subscript") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleSubscript().run()} title="Subscript">
          <SubscriptIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("superscript") ? "secondary" : "outline"} size="sm" onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript">
          <SuperscriptIcon className="h-4 w-4" />
        </Button>
        {/* Links, clear, undo/redo */}
        <Button type="button" variant="outline" size="sm" onClick={() => {
          const previousUrl = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("URL", previousUrl ?? "https://");
          if (url === null) return;
          if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
          else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }} title="Add link">
          <Link2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting">
          <RemoveFormatting className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
      <Card className="bg-background/40 border-muted/40">
        <CardContent className="p-0 relative">
          {/* Placeholder emulation */}
          {!editor.getText().length && (placeholder ?? "") && (
            <div className="pointer-events-none absolute text-sm text-muted-foreground/60 p-3">{placeholder}</div>
          )}
          <EditorContent editor={editor} />
        </CardContent>
      </Card>
    </div>
  );
}

export default TiptapEditor;
