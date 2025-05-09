
import React from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type LeadsSearchBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export const LeadsSearchBar: React.FC<LeadsSearchBarProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search leads..." 
        className="pl-9 w-full"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};
