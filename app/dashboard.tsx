import React from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useAuthStore } from '~/store/auth';
import { useLogout } from '~/hooks/useAuth';
const scrollViewStyle = {
  flexGrow: 1,
  padding: 16,
};
export default function DashboardScreen() {
  const { user, driver, tokens } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Formatar data de expiração do token
  const formatTokenExpiry = (expiresIn: number) => {
    const date = new Date(expiresIn);
    return date.toLocaleString('pt-BR');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={scrollViewStyle} className="flex-1 bg-background p-4">
        <View className="space-y-6">
          {/* Card do Usuário */}
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo, {user?.name || 'Usuário'}!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Text className="text-muted-foreground">
                ID: {user?.formattedId}
              </Text>
              <Text className="text-muted-foreground">
                Email: {user?.email}
              </Text>
              <Text className="text-muted-foreground">
                Status: {user?.status}
              </Text>
              <Text className="text-muted-foreground">
                CPF: {user?.cpf}
              </Text>
              <Text className="text-muted-foreground">
                Telefone: {user?.phoneNumber}
              </Text>
              {user?.approvedDate && (
                <Text className="text-muted-foreground">
                  Aprovado em: {new Date(user.approvedDate).toLocaleDateString('pt-BR')}
                </Text>
              )}
            </CardContent>
          </Card>

          {/* Card do Motorista (se existir) */}
          {driver && (
            <Card>
              <CardHeader>
                <CardTitle>Dados do Motorista</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Text className="text-muted-foreground">
                  ID: {driver.formattedId}
                </Text>
                <Text className="text-muted-foreground">
                  CNH: {driver.driverLicenseNumber}
                </Text>
                <Text className="text-muted-foreground">
                  Validade CNH: {new Date(driver.driverLicenseExpiration).toLocaleDateString('pt-BR')}
                </Text>
                <Text className="text-muted-foreground">
                  Status: {driver.status}
                </Text>
              </CardContent>
            </Card>
          )}

          {/* Card do Token (debug) */}
          {tokens && (
            <Card>
              <CardHeader>
                <CardTitle>Informações da Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Text className="text-muted-foreground">
                  Token expira em: {formatTokenExpiry(tokens.expiresIn)}
                </Text>
                <Text className="text-muted-foreground">
                  Refresh token: {tokens.refreshToken ? 'Disponível' : 'Não disponível'}
                </Text>
              </CardContent>
            </Card>
          )}

          <Button
            variant="destructive"
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <Text>
              {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}