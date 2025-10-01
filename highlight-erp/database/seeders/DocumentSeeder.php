<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Получаем пользователя-работника
        $employee = User::whereHas('role', function ($query) {
            $query->where('name', 'employee');
        })->first();

        if (!$employee) {
            $this->command->warn('Employee user not found. Run EmployeeUserSeeder first.');
            return;
        }

        // Создаем тестовый документ
        $document = Document::create([
            'title' => 'Инструкция по технике безопасности',
            'description' => 'Обязательная инструкция по технике безопасности для всех сотрудников бара',
            'file_path' => 'documents/test_safety_instructions.pdf',
            'original_filename' => 'safety_instructions.pdf',
            'file_mime_type' => 'application/pdf',
            'file_size' => 245678,
            'is_for_all_employees' => false,
        ]);

        // Привязываем документ к сотруднику
        $document->users()->attach($employee->id, [
            'status' => 'assigned',
            'read_at' => null,
        ]);

        $this->command->info("Document created and assigned to {$employee->first_name} {$employee->last_name}");
    }
}
