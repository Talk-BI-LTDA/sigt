import React, { useState } from 'react';
import { View, Pressable, Alert, Modal } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Upload, X, FileText, ChevronDown, Check } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { cn } from '~/lib/utils';

export interface FileWithType {
  uri: string;
  name: string;
  type: string;
  size: number;
  documentTypeId: string | null;
}

export interface DocumentType {
  id: string;
  documentType: string;
}

interface DocumentUploadProps {
  files: FileWithType[];
  onFilesChange: (files: FileWithType[]) => void;
  documentTypes: DocumentType[];
  disabled?: boolean;
  className?: string;
}

interface DocumentTypeSelectorProps {
  documentTypes: DocumentType[];
  selectedTypeId: string | null;
  onTypeSelect: (typeId: string) => void;
  placeholder?: string;
}

function DocumentTypeSelector({
  documentTypes,
  selectedTypeId,
  onTypeSelect,
  placeholder = "Selecione o tipo"
}: DocumentTypeSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedType = documentTypes.find(type => type.id === selectedTypeId);

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        className={cn(
          'flex-row items-center justify-between p-3 border rounded-xl bg-background',
          selectedTypeId ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
        )}
      >
        <Text className={cn(
          'flex-1 font-montserrat',
          selectedTypeId ? 'text-blue-900' : 'text-gray-500'
        )}>
          {selectedType ? selectedType.documentType : placeholder}
        </Text>
        <ChevronDown className="text-gray-400 ml-2" size={16} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl max-w-sm w-full max-h-96">
            <View className="p-6 border-b border-gray-100">
              <Text className="text-xl font-montserrat-bold text-center text-blue-900">
                Selecionar Tipo de Documento
              </Text>
            </View>

            <View className="max-h-80">
              {documentTypes.map((docType) => (
                <Pressable
                  key={docType.id}
                  onPress={() => {
                    onTypeSelect(docType.id);
                    setModalVisible(false);
                  }}
                  className={cn(
                    'flex-row items-center justify-between p-4 border-b border-gray-50',
                    'active:bg-blue-50'
                  )}
                >
                  <Text className="flex-1 font-montserrat text-gray-900">
                    {docType.documentType}
                  </Text>
                  {selectedTypeId === docType.id && (
                    <Check className="text-blue-600 ml-2" size={20} />
                  )}
                </Pressable>
              ))}
            </View>

            <View className="p-4 border-t border-gray-100">
              <Button
                variant="outline"
                onPress={() => setModalVisible(false)}
                className="w-full rounded-xl"
              >
                <Text className="font-montserrat-medium">Cancelar</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function DocumentUpload({
  files,
  onFilesChange,
  documentTypes = [],
  disabled = false,
  className,
}: DocumentUploadProps) {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const newFiles = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
          documentTypeId: null,
        }));

        onFilesChange([...files, ...newFiles]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo');
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const updateFileType = (index: number, documentTypeId: string) => {
    const updatedFiles = files.map((file, i) =>
      i === index ? { ...file, documentTypeId } : file
    );
    onFilesChange(updatedFiles);
  };

  const getSelectedDocumentType = (documentTypeId: string | null) => {
    if (!documentTypeId) return null;
    return documentTypes.find(type => type.id === documentTypeId);
  };

  return (
    <View className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Pressable
        onPress={pickDocument}
        disabled={disabled}
        className={cn(
          'border-2 border-dashed border-blue-200 rounded-xl p-8 items-center justify-center',
          'active:border-orange-400 active:bg-orange-50',
          disabled && 'opacity-50'
        )}
      >
        <Upload className="text-blue-500 mb-4" size={40} />
        <Text className="text-center text-blue-900 font-montserrat-bold">
          Toque para adicionar documentos
        </Text>
        <Text className="text-center text-blue-600 text-sm mt-1 font-montserrat">
          Você pode enviar múltiplos arquivos
        </Text>
      </Pressable>

      {/* Files List */}
      {files.length > 0 && (
        <View className="space-y-3 mt-5 flex-col gap-5">
          <Text className="font-montserrat-bold text-blue-900 text-lg">
            Documentos ({files.length})
          </Text>

          {files.map((file, index) => {
            const selectedType = getSelectedDocumentType(file.documentTypeId);
            const hasType = !!file.documentTypeId;

            return (
              <Card
                key={index}
                className={cn(
                  'shadow-sm rounded-2xl ',
                  hasType ? 'border-blue-200 bg-blue-50/30' : 'border-orange-200 bg-orange-50/30 '
                )}
              >
                <CardContent className="p-5 ">
                  {/* Arquivo Info */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                      <View className={cn(
                        'w-12 h-12 rounded-xl items-center justify-center mr-3',
                        hasType ? 'bg-blue-100' : 'bg-orange-100'
                      )}>
                        <FileText
                          className={hasType ? 'text-blue-600' : 'text-orange-600'}
                          size={20}
                        />
                      </View>

                      <View className="flex-1">
                        <Text
                          className="font-montserrat-medium text-gray-900 text-base"
                          numberOfLines={1}
                        >
                          {file.name}
                        </Text>
                        <Text className="text-gray-600 text-sm font-montserrat">
                          {(file.size / 1024).toFixed(1)} KB
                        </Text>
                        {selectedType && (
                          <Text className="text-blue-600 text-sm font-montserrat-medium mt-1">
                            📄 {selectedType.documentType}
                          </Text>
                        )}
                      </View>
                    </View>

                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => removeFile(index)}
                      className="text-red-500 hover:bg-red-50 rounded-xl p-2"
                    >
                      <X size={18} />
                    </Button>
                  </View>

                  {/* Tipo de Documento Selector */}
                  <View className="space-y-2">
                    <Text className={cn(
                      'font-montserrat-medium text-sm',
                      hasType ? 'text-blue-700' : 'text-orange-700'
                    )}>
                      Tipo de documento:
                    </Text>

                    <DocumentTypeSelector
                      documentTypes={documentTypes}
                      selectedTypeId={file.documentTypeId}
                      onTypeSelect={(typeId) => updateFileType(index, typeId)}
                      placeholder={hasType ? "Tipo selecionado" : "⚠️ Selecione o tipo"}
                    />

                    {!hasType && (
                      <Text className="text-orange-600 text-xs font-montserrat">
                        ⚠️ É obrigatório selecionar o tipo do documento
                      </Text>
                    )}
                  </View>
                </CardContent>
              </Card>
            );
          })}
        </View>
      )}

      {/* Resumo/Status */}
      {files.length > 0 && (
        <Card className="border-blue-100 bg-blue-50/50 rounded-2xl mt-5">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-montserrat-bold text-blue-900">
                  Status dos documentos
                </Text>
                <Text className="text-blue-600 text-sm font-montserrat">
                  {files.filter(f => f.documentTypeId).length} de {files.length} com tipo selecionado
                </Text>
              </View>

              <View className={cn(
                'px-3 py-2 rounded-xl',
                files.every(f => f.documentTypeId)
                  ? 'bg-green-100'
                  : 'bg-orange-100'
              )}>
                <Text className={cn(
                  'text-xs font-montserrat-bold',
                  files.every(f => f.documentTypeId)
                    ? 'text-green-700'
                    : 'text-orange-700'
                )}>
                  {files.every(f => f.documentTypeId) ? '✅ Completo' : '⚠️ Pendente'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      )}
    </View>
  );
}