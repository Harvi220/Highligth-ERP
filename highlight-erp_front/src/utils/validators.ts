// Утилиты для валидации форм

export interface ValidationError {
  field: string;
  message: string;
}

// Валидация обязательного поля
export const validateRequired = (value: string | null | undefined, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} обязательно для заполнения`;
  }
  return null;
};

// Валидация максимальной длины
export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value && value.length > maxLength) {
    return `${fieldName} не должно превышать ${maxLength} символов`;
  }
  return null;
};

// Валидация минимальной длины
export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value && value.length < minLength) {
    return `${fieldName} должно содержать минимум ${minLength} символов`;
  }
  return null;
};

// Валидация только букв (кириллица и латиница)
export const validateLettersOnly = (value: string, fieldName: string): string | null => {
  if (value && !/^[а-яёА-ЯЁa-zA-Z\s-]+$/.test(value)) {
    return `${fieldName} должно содержать только буквы`;
  }
  return null;
};

// Валидация номера телефона (формат: 7XXXXXXXXXX - 11 цифр)
export const validatePhone = (value: string): string | null => {
  const cleaned = value.replace(/\D/g, '');

  if (!cleaned) {
    return 'Номер телефона обязателен для заполнения';
  }

  if (cleaned.length !== 11) {
    return 'Номер телефона должен содержать 11 цифр';
  }

  if (!cleaned.startsWith('7')) {
    return 'Номер телефона должен начинаться с 7';
  }

  return null;
};

// Валидация пароля
export const validatePassword = (value: string, isRequired: boolean = true): string | null => {
  if (!value) {
    return isRequired ? 'Пароль обязателен для заполнения' : null;
  }

  if (value.length < 8) {
    return 'Пароль должен содержать минимум 8 символов';
  }

  return null;
};

// Валидация файла
export const validateFile = (
  file: File | null,
  options: {
    required?: boolean;
    maxSize?: number; // в байтах
    allowedTypes?: string[]; // MIME types или расширения
  } = {}
): string | null => {
  const { required = true, maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options;

  if (!file) {
    return required ? 'Файл обязателен для загрузки' : null;
  }

  // Проверка размера
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `Размер файла не должен превышать ${maxSizeMB} МБ`;
  }

  // Проверка типа файла
  if (allowedTypes.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.some(type => {
      if (type.includes('/')) {
        // MIME type
        return file.type === type;
      } else {
        // Расширение файла
        return fileExtension === type.toLowerCase();
      }
    });

    if (!isValidType) {
      return `Допустимые форматы файлов: ${allowedTypes.join(', ')}`;
    }
  }

  return null;
};

// Комбинированная валидация для имени/фамилии/отчества
export const validateName = (value: string, fieldName: string, required: boolean = true): string[] => {
  const errors: string[] = [];

  if (required) {
    const requiredError = validateRequired(value, fieldName);
    if (requiredError) errors.push(requiredError);
  }

  if (value) {
    const maxLengthError = validateMaxLength(value, 255, fieldName);
    if (maxLengthError) errors.push(maxLengthError);

    const lettersError = validateLettersOnly(value, fieldName);
    if (lettersError) errors.push(lettersError);
  }

  return errors;
};

// Валидация формы документа
export interface DocumentFormData {
  title: string;
  description: string;
  file: File | null;
}

export const validateDocumentForm = (data: DocumentFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Название
  const titleRequired = validateRequired(data.title, 'Название');
  if (titleRequired) {
    errors.title = titleRequired;
  } else {
    const titleMaxLength = validateMaxLength(data.title, 255, 'Название');
    if (titleMaxLength) errors.title = titleMaxLength;
  }

  // Описание (опционально, но с ограничением длины)
  if (data.description) {
    const descMaxLength = validateMaxLength(data.description, 5000, 'Описание');
    if (descMaxLength) errors.description = descMaxLength;
  }

  // Файл
  const fileError = validateFile(data.file, {
    required: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['pdf', 'docx', 'xlsx']
  });
  if (fileError) errors.file = fileError;

  return errors;
};

// Валидация формы сотрудника
export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
  password: string;
  positionId: number | null;
  isEdit?: boolean; // для определения, обязателен ли пароль
}

export const validateEmployeeForm = (data: EmployeeFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Фамилия
  const lastNameErrors = validateName(data.lastName, 'Фамилия', true);
  if (lastNameErrors.length > 0) errors.lastName = lastNameErrors[0];

  // Имя
  const firstNameErrors = validateName(data.firstName, 'Имя', true);
  if (firstNameErrors.length > 0) errors.firstName = firstNameErrors[0];

  // Отчество (опционально)
  const patronymicErrors = validateName(data.patronymic, 'Отчество', false);
  if (patronymicErrors.length > 0) errors.patronymic = patronymicErrors[0];

  // Телефон
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  // Пароль
  const passwordError = validatePassword(data.password, !data.isEdit);
  if (passwordError) errors.password = passwordError;

  // Должность
  if (!data.positionId) {
    errors.position = 'Выберите должность';
  }

  return errors;
};
