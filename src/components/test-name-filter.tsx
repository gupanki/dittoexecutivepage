import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";

interface TestNameFilterProps {
  availableTests: string[];
  selectedTests: string[];
  onSelectionChange: (tests: string[]) => void;
  className?: string;
}

export function TestNameFilter({
  availableTests,
  selectedTests,
  onSelectionChange,
  className,
}: TestNameFilterProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (testName: string) => {
    if (selectedTests.includes(testName)) {
      onSelectionChange(selectedTests.filter((t) => t !== testName));
    } else {
      onSelectionChange([...selectedTests, testName]);
    }
  };

  const handleRemove = (testName: string) => {
    onSelectionChange(selectedTests.filter((t) => t !== testName));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedTests.length === 0
              ? "Select test names..."
              : `${selectedTests.length} test${selectedTests.length > 1 ? 's' : ''} selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search test names..." />
            <CommandList>
              <CommandEmpty>No test found.</CommandEmpty>
              <CommandGroup>
                {availableTests.map((testName) => (
                  <CommandItem
                    key={testName}
                    value={testName}
                    onSelect={() => handleSelect(testName)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTests.includes(testName) 
                          ? "opacity-100" 
                          : "opacity-0"
                      )}
                    />
                    {testName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedTests.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTests.map((testName) => (
            <Badge key={testName} variant="secondary">
              {testName}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRemove(testName);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleRemove(testName)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          {selectedTests.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAll}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}