/**
 * FolderTree - Sistema de Pastas para Notas
 * 
 * Mostra hierarquia de pastas tipo Obsidian
 * Permite navegar e filtrar notas por pasta
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/axios";
import { Folder, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FolderNode {
  path: string;
  name: string;
  depth: number;
  count: number;
  subfolders?: FolderNode[];
}

interface FolderTreeProps {
  onFolderSelect?: (path: string) => void;
  selectedFolder?: string | null;
}

function buildFolderTree(folders: Array<{ path: string; name: string; count: number }>): FolderNode[] {
  const root: Map<string, FolderNode> = new Map();

  folders.sort((a, b) => a.path.localeCompare(b.path)).forEach((folder) => {
    const parts = folder.path.split("/");
    let currentPath = "";

    parts.forEach((part, idx) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const depth = idx;
      const isLastPart = idx === parts.length - 1;

      if (!root.has(currentPath)) {
        root.set(currentPath, {
          path: currentPath,
          name: part,
          depth,
          count: isLastPart ? folder.count : 0,
          subfolders: [],
        });
      }
    });
  });

  // Construir árvore
  const rootFolders: FolderNode[] = [];
  root.forEach((node) => {
    if (node.depth === 0) {
      rootFolders.push(node);
    }
  });

  const buildChildren = (node: FolderNode) => {
    const prefix = node.path + "/";
    const children: FolderNode[] = [];

    root.forEach((potentialChild) => {
      if (
        potentialChild.path.startsWith(prefix) &&
        potentialChild.path.split("/").length === node.depth + 2
      ) {
        children.push(potentialChild);
      }
    });

    node.subfolders = children;
    children.forEach(buildChildren);
  };

  rootFolders.forEach(buildChildren);
  return rootFolders;
}

function FolderTreeNode({\n  node,\n  depth,\n  onSelect,\n  selected,\n}: {\n  node: FolderNode;\n  depth: number;\n  onSelect: (path: string) => void;\n  selected?: string | null;\n}) {\n  const [expanded, setExpanded] = useState(false);\n  const hasSubfolders = node.subfolders && node.subfolders.length > 0;\n\n  return (\n    <>\n      <button\n        onClick={() => {\n          if (hasSubfolders) setExpanded(!expanded);\n          onSelect(node.path);\n        }}\n        className={cn(\n          \"flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent\",\n          selected === node.path ? \"bg-primary/10 text-primary font-medium\" : \"text-foreground\"\n        )}\n        style={{ marginLeft: `${depth * 12}px` }}\n      >\n        {hasSubfolders && (\n          <button\n            onClick={(e) => {\n              e.stopPropagation();\n              setExpanded(!expanded);\n            }}\n            className=\"p-0.5 hover:bg-accent rounded\"\n          >\n            {expanded ? (\n              <ChevronDown className=\"h-3 w-3\" />\n            ) : (\n              <ChevronRight className=\"h-3 w-3\" />\n            )}\n          </button>\n        )}\n        {!hasSubfolders && <div className=\"w-4\" />}\n        <Folder className=\"h-4 w-4 text-muted-foreground\" />\n        <span className=\"truncate flex-1 text-left\">{node.name}</span>\n        {node.count > 0 && (\n          <span className=\"text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded\">\n            {node.count}\n          </span>\n        )}\n      </button>\n\n      {expanded && hasSubfolders && (\n        <div className=\"space-y-0.5\">\n          {node.subfolders!.map((subfolder) => (\n            <FolderTreeNode\n              key={subfolder.path}\n              node={subfolder}\n              depth={depth + 1}\n              onSelect={onSelect}\n              selected={selected}\n            />\n          ))}\n        </div>\n      )}\n    </>\n  );\n}\n\nexport function FolderTree({ onFolderSelect, selectedFolder }: FolderTreeProps) {\n  const [folders, setFolders] = useState<FolderNode[]>([]);\n  const [loading, setLoading] = useState(false);\n\n  useEffect(() => {\n    loadFolders();\n  }, []);\n\n  const loadFolders = async () => {\n    setLoading(true);\n    try {\n      const { data } = await api.get(\"/api/notes/folders\");\n      const folderList = Array.isArray(data) ? data : [];\n      setFolders(buildFolderTree(folderList));\n    } catch (err) {\n      console.error(\"Erro ao carregar pastas\", err);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  if (loading) return <p className=\"text-xs text-muted-foreground px-2\">Carregando...</p>;\n\n  return (\n    <div className=\"space-y-1\">\n      <button\n        onClick={() => onFolderSelect?.(\"all\")}\n        className={cn(\n          \"flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-accent\",\n          selectedFolder === \"all\" || !selectedFolder ? \"bg-primary/10 text-primary\" : \"text-foreground\"\n        )}\n      >\n        <Folder className=\"h-4 w-4\" />\n        Todas as notas\n      </button>\n      {folders.map((folder) => (\n        <FolderTreeNode\n          key={folder.path}\n          node={folder}\n          depth={0}\n          onSelect={onFolderSelect || (() => {})}\n          selected={selectedFolder}\n        />\n      ))}\n    </div>\n  );\n}\n