// ============================================
// Error Handler для Admin Panel
// ============================================

/**
 * Единая обработка ошибок
 * @param error - Ошибка для обработки
 * @param context - Контекст возникновения ошибки
 * @param showToast - Показывать toast уведомление (по умолчанию true)
 */
export function handleError(
  error: unknown,
  context: string,
  showToast: boolean = true
): void {
  // Логирование в консоль
  console.error(`[${context}]:`, error);

  // Показ уведомления
  if (showToast) {
    const message = error instanceof Error ? error.message : 'Произошла ошибка';
    
    // Пока используем alert, в будущем можно заменить на toast
    alert(`[${context}] ${message}`);
  }
}

/**
 * Обработка ошибок валидации формы
 */
export function handleValidationError(field: string, message: string): void {
  console.error(`Validation error in field "${field}": ${message}`);
  alert(`Ошибка в поле "${field}": ${message}`);
}

/**
 * Обработка ошибок сети
 */
export function handleNetworkError(error: unknown, endpoint: string): void {
  console.error(`Network error calling ${endpoint}:`, error);
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    alert('Ошибка сети. Проверьте подключение к интернету.');
  } else {
    alert('Произошла ошибка при соединении с сервером.');
  }
}

/**
 * Проверка на ошибку авторизации
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status === 401 || error.status === 403;
  }
  if (error instanceof Error) {
    return error.message.includes('401') || error.message.includes('403');
  }
  return false;
}
