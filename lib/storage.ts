import * as SecureStore from "expo-secure-store";

export async function save(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error);
  }
}

export async function getValueFor(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Erro ao recuperar ${key}:`, error);
    return null;
  }
}

export async function deleteValueFor(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Erro ao deletar ${key}:`, error);
  }
}
