import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionMenuItem {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface Props {
  items: ActionMenuItem[];
}

const ActionMenu = ({ items }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition-colors">
        <MoreVertical className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 glass-card rounded-xl shadow-xl py-1 z-50">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.onClick(); setOpen(false); }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors",
                item.destructive ? "text-destructive" : "text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
