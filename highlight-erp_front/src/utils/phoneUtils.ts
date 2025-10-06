// Утилиты для работы с телефонными номерами

/**
 * Форматирует телефонный номер в формат +7 (XXX) XXX-XX-XX
 * @param value - введенное значение
 * @returns отформатированный номер
 */
export const formatPhoneNumber = (value: string): string => {
  // Удаляем все нецифровые символы
  const cleaned = value.replace(/\D/g, '');

  // Если пусто, возвращаем пустую строку
  if (!cleaned) return '';

  // Начинаем с +7
  let formatted = '+7';

  // Если первая цифра 7 или 8, пропускаем её
  let digits = cleaned;
  if (cleaned.startsWith('7') || cleaned.startsWith('8')) {
    digits = cleaned.substring(1);
  }

  // Форматируем номер по частям
  if (digits.length > 0) {
    formatted += ' (' + digits.substring(0, 3);
  }
  if (digits.length >= 3) {
    formatted += ') ' + digits.substring(3, 6);
  }
  if (digits.length >= 6) {
    formatted += '-' + digits.substring(6, 8);
  }
  if (digits.length >= 8) {
    formatted += '-' + digits.substring(8, 10);
  }

  return formatted;
};

/**
 * Очищает телефонный номер от всех символов кроме цифр
 * @param value - отформатированный номер
 * @returns чистый номер (например, "79991234567")
 */
export const cleanPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');

  // Если начинается с 8, заменяем на 7
  if (cleaned.startsWith('8') && cleaned.length === 11) {
    return '7' + cleaned.substring(1);
  }

  // Если не начинается с 7, добавляем 7
  if (!cleaned.startsWith('7') && cleaned.length === 10) {
    return '7' + cleaned;
  }

  return cleaned;
};

/**
 * Обрабатывает изменение значения в инпуте телефона
 * @param newValue - новое значение
 * @param oldValue - старое значение
 * @returns отформатированное значение и позицию курсора
 */
export const handlePhoneChange = (newValue: string, oldValue: string = ''): { value: string; cursorPosition: number } => {
  const formatted = formatPhoneNumber(newValue);

  // Определяем позицию курсора
  let cursorPosition = formatted.length;

  // Если удаляем символы
  if (newValue.length < oldValue.length) {
    // Находим позицию курсора в старом значении
    const diff = oldValue.length - newValue.length;
    cursorPosition = formatted.length;
  }

  return { value: formatted, cursorPosition };
};

/**
 * Получает placeholder для поля телефона
 */
export const getPhonePlaceholder = (): string => {
  return '+7 (999) 999-99-99';
};

/**
 * Проверяет, валиден ли номер телефона
 * @param value - отформатированный или очищенный номер
 * @returns true если валиден
 */
export const isValidPhoneNumber = (value: string): boolean => {
  const cleaned = cleanPhoneNumber(value);
  return /^7\d{10}$/.test(cleaned);
};
