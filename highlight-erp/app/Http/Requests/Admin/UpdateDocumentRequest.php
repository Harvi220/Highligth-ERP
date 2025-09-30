<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Права доступа уже проверены middleware 'role:admin', так что разрешаем.
        return true;
    }

    public function rules(): array
    {
        return [
            // 'sometimes' - правило сработает, только если поле пришло в запросе.
            // То есть, название можно не передавать, если меняется только файл.
            'title' => 'sometimes|required|string|max:255',

            // Поле для флага "для всех" тоже опционально.
            'is_for_all_employees' => 'sometimes|boolean',

            // Поле для файла тоже опционально.
            'file' => [
                'sometimes',
                'required', // Если передано, то не может быть пустым
                'file',
                'mimes:pdf,docx,xlsx', // Разрешенные типы
                'max:10240', // Максимальный размер 10MB
            ],
        ];
    }

    /**
     * Этот метод подготовит данные ПЕРЕД валидацией.
     * Он нужен, чтобы строковые "true" и "false" из формы
     * превратились в настоящие булевы значения.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('is_for_all_employees')) {
            $this->merge([
                'is_for_all_employees' => filter_var($this->input('is_for_all_employees'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }
    }
}