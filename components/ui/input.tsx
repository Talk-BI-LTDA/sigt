import * as React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { cn } from '~/lib/utils';
import { Text } from '~/components/ui/text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, containerClassName, label, error, ...props }, ref) => {
    return (
      <View className={cn('space-y-2', containerClassName)}>
        {label && (
          <Text className="text-sm font-medium text-foreground">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground',
            'web:ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground web:focus-visible:outline-none web:focus-visible:ring-2',
            'web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
            className
          )}
          placeholderTextColor="#71717a"
          {...props}
        />
        {error && (
          <Text className="text-sm font-medium text-destructive">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input };