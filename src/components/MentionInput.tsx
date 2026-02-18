import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Users, Target, FolderKanban, Star, Heart } from "lucide-react";

interface Entity {
  id: string;
  name: string;
  type: "PERSON" | "HABIT" | "PROJECT" | "GOAL" | "DREAM" | "CUSTOM" | "EVENT";
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const typeConfig: Record<string, { trigger: string; icon: typeof Users; color: string }> = {
  PERSON: { trigger: "@", icon: Users, color: "text-entity-person" },
  HABIT: { trigger: "*", icon: Target, color: "text-entity-habit" },
  PROJECT: { trigger: "#", icon: FolderKanban, color: "text-entity-project" },
  GOAL: { trigger: "◎", icon: Star, color: "text-entity-goal" },
  DREAM: { trigger: "♡", icon: Heart, color: "text-entity-dream" },
  EVENT: { trigger: "◈", icon: Users, color: "text-muted-foreground" },
  CUSTOM: { trigger: "@", icon: Users, color: "text-muted-foreground" },
};

/**
 * MentionInput with autocomplete support for entities.
 * 
 * When user types @, #, or * followed by entity name, system suggests matching entities.
 * On selection, inserts {{entity:entityId}} format.
 * 
 * Important: Backend is responsible for:
 * - Extracting {{entity:id}} mentions
 * - Calculating entity mentions count in entity_index.json
 * - Updating metrics
 */
export default function MentionInput({
  value,
  onChange,
  placeholder = "Escreva aqui...",
  className,
  minHeight = "h-32",
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [suggestions, setSuggestions] = useState<Entity[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [triggerChar, setTriggerChar] = useState<"@" | "#" | "*" | null>(null);
  const [searchText, setSearchText] = useState("");
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(0);

  // Fetch all entities on mount
  useEffect(() => {
    const loadEntities = async () => {
      try {
        const [people, habits, projects, goals, dreams, events] = await Promise.all([
          api.get("/api/entities?type=PERSON").then(({ data }) => data || []),
          api.get("/api/entities?type=HABIT").then(({ data }) => data || []),
          api.get("/api/entities?type=PROJECT").then(({ data }) => data || []),
          api.get("/api/entities?type=GOAL").then(({ data }) => data || []),
          api.get("/api/entities?type=DREAM").then(({ data }) => data || []),
          api.get("/api/entities?type=EVENT").then(({ data }) => data || []),
        ]);
        setEntities([...people, ...habits, ...projects, ...goals, ...dreams, ...events]);
      } catch (err) {
        console.error("Erro ao carregar entidades:", err);
      }
    };
    loadEntities();
  }, []);

  // Handle text input and trigger detection
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      const pos = e.target.selectionStart;

      onChange(text);
      setCursorPos(pos);

      // Find if we're after a trigger character (@, #, *)
      let trigger: "@" | "#" | "*" | null = null;
      let search = "";

      // Look backward from cursor
      for (let i = pos - 1; i >= 0; i--) {
        const char = text[i];

        // Stop on newline or if we've searched far enough
        if (char === "\n" || (search.length > 30 && trigger)) break;

        // Check for trigger characters
        if (char === "@" || char === "#" || char === "*") {
          trigger = char;
          break;
        }

        // Accumulate search text (letters, numbers, unicode)
        if (/[\w\u00C0-\u024F\s-]/.test(char)) {
          search = char + search;
        } else if (search.length > 0) {
          // Stop if we hit non-word char and already have search
          break;
        }
      }

      // Only show suggestions if trigger found and search is meaningful
      if (trigger && search.trim().length > 0) {
        const typeMap: Record<string, keyof typeof typeConfig> = {
          "@": "PERSON",
          "#": "PROJECT",
          "*": "HABIT",
        };
        const typeFilter = typeMap[trigger];

        // Filter entities by type and search text
        const filtered = entities
          .filter((e) => e.type === typeFilter)
          .filter((e) => e.name.toLowerCase().includes(search.toLowerCase().trim()))
          .slice(0, 8);

        setTriggerChar(trigger);
        setSearchText(search.trim());
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        selectedRef.current = 0;
      } else {
        setShowSuggestions(false);
        setTriggerChar(null);
        setSearchText("");
      }
    },
    [onChange, entities]
  );

  // Insert mention in {{entity:id}} format
  const insertMention = (entity: Entity) => {
    if (!textareaRef.current || !triggerChar) return;

    const text = value;
    const pos = cursorPos;

    // Find the start of trigger (look backward for @, #, or *)
    let triggerStart = pos - 1;
    while (triggerStart >= 0 && /[\w\u00C0-\u024F\s-]/.test(text[triggerStart])) {
      triggerStart--;
    }

    // Replace from trigger to cursor with {{entity:id}}
    const newText = text.slice(0, triggerStart + 1) + `{{entity:${entity.id}}} ` + text.slice(pos);
    onChange(newText);

    // Update cursor position
    const newPos = triggerStart + 1 + `{{entity:${entity.id}}} `.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);

    setShowSuggestions(false);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedRef.current = (selectedRef.current + 1) % suggestions.length;
        suggestionsRef.current?.children[selectedRef.current]?.scrollIntoView({ block: "nearest" });
        break;
      case "ArrowUp":
        e.preventDefault();
        selectedRef.current = (selectedRef.current - 1 + suggestions.length) % suggestions.length;
        suggestionsRef.current?.children[selectedRef.current]?.scrollIntoView({ block: "nearest" });
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions[selectedRef.current]) {
          insertMention(suggestions[selectedRef.current]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className={cn("resize-none font-mono text-sm", minHeight, className)}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
        >
          {suggestions.map((entity, idx) => {
            const config = typeConfig[entity.type];
            const Icon = config.icon;
            return (
              <button
                key={entity.id}
                onClick={() => insertMention(entity)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface-2 transition-colors",
                  idx === selectedRef.current && "bg-surface-2"
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="font-medium">{config.trigger}{entity.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
