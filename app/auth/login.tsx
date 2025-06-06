import React from 'react';
import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'expo-router';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { useLogin } from '~/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Mova os estilos para fora do componente para evitar re-criação
const scrollViewStyle = {
  flexGrow: 1,
  justifyContent: 'center' as const,
  padding: 16,
  alignItems: 'center' as const,
};

export default function LoginScreen() {
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange', // Adicione este modo para melhor UX
  });

  const onSubmit = React.useCallback((data: LoginFormValues) => {
    loginMutation.mutate(data);
  }, [loginMutation]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={scrollViewStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-sm mx-auto">
            {/* Header com cores da SIGT */}
            <View className="items-center justify-center space-y-6">
              <View className="relative h-24 items-center justify-center">
                {/* Logo SIGT */}
                <View className="w-full h-full border-0 rounded-xl items-center justify-center">
                  <Image
                    source={{ uri: 'https://app.sigt.com.br/sigt-without-bg.png' }}
                    style={{ width: 288, height: 96 }}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View className="mb-10 mt-10">
                <Text className="text-3xl text-center text-blue-900 font-montserrat-bold">
                  Acesse sua conta
                </Text>
                <Text className="text-blue-600 opacity-80 text-center font-montserrat">
                  Coloque suas informações de acesso abaixo
                </Text>
              </View>
            </View>

            {/* Form Card */}
            <Card className="border-blue-100 shadow-lg rounded-2xl">
              <CardContent className="space-y-6 p-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className='text-blue-600 font-montserrat-medium'>
                        Email:
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@exemplo.com.br"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          textContentType="emailAddress"
                          error={fieldState.error?.message}
                          className="border-blue-100 focus:border-blue-500 font-montserrat-medium"
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className='text-blue-600 font-montserrat-medium'>
                        Senha:
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite sua senha"
                          secureTextEntry
                          autoComplete="password"
                          textContentType="password"
                          error={fieldState.error?.message}
                          className="border-blue-100 focus:border-blue-500 font-montserrat-medium"
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <View className="text-center">
                  <Link href="/auth/reset-password" asChild>
                    <Text className="text-blue-600 opacity-80 underline mb-5 font-montserrat">
                      Esqueceu a senha?
                    </Text>
                  </Link>
                </View>

                <Button
                  size="lg"
                  className="w-full bg-orange-500 hover:bg-orange-600 font-montserrat-bold rounded-3xl"
                  onPress={form.handleSubmit(onSubmit)}
                  disabled={loginMutation.isPending}
                >
                  <Text className="text-white font-montserrat-bold">
                    {loginMutation.isPending ? 'Autenticando...' : 'Acessar'}
                  </Text>
                </Button>
              </CardContent>
            </Card>

            {/* Footer */}
            <Card className="mt-5 border-blue-100 bg-blue-50/70 border shadow-lg rounded-2xl">
              <CardContent className="text-center py-4">
                <Text className="text-blue-600 font-montserrat text-sm">
                  Não possui acesso?{' '}
                  <Link href="/auth/register" asChild>
                    <Text className="font-montserrat-semibold text-orange-500 underline">
                      Faça seu cadastro aqui
                    </Text>
                  </Link>
                </Text>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}