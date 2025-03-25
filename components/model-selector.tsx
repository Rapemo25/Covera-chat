"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Sparkles, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const models = [
  {
    value: "openai",
    label: "GPT-4o",
    icon: Sparkles,
    description: "OpenAI's most advanced model",
  },
  {
    value: "gemini",
    label: "Gemini Pro",
    icon: Brain,
    description: "Google's advanced multimodal model",
  },
]

interface ModelSelectorProps {
  onModelChange: (value: string) => void
  defaultValue?: string
}

export function ModelSelector({ onModelChange, defaultValue = "openai" }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)

  const selectedModel = models.find((model) => model.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <div className="flex items-center">
            {selectedModel && <selectedModel.icon className="mr-2 h-4 w-4 shrink-0 text-primary" />}
            <span>{selectedModel?.label || "Select model..."}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue)
                    onModelChange(currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === model.value ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <model.icon className="mr-2 h-4 w-4 text-primary" />
                      {model.label}
                    </div>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

