import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { X } from 'lucide-react-native';
import { cn } from '~/lib/utils';

export interface Option {
  label: string;
  value: string;
}

interface MultipleSelectorProps {
  options: Option[];
  value: Option[];
  onChange: (value: Option[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultipleSelector({
  options,
  value,
  onChange,
  placeholder = "Selecione opções...",
  className,
}: MultipleSelectorProps) {
  const [search, setSearch] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase()) &&
    !value.find(v => v.value === option.value)
  );

  const addOption = (option: Option) => {
    onChange([...value, option]);
    setSearch('');
  };

  const removeOption = (optionToRemove: Option) => {
    onChange(value.filter(option => option.value !== optionToRemove.value));
  };

  return (
    <View className={cn('space-y-2', className)}>
      {/* Selected options */}
      {value.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2 pb-2">
            {value.map((option) => (
              <View
                key={option.value}
                className="flex-row items-center bg-blue-100 rounded-lg px-3 py-1"
              >
                <Text className="text-blue-800 text-sm mr-2">{option.label}</Text>
                <Pressable onPress={() => removeOption(option)}>
                  <X size={14} className="text-blue-600" />
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Search input */}
      <Input
        placeholder={placeholder}
        value={search}
        onChangeText={setSearch}
        onFocus={() => setShowOptions(true)}
        className="border-blue-100"
      />

      {/* Options dropdown */}
      {showOptions && (
        <View className="border border-input rounded-md bg-background max-h-48">
          <ScrollView>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => addOption(option)}
                  className="p-3 border-b border-border active:bg-muted"
                >
                  <Text>{option.label}</Text>
                </Pressable>
              ))
            ) : (
              <View className="p-6">
                <Text className="text-center text-muted-foreground">
                  Nenhum resultado encontrado
                </Text>
              </View>
            )}
          </ScrollView>

          <Button
            variant="ghost"
            onPress={() => setShowOptions(false)}
            className="m-2"
          >
            <Text>Fechar</Text>
          </Button>
        </View>
      )}
    </View>
  );
}