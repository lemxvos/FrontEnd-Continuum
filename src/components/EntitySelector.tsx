/**
 * ENTITY SELECTOR
 *
 * Autocomplete para selecionar entidades e inserir como menção
 *
 * FLUXO:
 * 1. Usuário digita no editor: "Saí com {pe"
 * 2. Componente detecta o padrão {pe
 * 3. Busca entidades que começam com "pe"
 * 4. Mostra dropdown com sugestões
 * 5. Usuário clica ou pressiona Enter
 * 6. Frontend INSERE {type:id} no texto
 * 7. Backend recebe e valida tudo
 */

import { useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Entity, EntityType } from "@/types/models";
import { useEntityStore } from "@/stores/entityStore";
import { EntityBadge } from "./EntityBadge";

interface EntitySelectorProps {
  /**
   * Quando usuário seleciona uma entidade
   * Frontend passa:
   * - entity: a entidade completa
   * - Frontend será RESPONSÁVEL de inserir no textarea
   */
  onSelect: (entity: Entity) => void;

  // Opcional: filtrar por tipo
  entityType?: EntityType;

  // Opcional: placeholder
  placeholder?: string;

  // Se deve abrir dropdown automaticamente
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Query inicial (do autocomplete)
  initialQuery?: string;
}

export function EntitySelector({
  onSelect,
  entityType,
  placeholder = "Buscar entidade...",
  isOpen = false,
  onOpenChange,
  initialQuery = "",
}: EntitySelectorProps) {
  const [open, setOpen] = useState(isOpen);
  const [query, setQuery] = useState(initialQuery);
  const { search, lastSearchResults } = useEntityStore();
  const commandRef = useRef<HTMLDivElement>(null);

  // Busca automaticamente ao mudar query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query, entityType);
      }
    }, 200); // Debounce

    return () => clearTimeout(timer);
  }, [query, entityType, search]);

  const handleSelect = (entity: Entity) => {
    onSelect(entity);
    setOpen(false);
    setQuery("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {/* Não renderiza um botão, apenas ativa o popover */}
        <div />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            autoFocus
          />
          <CommandList>
            {lastSearchResults.length === 0 && query.trim() && (
              <CommandEmpty>Nenhuma entidade encontrada</CommandEmpty>
            )}

            {lastSearchResults.length > 0 && (
              <CommandGroup>
                {lastSearchResults.map((entity) => (
                  <CommandItem
                    key={entity.id}
                    value={entity.id}
                    onSelect={() => handleSelect(entity)}
                  >
                    <EntityBadge entity={entity} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
