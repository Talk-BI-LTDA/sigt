import React, { useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface DatePickerProps {
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  placeholder = "Selecione uma data",
  className,
  disabled = false,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const handleDateSelect = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (date) {
      onDateChange(date);
    }
  };

  return (
    <View>
      <Pressable
        onPress={() => !disabled && setShowPicker(true)}
        className={cn(
          'flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2',
          'justify-center shadow-sm',
          disabled && 'opacity-50',
          className
        )}
      >
        <Text
          className={cn(
            'font-montserrat',
            selectedDate ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateSelect}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}
    </View>
  );
}