<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @OA\Schema(
 *     schema="UpdateUserRequest",
 *     title="UpdateUserRequest",
 *     description="Данные для обновления сотрудника",
 *     required={"last_name", "first_name", "position", "phone"},
 *     @OA\Property(property="last_name", type="string", description="Фамилия", example="Петров"),
 *     @OA\Property(property="first_name", type="string", description="Имя", example="Петр"),
 *     @OA\Property(property="patronymic", type="string", nullable=true, description="Отчество", example="Петрович"),
 *     @OA\Property(property="position", type="string", description="Должность", example="Старший повар"),
 *     @OA\Property(property="phone", type="string", description="Номер телефона (логин)", example="79991234502"),
 *     @OA\Property(property="password", type="string", format="password", nullable=true, description="Пароль (минимум 8 символов)", example="password123"),
 *     @OA\Property(
 *         property="documents",
 *         description="Массив ID документов для назначения",
 *         type="array",
 *         @OA\Items(type="integer"),
 *         example={1, 2}
 *     )
 * )
 */

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')->id;
        
        return [
            'last_name'  => ['required', 'string','max:255'],
            'first_name' => ['required', 'string','max:255'],
            'patronymic' => ['nullable', 'string', 'max:255'],
            'position_id' => ['required', 'integer', 'exists:positions,id', ],
            'phone' => ['required', 'string', Rule::unique('users', 'phone')->ignore($userId)],
            'password' => ['sometimes', 'required', Password::min(8)],
            'documents' => ['nullable', 'array'],
            'documents.*' => ['integer', 'exists:documents,id'],
        ];
    }
}
