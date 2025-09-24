"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  LinkIcon,
  CheckSquare,
  Table as TableIcon,
  Indent,
  Outdent,
  Columns,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}
export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  // ✅ État pour gérer le SSR
  const [isMounted, setIsMounted] = useState(false);

  const [tableDialog, setTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // ✅ S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // On utilise CodeBlockLowlight à la place
      }),
      // ✅ Nouvelles extensions de formatage
      Underline,
      Subscript,
      Superscript,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      // ✅ Code avec coloration syntaxique
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-gray-100 rounded-lg p-4 my-4 overflow-x-auto",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class:
            "table-auto border-collapse border border-gray-300 w-full my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-300",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border border-gray-300 bg-gray-100 px-4 py-2 font-semibold text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-4 py-2",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[400px] p-4 border-l border-r border-b border-gray-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      },
    },
    immediatelyRender: false,
  });

  // ✅ Fonctions pour tableaux multiples
  const insertCustomTable = useCallback(() => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({
          rows: tableRows,
          cols: tableCols,
          withHeaderRow: true,
        })
        .run();
      setTableDialog(false);
    }
  }, [editor, tableRows, tableCols]);

  const addMultipleRows = useCallback(
    (count: number) => {
      if (editor) {
        for (let i = 0; i < count; i++) {
          editor.chain().focus().addRowAfter().run();
        }
      }
    },
    [editor]
  );

  const addMultipleColumns = useCallback(
    (count: number) => {
      if (editor) {
        for (let i = 0; i < count; i++) {
          editor.chain().focus().addColumnAfter().run();
        }
      }
    },
    [editor]
  );

  const addImage = useCallback(() => {
    const url = window.prompt("URL de l'image:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL du lien:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const setTextColor = useCallback(
    (color: string) => {
      if (editor) {
        editor.chain().focus().setColor(color).run();
      }
    },
    [editor]
  );

  const setHighlight = useCallback(
    (color: string) => {
      if (editor) {
        editor.chain().focus().toggleHighlight({ color }).run();
      }
    },
    [editor]
  );

  // ✅ Fonctions pour les tableaux
  const insertTable = useCallback(() => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    }
  }, [editor]);

  const addColumnBefore = useCallback(() => {
    if (editor) {
      editor.chain().focus().addColumnBefore().run();
    }
  }, [editor]);

  const addColumnAfter = useCallback(() => {
    if (editor) {
      editor.chain().focus().addColumnAfter().run();
    }
  }, [editor]);

  const deleteColumn = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteColumn().run();
    }
  }, [editor]);

  const addRowBefore = useCallback(() => {
    if (editor) {
      editor.chain().focus().addRowBefore().run();
    }
  }, [editor]);

  const addRowAfter = useCallback(() => {
    if (editor) {
      editor.chain().focus().addRowAfter().run();
    }
  }, [editor]);

  const deleteRow = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteRow().run();
    }
  }, [editor]);

  const deleteTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteTable().run();
    }
  }, [editor]);

  // ✅ Fonctions pour l'indentation
  const indentContent = useCallback(() => {
    if (editor) {
      // Pour les listes, on utilise la fonction native
      if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
        editor.chain().focus().sinkListItem("listItem").run();
      } else {
        // Pour le texte normal, on ajoute une marge
        editor
          .chain()
          .focus()
          .updateAttributes("paragraph", {
            style: "margin-left: 2rem;",
          })
          .run();
      }
    }
  }, [editor]);

  const outdentContent = useCallback(() => {
    if (editor) {
      // Pour les listes, on utilise la fonction native
      if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
        editor.chain().focus().liftListItem("listItem").run();
      } else {
        // Pour le texte normal, on retire la marge
        editor
          .chain()
          .focus()
          .updateAttributes("paragraph", {
            style: null,
          })
          .run();
      }
    }
  }, [editor]);

  // ✅ Fonction pour insérer des colonnes (layout)
  const insertColumns = useCallback(() => {
    if (editor) {
      const columnsHtml = `
        <div class="grid grid-cols-2 gap-4 my-4">
          <div class="p-4 border border-gray-200 rounded">
            <p>Colonne 1</p>
          </div>
          <div class="p-4 border border-gray-200 rounded">
            <p>Colonne 2</p>
          </div>
        </div>
      `;
      editor.chain().focus().insertContent(columnsHtml).run();
    }
  }, [editor]);

  // ✅ Afficher un loader pendant que le composant se monte
  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-2">
          <div className="flex gap-1">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="min-h-[400px] p-4 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Chargement de l&apos;éditeur...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* ✅ Barre d'outils sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="bg-gray-50 p-2 flex flex-wrap gap-1">
          {/* Mise en forme du texte */}
          <Button
            type="button"
            variant={editor.isActive("bold") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Gras (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("italic") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italique (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>

          {/* ✅ NOUVEAU : Souligné */}
          <Button
            type="button"
            variant={editor.isActive("underline") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Souligné (Ctrl+U)"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("strike") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Barré"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("code") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Code inline"
          >
            <Code className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* ✅ NOUVEAU : Exposant/Indice */}
          <Button
            type="button"
            variant={editor.isActive("superscript") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            title="Exposant"
          >
            <sup className="text-xs">x²</sup>
          </Button>

          <Button
            type="button"
            variant={editor.isActive("subscript") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            title="Indice"
          >
            <sub className="text-xs">x₂</sub>
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* ✅ NOUVEAU : Couleurs et surlignage */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Couleur du texte">
                <div className="w-4 h-4 border-b-2 border-current">A</div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="p-2">
                <p className="text-xs font-medium mb-2">Couleur du texte</p>
                <div className="grid grid-cols-6 gap-1">
                  {[
                    "#000000",
                    "#ef4444",
                    "#22c55e",
                    "#3b82f6",
                    "#a855f7",
                    "#f59e0b",
                    "#ec4899",
                    "#10b981",
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setTextColor(color)}
                    />
                  ))}
                </div>
                <DropdownMenuItem
                  className="mt-2"
                  onClick={() => editor.chain().focus().unsetColor().run()}
                >
                  Couleur par défaut
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={editor.isActive("highlight") ? "default" : "ghost"}
                size="sm"
                title="Surligner"
              >
                <div className="w-4 h-4 bg-yellow-200 rounded text-xs flex items-center justify-center">
                  A
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="p-2">
                <p className="text-xs font-medium mb-2">
                  Couleur de surlignage
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {[
                    "#fef3c7",
                    "#fecaca",
                    "#bbf7d0",
                    "#bfdbfe",
                    "#e9d5ff",
                    "#fed7aa",
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setHighlight(color)}
                    />
                  ))}
                </div>
                <DropdownMenuItem
                  className="mt-2"
                  onClick={() => editor.chain().focus().unsetHighlight().run()}
                >
                  Retirer le surlignage
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-8" />

          {/* Titres */}
          <Button
            type="button"
            variant={
              editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            title="Titre 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={
              editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="Titre 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={
              editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            title="Titre 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Listes */}
          <Button
            type="button"
            variant={editor.isActive("bulletList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Liste à puces"
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("orderedList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Liste numérotée"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("taskList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            title="Liste de tâches"
          >
            <CheckSquare className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("blockquote") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Citation"
          >
            <Quote className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Indentation */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={indentContent}
            title="Indenter"
            disabled={
              !editor.can().sinkListItem("listItem") &&
              !editor.isActive("paragraph")
            }
          >
            <Indent className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={outdentContent}
            title="Désindenter"
            disabled={!editor.can().liftListItem("listItem")}
          >
            <Outdent className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Alignement */}
          <Button
            type="button"
            variant={
              editor.isActive({ textAlign: "left" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Aligner à gauche"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={
              editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Centrer"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={
              editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Aligner à droite"
          >
            <AlignRight className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Layout et structure */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertColumns}
            title="Insérer des colonnes"
          >
            <Columns className="w-4 h-4" />
          </Button>

          {/* ✅ AMÉLIORATION : Tableau avec options multiples */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant={editor.isActive("table") ? "default" : "ghost"}
                size="sm"
                title="Tableau"
              >
                <TableIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={insertTable}>
                <TableIcon className="w-4 h-4 mr-2" />
                Insérer tableau 3x3
              </DropdownMenuItem>
              <DropdownMenuItem onClick={insertCustomTable}>
                <TableIcon className="w-4 h-4 mr-2" />
                Tableau personnalisé
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* ✅ NOUVEAU : Ajout multiple */}
              <DropdownMenuItem
                onClick={() => addMultipleColumns(2)}
                disabled={!editor.isActive("table")}
              >
                Ajouter 2 colonnes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => addMultipleColumns(3)}
                disabled={!editor.isActive("table")}
              >
                Ajouter 3 colonnes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => addMultipleRows(2)}
                disabled={!editor.isActive("table")}
              >
                Ajouter 2 lignes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => addMultipleRows(3)}
                disabled={!editor.isActive("table")}
              >
                Ajouter 3 lignes
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Options individuelles */}
              <DropdownMenuItem
                onClick={addColumnBefore}
                disabled={!editor.isActive("table")}
              >
                Ajouter colonne avant
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={addColumnAfter}
                disabled={!editor.isActive("table")}
              >
                Ajouter colonne après
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={deleteColumn}
                disabled={!editor.isActive("table")}
              >
                Supprimer colonne
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={addRowBefore}
                disabled={!editor.isActive("table")}
              >
                Ajouter ligne avant
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={addRowAfter}
                disabled={!editor.isActive("table")}
              >
                Ajouter ligne après
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={deleteRow}
                disabled={!editor.isActive("table")}
              >
                Supprimer ligne
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={deleteTable}
                disabled={!editor.isActive("table")}
                className="text-red-600"
              >
                Supprimer tableau
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-8" />

          {/* ✅ NOUVEAU : Bloc de code */}
          <Button
            type="button"
            variant={editor.isActive("codeBlock") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Bloc de code"
          >
            <Code className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Médias et liens */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImage}
            title="Insérer une image"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
            title="Insérer un lien"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Annuler/Refaire */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Annuler (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Refaire (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Zone d'édition */}
      <EditorContent editor={editor} className="min-h-[400px]" />
    </div>
  );
}
