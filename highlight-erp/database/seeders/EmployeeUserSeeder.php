<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\Position;

class EmployeeUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employeeRole = Role::where('name', 'employee')->firstOrFail();
        $bartenderPosition = Position::where('name', 'Бармен')->firstOrFail();

        User::create([
            'last_name' => 'Петров',
            'first_name' => 'Петр',
            'patronymic' => 'Петрович',
            'position_id' => $bartenderPosition->id,
            'phone' => '79991112233',
            'password' => Hash::make('password'),
            'role_id' => $employeeRole->id,
        ]);
    }
}
