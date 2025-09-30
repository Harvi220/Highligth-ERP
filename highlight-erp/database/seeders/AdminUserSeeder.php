<?php

namespace Database\Seeders;

use App\Models\User;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\Position;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $adminPosition = Position::where('name', 'Администратор')->firstOrFail();

        User::create([
            'last_name' => 'Иванов',
            'first_name' => 'Иван',
            'patronymic' => 'Иванович',
            'position_id' => $adminPosition->id,
            //'position' => 'Администратор',
            'position_id' => $adminPosition->id,
            'phone' => '79990001122',
            'password' => Hash::make('password'),
            //'role' => 'admin',
            'role_id' => $adminRole->id,

        ]);
    }
}
