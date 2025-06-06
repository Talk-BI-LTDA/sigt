import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Key,
  Calendar,
  GraduationCap,
  FileUp,
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  TrendingUp
} from 'lucide-react-native';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { MaskedInput } from '~/components/ui/masked-input';
import { DatePicker } from '~/components/ui/date-picker';
import { MultipleSelector, Option } from '~/components/ui/multiple-selector';
import { DocumentUpload, FileWithType } from '~/components/ui/document-upload';
import { API_CONFIG } from '~/lib/api';
import { cn } from '~/lib/utils';

// Mover estilos para fora do componente
const scrollViewStyle = {
  flexGrow: 1,
  justifyContent: 'center' as const,
  padding: 16,
  alignItems: 'center' as const,
};

// Schema de validação
const registerSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  userType: z.enum(['user', 'driver']),
  cnh: z.string().optional(),
  cnhExpiration: z.date().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface CourseDetail {
  courseTypeId: string;
  coursesExpiration: string;
  completionDate: string;
}

interface DocumentType {
  id: string;
  documentType: string;
}

interface CourseType {
  id: string;
  courseName: string;
}

export default function RegisterScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'driver'>('user');

  // Estados para motorista
  const [selectedCourses, setSelectedCourses] = useState<Option[]>([]);
  const [courseDetails, setCourseDetails] = useState<CourseDetail[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithType[]>([]);

  // Estados para dados da API
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [courseOptions, setCourseOptions] = useState<Option[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      cpf: '',
      password: '',
      confirmPassword: '',
      userType: 'user',
    },
    mode: 'onChange', // Melhor UX
  });

  const totalSteps = userType === 'driver' ? 3 : 1;

  // Verificar força da senha
  const getPasswordStrength = (password: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "Mínimo 8 caracteres" },
      { regex: /[a-z]/, text: "Letra minúscula" },
      { regex: /[A-Z]/, text: "Letra maiúscula" },
      { regex: /\d/, text: "Número" },
      { regex: /[@$!%*?&]/, text: "Caractere especial" },
    ];

    return requirements.map(req => ({
      ...req,
      valid: req.regex.test(password)
    }));
  };

  const passwordRequirements = getPasswordStrength(form.watch('password'));
  const passwordScore = passwordRequirements.filter(req => req.valid).length;

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [docTypesRes, courseTypesRes] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}/document-types`),
          fetch(`${API_CONFIG.BASE_URL}/course-types/active`),
        ]);

        if (docTypesRes.ok) {
          const docTypes = await docTypesRes.json();
          setDocumentTypes(docTypes);
        }

        if (courseTypesRes.ok) {
          const courseTypes = await courseTypesRes.json();
          const options = courseTypes.map((course: CourseType) => ({
            label: course.courseName,
            value: course.id,
          }));
          setCourseOptions(options);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Atualizar detalhes do curso quando cursos são selecionados
  useEffect(() => {
    setCourseDetails(prev => {
      const newDetails = [...prev];

      selectedCourses.forEach(course => {
        if (!newDetails.find(detail => detail.courseTypeId === course.value)) {
          newDetails.push({
            courseTypeId: course.value,
            coursesExpiration: '',
            completionDate: '',
          });
        }
      });

      return newDetails.filter(detail =>
        selectedCourses.find(course => course.value === detail.courseTypeId)
      );
    });
  }, [selectedCourses]);

  const handleUserTypeChange = React.useCallback((type: 'user' | 'driver') => {
    setUserType(type);
    form.setValue('userType', type);
    setCurrentStep(1);
  }, [form]);

  const nextStep = React.useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = React.useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const validateStep = () => {
    const formValues = form.getValues();

    switch (currentStep) {
      case 1:
        return (
          formValues.firstName &&
          formValues.lastName &&
          formValues.email &&
          formValues.phone &&
          formValues.cpf &&
          formValues.password &&
          formValues.confirmPassword &&
          passwordScore >= 5 &&
          formValues.password === formValues.confirmPassword
        );
      case 2:
        return selectedCourses.length > 0 && courseDetails.every(detail => detail.coursesExpiration);
      case 3:
        return uploadedFiles.length > 0 && uploadedFiles.every(file => file.documentTypeId);
      default:
        return false;
    }
  };

  const onSubmit = React.useCallback(async (data: RegisterFormValues) => {
    if (userType === 'driver' && currentStep < totalSteps) {
      nextStep();
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Dados básicos
      formData.append('name', `${data.firstName} ${data.lastName}`);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('cpf', data.cpf.replace(/\D/g, ''));
      formData.append('phoneNumber', data.phone.replace(/\D/g, ''));
      formData.append('userType', userType);

      // Dados específicos do motorista
      if (userType === 'driver') {
        if (data.cnh) formData.append('cnh', data.cnh.replace(/\D/g, ''));
        if (data.cnhExpiration) {
          formData.append('cnhExpiration', data.cnhExpiration.toISOString().split('T')[0]);
        }

        formData.append('courseTypes', JSON.stringify(selectedCourses.map(c => c.value)));
        formData.append('courses', JSON.stringify(courseDetails));

        // Documentos
        const documentsMetadata = uploadedFiles.map(file => ({
          documentTypeId: file.documentTypeId,
          filename: file.name,
        }));
        formData.append('documents', JSON.stringify(documentsMetadata));

        // Arquivos
        uploadedFiles.forEach(file => {
          formData.append('files', {
            uri: file.uri,
            type: file.type,
            name: file.name,
          } as any);
        });
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        router.replace('/auth/login');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no cadastro');
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      alert(error.message || 'Erro no cadastro');
    } finally {
      setIsLoading(false);
    }
  }, [userType, currentStep, totalSteps, nextStep, selectedCourses, courseDetails, uploadedFiles]);

  const StepIndicators = React.useMemo(() => {
    if (userType !== 'driver') return null;

    return (
      <View className="flex-row justify-center items-center mb-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} className="flex-row items-center">
            <View
              className={cn(
                'w-12 h-12 rounded-full items-center justify-center border-2 transition-all shadow-md ',
                currentStep > index + 1
                  ? 'bg-blue-600 border-blue-600 '
                  : currentStep === index + 1
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-blue-100 bg-white'
              )}
            >
              {currentStep > index + 1 ? (
                <Check size={20} className="text-white" />
              ) : (
                <Text
                  className={cn(
                    'font-montserrat-bold text-lg',
                    currentStep === index + 1 ? 'text-orange-500' : 'text-blue-600'
                  )}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            {index < 2 && (
              <View
                className={cn(
                  'w-16 h-1 rounded-full',
                  currentStep > index + 1 ? 'bg-blue-600' : 'bg-blue-100'
                )}
              />
            )}
          </View>
        ))}
      </View>
    );
  }, [userType, currentStep]);

  const renderPasswordFields = () => (
    <>
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <View className="space-y-2 mt-5">
            <Text className="text-blue-600 font-montserrat-medium">Senha:</Text>
            <View className="relative">
              <Input
                placeholder="Digite sua senha"
                secureTextEntry={!showPassword}
                error={fieldState.error?.message}
                className="pl-10 pr-10 border-blue-100 focus:border-blue-500 font-montserrat rounded-2xl"
                autoComplete="new-password"
                textContentType="newPassword"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-blue-500 opacity-60" />
                ) : (
                  <Eye className="h-4 w-4 text-blue-500 opacity-60" />
                )}
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Indicador de força da senha */}
      {form.watch('password') && (
        <View className="space-y-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <View className="flex-row space-x-1 ">
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                className={cn(
                  'h-2 flex-1 rounded-full transition-all',
                  passwordScore >= level
                    ? passwordScore <= 2
                      ? 'bg-red-500'
                      : passwordScore <= 4
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    : 'bg-gray-200'
                )}
              />
            ))}
          </View>

          <View className="space-y-1">
            {passwordRequirements.map((req, index) => (
              <View key={index} className="flex-row items-center space-x-2">
                <CheckCircle
                  className={cn(
                    'h-3 w-3',
                    req.valid ? 'text-green-500' : 'text-gray-300'
                  )}
                />
                <Text
                  className={cn(
                    'text-xs font-montserrat',
                    req.valid ? 'text-green-600' : 'text-gray-500'
                  )}
                >
                  {req.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Controller
        control={form.control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <View className="space-y-2 mt-5">
            <Text className="text-blue-600 font-montserrat-medium">Confirme a senha:</Text>
            <View className="relative">
              <Input
                placeholder="Confirme sua senha"
                secureTextEntry={!showConfirmPassword}
                error={fieldState.error?.message}
                className="pl-10 pr-10 border-blue-100 focus:border-blue-500 font-montserrat rounded-2xl"
                autoComplete="new-password"
                textContentType="newPassword"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-blue-500 opacity-60" />
                ) : (
                  <Eye className="h-4 w-4 text-blue-500 opacity-60" />
                )}
              </Pressable>
            </View>
          </View>
        )}
      />
    </>
  );

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
          <View className="w-full max-w-md mx-auto mt-10">
            {/* Header com Logo SIGT */}
            <View className="items-center justify-center space-y-6">
              <View className="relative h-24 items-center justify-center">
                <View className="w-full h-full border-0 rounded-xl items-center justify-center">
                  <Image
                    source={{ uri: 'https://app.sigt.com.br/sigt-without-bg.png' }}
                    style={{ width: 228, height: 96 }}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View className="mb-10 mt-10">
                <Text className="text-3xl text-center text-blue-900 font-montserrat-bold">
                  Criar conta
                </Text>
                <Text className="text-blue-600 opacity-80 text-center font-montserrat">
                  {userType === 'driver'
                    ? `Passo ${currentStep}: ${currentStep === 1 ? 'Informações pessoais' :
                      currentStep === 2 ? 'Cursos e qualificações' :
                        'Documentos'
                    }`
                    : 'Preencha as informações para criar sua conta'
                  }
                </Text>
              </View>
            </View>

            {StepIndicators}

            {/* Form */}
            <Card className="border-blue-100 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                {/* Seleção de tipo de usuário */}
                <View className="space-y-3 mb-6">
                  <Text className="text-blue-600 font-montserrat-medium">Tipo de cadastro:</Text>
                  <View className="flex-row space-x-3">
                    <Pressable
                      onPress={() => handleUserTypeChange('user')}
                      className={cn(
                        'flex-1   flex-row items-center justify-center space-x-2 p-4 rounded-2xl border-2 transition-all shadow-sm mr-5',
                        userType === 'user'
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-blue-100 bg-white'
                      )}
                    >
                      <User className="h-5 w-5 text-blue-600 " />
                      <Text className="font-montserrat-medium text-blue-600 ml-5">Usuário</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleUserTypeChange('driver')}
                      className={cn(
                        'flex-1 flex-row items-center justify-center space-x-2 p-4 rounded-2xl border-2 transition-all shadow-sm',
                        userType === 'driver'
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-blue-100 bg-white'
                      )}
                    >
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <Text className="font-montserrat-medium text-blue-600 ml-5">Motorista</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Step 1: Informações pessoais */}
                {(userType === 'user' || currentStep === 1) && (
                  <View className="space-y-5">
                    {/* Nome e Sobrenome */}
                    <View className="flex-row space-x-4 mt-4 ">
                      <Controller
                        control={form.control}
                        name="firstName"
                        render={({ field, fieldState }) => (
                          <View className="flex-1 space-y-2 mr-5">
                            <Text className="text-blue-600 font-montserrat-medium">Nome:</Text>
                            <View className="relative">
                              <Input
                                placeholder="Nome"
                                error={fieldState.error?.message}
                                className="pl-10 border-blue-100 focus:border-blue-500 font-montserrat rounded-2xl"
                                autoComplete="given-name"
                                textContentType="givenName"
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                              />
                            </View>
                          </View>
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="lastName"
                        render={({ field, fieldState }) => (
                          <View className="flex-1 space-y-2">
                            <Text className="text-blue-600 font-montserrat-medium">Sobrenome:</Text>
                            <Input
                              placeholder="Sobrenome"
                              error={fieldState.error?.message}
                              className="border-blue-100 focus:border-blue-500 font-montserrat rounded-2xl"
                              autoComplete="family-name"
                              textContentType="familyName"
                              value={field.value}
                              onChangeText={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </View>
                        )}
                      />
                    </View>

                    {/* Email */}
                    <Controller
                      control={form.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <View className="space-y-2 mt-4">
                          <Text className="text-blue-600 font-montserrat-medium">Email:</Text>
                          <View className="relative">
                            <Input
                              placeholder="email@exemplo.com.br"
                              keyboardType="email-address"
                              autoCapitalize="none"
                              error={fieldState.error?.message}
                              className="pl-10 border-blue-100 focus:border-blue-500 font-montserrat rounded-2xl"
                              autoComplete="email"
                              textContentType="emailAddress"
                              value={field.value}
                              onChangeText={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </View>
                        </View>
                      )}
                    />

                    {/* Telefone e CPF */}
                    <View className="flex-row space-x-4 mt-4 ">
                      <Controller
                        control={form.control}
                        name="phone"
                        render={({ field, fieldState }) => (
                          <View className="flex-1 space-y-2">
                            <Text className="text-blue-600 font-montserrat-medium">Celular:</Text>
                            <View className="relative">
                              <MaskedInput
                                mask="(99) 99999-9999"
                                placeholder="(00) 00000-0000"
                                className="pl-10 border-blue-100 focus:border-blue-500 font-montserrat rounded-2xl"
                                autoComplete="tel"
                                textContentType="telephoneNumber"
                                keyboardType="phone-pad"
                                value={field.value}
                                onChangeText={field.onChange}
                              />
                            </View>
                          </View>
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="cpf"
                        render={({ field, fieldState }) => (
                          <View className="flex-1">
                            <Text className="text-blue-600 font-montserrat-medium">CPF:</Text>
                            <View className="relative">
                              <MaskedInput
                                mask="999.999.999-99"
                                placeholder="000.000.000-00"
                                className="pl-10 border-blue-100 focus:border-blue-500 font-montserrat rounded-2xl"
                                keyboardType="number-pad"
                                value={field.value}
                                onChangeText={field.onChange}
                              />
                            </View>
                          </View>
                        )}
                      />
                    </View>

                    {/* Campos específicos do motorista */}
                    {userType === 'driver' && (
                      <View className="flex-row space-x-4">
                        <Controller
                          control={form.control}
                          name="cnh"
                          render={({ field }) => (
                            <View className="flex-1 space-y-2 mr-5">
                              <Text className="text-blue-600 font-montserrat-medium">CNH:</Text>
                              <View className="relative">
                                <MaskedInput
                                  mask="99999999999"
                                  placeholder="00000000000"
                                  className="pl-10 border-blue-100 focus:border-blue-500 font-montserrat rounded-2xl"
                                  keyboardType="number-pad"
                                  value={field.value || ''}
                                  onChangeText={field.onChange}
                                />
                              </View>
                            </View>
                          )}
                        />

                        <Controller
                          control={form.control}
                          name="cnhExpiration"
                          render={({ field }) => (
                            <View className="flex-1 space-y-2">
                              <Text className="text-blue-600 font-montserrat-medium">Validade CNH:</Text>
                              <View className="relative">
                                <DatePicker
                                  selectedDate={field.value}
                                  onDateChange={field.onChange}
                                  minDate={new Date()}
                                  placeholder="Selecione"
                                  className="pl-10 border-blue-100 focus:border-blue-500 rounded-2xl"
                                />
                              </View>
                            </View>
                          )}
                        />
                      </View>
                    )}

                    {/* Campos de senha */}
                    {renderPasswordFields()}
                  </View>
                )}

                {/* Step 2: Cursos (apenas para motorista) */}
                {userType === 'driver' && currentStep === 2 && (
                  <View className="space-y-5">
                    <View className="space-y-4">
                      <View className="flex-row items-center space-x-2 gap-2 flex mt-5">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                        <Text className="text-blue-900 font-montserrat-bold text-lg">
                          Cursos e qualificações
                        </Text>
                      </View>

                      <Text className="text-blue-600 font-montserrat opacity-80 mb-5">
                        Selecione os cursos e certificações que você possui:
                      </Text>

                      <View className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-5">
                        <MultipleSelector
                          options={courseOptions}
                          value={selectedCourses}
                          onChange={setSelectedCourses}
                          placeholder="Selecione seus cursos..."
                          className="border-blue-100"
                        />
                      </View>

                      {/* Detalhes dos cursos */}
                      {courseDetails.map((detail) => {
                        const course = selectedCourses.find(c => c.value === detail.courseTypeId);
                        if (!course) return null;

                        return (
                          <Card key={detail.courseTypeId} className="bg-blue-50/70 border-blue-200 shadow-sm rounded-2xl mb-5">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg font-montserrat-bold text-blue-900 flex-row items-center">
                                {course.label}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 ">
                              <View className="flex-row space-x-4">
                                <View className="flex-1">
                                  <Text className="text-blue-600 font-montserrat-medium mb-2">Data de validade:</Text>
                                  <View className="relative">
                                    <DatePicker
                                      selectedDate={detail.coursesExpiration ? new Date(detail.coursesExpiration) : undefined}
                                      onDateChange={(date) => {
                                        if (date) {
                                          setCourseDetails(prev => prev.map(d =>
                                            d.courseTypeId === detail.courseTypeId
                                              ? { ...d, coursesExpiration: date.toISOString().split('T')[0] }
                                              : d
                                          ));
                                        }
                                      }}
                                      minDate={new Date()}
                                      className="pl-10 border-blue-100 rounded-2xl"
                                    />
                                  </View>
                                </View>

                                <View className="flex-1">
                                  <Text className="text-blue-600 font-montserrat-medium mb-2">Data de conclusão:</Text>
                                  <View className="relative">
                                    <DatePicker
                                      selectedDate={detail.completionDate ? new Date(detail.completionDate) : undefined}
                                      onDateChange={(date) => {
                                        if (date) {
                                          setCourseDetails(prev => prev.map(d =>
                                            d.courseTypeId === detail.courseTypeId
                                              ? { ...d, completionDate: date.toISOString().split('T')[0] }
                                              : d
                                          ));
                                        }
                                      }}
                                      className="pl-10 border-blue-100 rounded-2xl"
                                    />
                                  </View>
                                </View>
                              </View>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Step 3: Documentos (apenas para motorista) */}
                {userType === 'driver' && currentStep === 3 && (
                  <View className="space-y-5">
                    <View className="space-y-4">
                      <View className="flex-row items-center space-x-2">
                        <FileUp className="h-6 w-6 text-blue-600" />
                        <Text className="text-blue-900 font-montserrat-bold text-lg">
                          Documentos
                        </Text>
                      </View>

                      <Text className="text-blue-600 font-montserrat opacity-80">
                        Adicione seus documentos e selecione o tipo para cada um:
                      </Text>

                      {/* Loading de tipos de documentos */}
                      {isLoadingData ? (
                        <Card className="border-blue-100 bg-blue-50/50 rounded-2xl">
                          <CardContent className="p-6 items-center">
                            <Loader2 className="animate-spin text-blue-600 mb-2" size={24} />
                            <Text className="text-blue-600 font-montserrat">
                              Carregando tipos de documentos...
                            </Text>
                          </CardContent>
                        </Card>
                      ) : (
                        <DocumentUpload
                          files={uploadedFiles}
                          onFilesChange={setUploadedFiles}
                          documentTypes={documentTypes} // ✅ Agora passa os tipos
                          disabled={isLoading}
                          className="rounded-2xl"
                        />
                      )}

                      {/* Dica sobre documentos obrigatórios */}
                      {documentTypes.length > 0 && (
                        <Card className="border-amber-200 bg-amber-50 rounded-2xl mt-5">
                          <CardContent className="p-4">
                            <View className="flex-row items-start space-x-3">
                              <View className="bg-amber-200 rounded-full p-1 mt-1 mr-2">
                                <Text className="text-amber-700 text-xs font-bold">💡</Text>
                              </View>
                              <View className="flex-1">
                                <Text className="font-montserrat-bold text-amber-800 mb-1">
                                  Dica sobre documentos:
                                </Text>
                                <Text className="text-amber-700 text-sm font-montserrat">
                                  Certifique-se de que todos os documentos estão legíveis e atualizados.
                                  Você pode adicionar múltiplos arquivos e selecionar o tipo apropriado para cada um.
                                </Text>
                              </View>
                            </View>
                          </CardContent>
                        </Card>
                      )}
                    </View>
                  </View>
                )}


                {/* Botões de navegação */}
                <View className=" flex-row justify-between pt-6">
                  {userType === 'driver' && currentStep > 1 ? (
                    <Button
                      variant="outline"
                      onPress={prevStep}
                      disabled={isLoading}
                      className="border-blue-500 text-blue-500 rounded-2xl font-montserrat-medium shadow-sm flex-row items-center justify-center w-1/3"
                    >
                      <ArrowLeft className="mr-2" size={16} />
                      <Text className="font-montserrat-medium">Voltar</Text>
                    </Button>
                  ) : (
                    <View />
                  )}

                  <Button
                    onPress={form.handleSubmit(onSubmit)}
                    disabled={isLoading || !validateStep()}
                    className={cn(
                      'bg-orange-500 hover:bg-orange-600 rounded-3xl font-montserrat-bold shadow-lg flex-row items-center justify-center gap-5',
                      (userType === 'user' || currentStep === totalSteps) && 'flex-1 ml-4'
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        <Text className="text-white font-montserrat-bold">Carregando...</Text>
                      </>
                    ) : userType === 'user' || currentStep === totalSteps ? (
                      <>
                        <Text className="text-white font-montserrat-bold">Finalizar cadastro</Text>
                        <Check className="ml-5" size={16} color={'#0059AB'} />
                      </>
                    ) : (
                      <>
                        <Text className="text-white font-montserrat-bold">Próximo</Text>
                        <ArrowRight className="ml-5" size={16} color={'#0059AB'} />
                      </>
                    )}
                  </Button>
                </View>
              </CardContent>
            </Card>

            {/* Footer */}
            <Card className="mt-5 border-blue-100 bg-blue-50/70 border shadow-lg rounded-2xl mb-10">
              <CardContent className="text-center py-3">
                <Text className="text-blue-600 font-montserrat text-sm">
                  Já possui acesso?{' '}
                  <Pressable onPress={() => router.push('/auth/login')}>
                    <Text className="font-montserrat-semibold text-orange-500 underline">
                      Faça o login aqui
                    </Text>
                  </Pressable>
                </Text>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}