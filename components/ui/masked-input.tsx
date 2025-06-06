import React, { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '~/lib/utils';

interface MaskedInputProps extends TextInputProps {
  mask: string;
  className?: string;
  error?: string;
}

export const MaskedInput = forwardRef<TextInput, MaskedInputProps>(
  ({ mask, value = '', onChangeText, className, ...props }, ref) => {
    const applyMask = (text: string, maskPattern: string) => {
      const numbers = text.replace(/\D/g, '');

      let masked = '';
      let numberIndex = 0;

      for (let i = 0; i < maskPattern.length && numberIndex < numbers.length; i++) {
        if (maskPattern[i] === '9') {
          masked += numbers[numberIndex];
          numberIndex++;
        } else {
          masked += maskPattern[i];
        }
      }

      return masked;
    };

    const handleChangeText = (text: string) => {
      const maskedText = applyMask(text, mask);
      onChangeText?.(maskedText);
    };

    return (
      <TextInput
        ref={ref}
        value={applyMask(value, mask)}
        onChangeText={handleChangeText}
        className={cn(
          'flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground',
          'web:ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground web:focus-visible:outline-none web:focus-visible:ring-2',
          'web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 font-montserrat',
          className
        )}
        placeholderTextColor="#71717a"
        {...props}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';