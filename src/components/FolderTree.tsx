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

function FolderTreeNode({
  node,
  depth,
  onSelect,
  selected,
}: {
  node: FolderNode;
  depth: number;
  onSelect: (path: string) => void;
  selected?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSubfolders = node.subfolders && node.subfolders.length > 0;

  return (
    <>
      <button
        onClick={() => {
          if (hasSubfolders) setExpanded(!expanded);
          onSelect(node.path);
        }}
        className={cn(
          'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent',
          selected === node.path ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
        )}
        style={{ marginLeft: `${depth * 12}px` }}
      >
        {hasSubfolders && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 hover:bg-accent rounded"
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        {!hasSubfolders && <div className="w-4" />}
        <Folder className="h-4 w-4 text-muted-foreground" />
        <span className="truncate flex-1 text-left">{node.name}</span>
        {node.count > 0 && (
          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
            {node.count}
          </span>
        )}
      </button>

      {expanded && hasSubfolders && (
        <div className="space-y-0.5">
          {node.subfolders!.map((subfolder) => (
            <FolderTreeNode
              key={subfolder.path}
              node={subfolder}
              depth={depth + 1}
              onSelect={onSelect}
              selected={selected}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function FolderTree({ onFolderSelect, selectedFolder }: FolderTreeProps) {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/notes/folders');
      const folderList = Array.isArray(data) ? data : [];
      setFolders(buildFolderTree(folderList));
    } catch (err) {
      console.error('Erro ao carregar pastas', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-xs text-muted-foreground px-2">Carregando...</p>;

  return (
    <div className="space-y-1">
      <button
        onClick={() => onFolderSelect?.('all')}
        className={cn(
          'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-accent',
          selectedFolder === 'all' || !selectedFolder ? 'bg-primary/10 text-primary' : 'text-foreground'
        )}
      >
        <Folder className="h-4 w-4" />
        Todas as notas
      </button>
      {folders.map((folder) => (
        <FolderTreeNode
          key={folder.path}
          node={folder}
          depth={0}
          onSelect={onFolderSelect || (() => {})}
          selected={selectedFolder}
        />
      ))}
    </div>
  );
}