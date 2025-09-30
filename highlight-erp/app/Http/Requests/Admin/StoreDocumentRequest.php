<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
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
        return [
            'title' => 'required|string|max:255',
            
            'file' => [
                'required',
                'file',
                'mimes:pdf,docx,xlsx',
                'max:10240',
            ],
            'is_for_all_employees' => 'nullable|boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('is_for_all_employees')) {
            $this->merge([
                'is_for_all_employees' => filter_var($this->input('is_for_all_employees'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }
    }
}
