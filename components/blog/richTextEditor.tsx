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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Hash,
  Palette,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [isMounted, setIsMounted] = useState(false);

  // ✅ États pour les dialogues
  const [tableDialog, setTableDialog] = useState(false);
  const [addRowsDialog, setAddRowsDialog] = useState(false);
  const [addColsDialog, setAddColsDialog] = useState(false);
  const [cellColorDialog, setCellColorDialog] = useState(false);
  const [headerCustomizationDialog, setHeaderCustomizationDialog] =
    useState(false);
  const [headerText, setHeaderText] = useState("");
  const [headerColor, setHeaderColor] = useState("#f8f9fa");

  // ✅ États pour les formulaires
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [rowsToAdd, setRowsToAdd] = useState(1);
  const [colsToAdd, setColsToAdd] = useState(1);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-outside ml-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-outside ml-4",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "mb-1",
          },
        },
      }),
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
      // ✅ Configuration améliorée pour les en-têtes multiples
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
        class: "prose prose-lg max-w-none p-4 focus:outline-none min-h-full",
      },
    },
    immediatelyRender: false,
  });

  // ✅ CORRIGÉ : Fonction pour personnaliser l'en-tête avec support multiple
  const customizeTableHeader = useCallback(() => {
    if (editor && headerText) {
      // D'abord, insérer le texte
      editor.chain().focus().insertContent(headerText).run();

      // Ensuite, appliquer le style à la cellule actuelle
      const currentAttributes = editor.getAttributes("tableCell");
      const existingStyle = currentAttributes.style || "";

      // Combiner les styles existants avec les nouveaux
      const newStyle =
        `${existingStyle}; background-color: ${headerColor}; font-weight: bold; text-align: center; color: ${headerColor === "#000000" || headerColor === "#333333" ? "white" : "inherit"};`
          .replace(/;+/g, ";")
          .replace(/^;|;$/g, "");

      editor.chain().focus().setCellAttribute("style", newStyle).run();

      setHeaderCustomizationDialog(false);
      setHeaderText("");
      setHeaderColor("#f8f9fa");
    }
  }, [editor, headerText, headerColor]);

  // ✅ Fonctions pour tableaux avec nombre personnalisé
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

  const addCustomRows = useCallback(() => {
    if (editor) {
      for (let i = 0; i < rowsToAdd; i++) {
        editor.chain().focus().addRowAfter().run();
      }
      setAddRowsDialog(false);
      setRowsToAdd(1);
    }
  }, [editor, rowsToAdd]);

  const addCustomColumns = useCallback(() => {
    if (editor) {
      for (let i = 0; i < colsToAdd; i++) {
        editor.chain().focus().addColumnAfter().run();
      }
      setAddColsDialog(false);
      setColsToAdd(1);
    }
  }, [editor, colsToAdd]);

  // ✅ CORRIGÉ : Fonction pour colorer les cellules
  const setCellBackgroundColor = useCallback(
    (color: string) => {
      if (editor) {
        const currentAttributes = editor.getAttributes("tableCell");
        const existingStyle = currentAttributes.style || "";

        // Supprimer l'ancienne couleur de fond et ajouter la nouvelle
        const cleanedStyle = existingStyle.replace(
          /background-color:\s*[^;]+;?/gi,
          ""
        );
        const newStyle =
          color === "transparent"
            ? cleanedStyle
            : `${cleanedStyle}; background-color: ${color};`
                .replace(/;+/g, ";")
                .replace(/^;|;$/g, "");

        editor
          .chain()
          .focus()
          .setCellAttribute("style", newStyle || null)
          .run();
        setCellColorDialog(false);
      }
    },
    [editor]
  );

  // ✅ Fonction pour convertir une cellule en en-tête
  const convertToTableHeader = useCallback(() => {
    if (editor) {
      // Convertir la cellule courante en en-tête
      editor.chain().focus().toggleHeaderCell().run();
    }
  }, [editor]);

  // Autres fonctions existantes...
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

  const indentContent = useCallback(() => {
    if (editor) {
      if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
        editor.chain().focus().sinkListItem("listItem").run();
      } else {
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
      if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
        editor.chain().focus().liftListItem("listItem").run();
      } else {
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

  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden h-full flex flex-col">
        <div className="bg-gray-50 border-b border-gray-200 p-2">
          <div className="flex gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Chargement de l&apos;éditeur...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden h-full flex flex-col">
      {/* ✅ Barre d'outils fixe */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="bg-gray-50 p-2 flex flex-wrap gap-1 overflow-x-auto">
          {/* Mise en forme du texte */}
          <div className="flex gap-1">
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

            <Button
              type="button"
              variant={editor.isActive("underline") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Souligné (Ctrl+U)"
            >
              <span className="text-sm underline">U</span>
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
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Exposant/Indice */}
          <div className="flex gap-1">
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
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Couleurs */}
          <div className="flex gap-1">
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
                    onClick={() =>
                      editor.chain().focus().unsetHighlight().run()
                    }
                  >
                    Retirer le surlignage
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* ✅ Titres étendus H1-H6 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Titres">
                <Hash className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Titres</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                <Heading1 className="w-4 h-4 mr-2" />
                Titre 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                <Heading2 className="w-4 h-4 mr-2" />
                Titre 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                <Heading3 className="w-4 h-4 mr-2" />
                Titre 3
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                }
              >
                <span className="w-4 h-4 mr-2 text-xs font-bold">H4</span>
                Titre 4
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 5 }).run()
                }
              >
                <span className="w-4 h-4 mr-2 text-xs font-bold">H5</span>
                Titre 5
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 6 }).run()
                }
              >
                <span className="w-4 h-4 mr-2 text-xs font-bold">H6</span>
                Titre 6
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-8" />

          {/* ✅ Listes avec indentation */}
          <div className="flex gap-1">
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
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Citation */}
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

          {/* Alignement */}
          <div className="flex gap-1">
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
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
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
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Layout */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertColumns}
            title="Insérer des colonnes"
          >
            <Columns className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* ✅ Tableau amélioré avec en-têtes multiples */}
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
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Créer un tableau</DropdownMenuLabel>
              <DropdownMenuItem onClick={insertTable}>
                <TableIcon className="w-4 h-4 mr-2" />
                Tableau rapide 3x3
              </DropdownMenuItem>

              <Dialog open={tableDialog} onOpenChange={setTableDialog}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <TableIcon className="w-4 h-4 mr-2" />
                    Tableau personnalisé
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un tableau personnalisé</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rows">Nombre de lignes</Label>
                      <Input
                        id="rows"
                        type="number"
                        min="1"
                        max="50"
                        value={tableRows}
                        onChange={(e) => setTableRows(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cols">Nombre de colonnes</Label>
                      <Input
                        id="cols"
                        type="number"
                        min="1"
                        max="20"
                        value={tableCols}
                        onChange={(e) => setTableCols(Number(e.target.value))}
                      />
                    </div>
                    <Button onClick={insertCustomTable} className="w-full">
                      Créer le tableau
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Gestion des en-têtes</DropdownMenuLabel>

              {/* ✅ NOUVEAU : Convertir en en-tête */}
              <DropdownMenuItem
                onClick={convertToTableHeader}
                disabled={!editor.isActive("table")}
              >
                <span className="mr-2">🔄</span>
                Convertir cellule en en-tête
              </DropdownMenuItem>

              {/* ✅ Personnalisation des en-têtes améliorée */}
              <Dialog
                open={headerCustomizationDialog}
                onOpenChange={setHeaderCustomizationDialog}
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    disabled={!editor.isActive("table")}
                  >
                    <span className="mr-2">🎨</span>
                    Personnaliser cellule
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Personnaliser la cellule</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="headerText">Texte</Label>
                      <Input
                        id="headerText"
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="Ex: Nom, Âge, Prix..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="headerColor">Couleur de fond</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          id="headerColor"
                          value={headerColor}
                          onChange={(e) => setHeaderColor(e.target.value)}
                          className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={headerColor}
                          onChange={(e) => setHeaderColor(e.target.value)}
                          placeholder="#f8f9fa"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Couleurs prédéfinies */}
                    <div>
                      <Label>Couleurs prédéfinies</Label>
                      <div className="grid grid-cols-8 gap-2 mt-2">
                        {[
                          "#f8f9fa",
                          "#e3f2fd",
                          "#e8f5e8",
                          "#fff3e0",
                          "#fce4ec",
                          "#f3e5f5",
                          "#e0f2f1",
                          "#fff8e1",
                          // Couleurs plus foncées pour les en-têtes
                          "#3b82f6",
                          "#10b981",
                          "#ef4444",
                          "#f59e0b",
                          "#a855f7",
                          "#06b6d4",
                          "#84cc16",
                          "#f97316",
                        ].map((color) => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => setHeaderColor(color)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Aperçu */}
                    <div>
                      <Label>Aperçu</Label>
                      <div
                        className="mt-2 p-3 border rounded text-center font-bold"
                        style={{
                          backgroundColor: headerColor,
                          color: [
                            "#3b82f6",
                            "#10b981",
                            "#ef4444",
                            "#f59e0b",
                            "#a855f7",
                            "#06b6d4",
                            "#84cc16",
                            "#f97316",
                            "#000000",
                          ].includes(headerColor)
                            ? "white"
                            : "inherit",
                        }}
                      >
                        {headerText || "Votre cellule"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={customizeTableHeader}
                        disabled={!headerText.trim()}
                        className="flex-1"
                      >
                        Appliquer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setHeaderCustomizationDialog(false);
                          setHeaderText("");
                          setHeaderColor("#f8f9fa");
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* ✅ Styles d'en-têtes rapides améliorés */}
              <DropdownMenuItem
                onClick={() => {
                  if (editor) {
                    editor.chain().focus().toggleHeaderCell().run();
                    editor
                      .chain()
                      .focus()
                      .setCellAttribute(
                        "style",
                        "background-color: #3b82f6; color: white; font-weight: bold; text-align: center;"
                      )
                      .run();
                  }
                }}
                disabled={!editor.isActive("table")}
              >
                🔵 En-tête bleu
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  if (editor) {
                    editor.chain().focus().toggleHeaderCell().run();
                    editor
                      .chain()
                      .focus()
                      .setCellAttribute(
                        "style",
                        "background-color: #10b981; color: white; font-weight: bold; text-align: center;"
                      )
                      .run();
                  }
                }}
                disabled={!editor.isActive("table")}
              >
                🟢 En-tête vert
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  if (editor) {
                    editor.chain().focus().toggleHeaderCell().run();
                    editor
                      .chain()
                      .focus()
                      .setCellAttribute(
                        "style",
                        "background-color: #ef4444; color: white; font-weight: bold; text-align: center;"
                      )
                      .run();
                  }
                }}
                disabled={!editor.isActive("table")}
              >
                🔴 En-tête rouge
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  if (editor) {
                    editor.chain().focus().toggleHeaderCell().run();
                    editor
                      .chain()
                      .focus()
                      .setCellAttribute(
                        "style",
                        "background-color: #f59e0b; color: white; font-weight: bold; text-align: center;"
                      )
                      .run();
                  }
                }}
                disabled={!editor.isActive("table")}
              >
                🟡 En-tête orange
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Modifier le tableau</DropdownMenuLabel>

              {/* Dialogues pour ajout personnalisé */}
              <Dialog open={addRowsDialog} onOpenChange={setAddRowsDialog}>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    disabled={!editor.isActive("table")}
                  >
                    Ajouter lignes personnalisé
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter des lignes</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rowsToAdd">
                        Nombre de lignes à ajouter
                      </Label>
                      <Input
                        id="rowsToAdd"
                        type="number"
                        min="1"
                        max="100"
                        value={rowsToAdd}
                        onChange={(e) => setRowsToAdd(Number(e.target.value))}
                      />
                    </div>
                    <Button onClick={addCustomRows} className="w-full">
                      Ajouter {rowsToAdd} ligne{rowsToAdd > 1 ? "s" : ""}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={addColsDialog} onOpenChange={setAddColsDialog}>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    disabled={!editor.isActive("table")}
                  >
                    Ajouter colonnes personnalisé
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter des colonnes</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="colsToAdd">
                        Nombre de colonnes à ajouter
                      </Label>
                      <Input
                        id="colsToAdd"
                        type="number"
                        min="1"
                        max="50"
                        value={colsToAdd}
                        onChange={(e) => setColsToAdd(Number(e.target.value))}
                      />
                    </div>
                    <Button onClick={addCustomColumns} className="w-full">
                      Ajouter {colsToAdd} colonne{colsToAdd > 1 ? "s" : ""}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* ✅ Couleur de fond des cellules améliorée */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    disabled={!editor.isActive("table")}
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Couleur de fond cellule
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right">
                  <div className="p-2">
                    <p className="text-xs font-medium mb-2">Couleur de fond</p>
                    <div className="grid grid-cols-6 gap-1">
                      {[
                        "#ffffff",
                        "#f8f9fa",
                        "#e9ecef",
                        "#dee2e6",
                        "#fef3c7",
                        "#fecaca",
                        "#bbf7d0",
                        "#bfdbfe",
                        "#e9d5ff",
                        "#fed7aa",
                        "#fca5a5",
                        "#86efac",
                      ].map((color) => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => setCellBackgroundColor(color)}
                        />
                      ))}
                    </div>
                    <DropdownMenuItem
                      className="mt-2"
                      onClick={() => setCellBackgroundColor("transparent")}
                    >
                      Supprimer la couleur
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenuSeparator />

              {/* Actions rapides */}
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

          {/* Bloc de code */}
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

          {/* Médias */}
          <div className="flex gap-1">
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
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Annuler/Refaire */}
          <div className="flex gap-1">
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
      </div>

      {/* ✅ Zone d'édition avec scroll */}
      <ScrollArea className="flex-1">
        <EditorContent editor={editor} className="min-h-full" />
      </ScrollArea>
    </div>
  );
}
