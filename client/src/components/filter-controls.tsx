import { Button } from "@/components/ui/button";
import { Clock, Percent, DollarSign, Bell } from "lucide-react";

type SortOption = "lastActivity" | "progress" | "cost" | "aiUpdates";

interface FilterControlsProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

export default function FilterControls({ sortBy, onSortChange }: FilterControlsProps) {
  const sortOptions = [
    {
      key: "lastActivity" as const,
      label: "Last Worked",
      icon: Clock,
    },
    {
      key: "progress" as const,
      label: "Progress",
      icon: Percent,
    },
    {
      key: "cost" as const,
      label: "Cost",
      icon: DollarSign,
    },
    {
      key: "aiUpdates" as const,
      label: "Updates",
      icon: Bell,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {sortOptions.map((option) => (
        <Button
          key={option.key}
          variant={sortBy === option.key ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange(option.key)}
          className={
            sortBy === option.key
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
          }
        >
          <option.icon className="w-4 h-4 mr-2" />
          {option.label}
        </Button>
      ))}
    </div>
  );
}
