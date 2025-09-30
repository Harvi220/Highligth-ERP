<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @OA\Schema(
 *     schema="User",
 *     title="User",
 *     description="Модель пользователя",
 *     @OA\Property(property="id", type="integer", readOnly="true", example="1"),
 *     @OA\Property(property="last_name", type="string", description="Фамилия", example="Иванов"),
 *     @OA\Property(property="first_name", type="string", description="Имя", example="Иван"),
 *     @OA\Property(property="patronymic", type="string", nullable=true, description="Отчество", example="Иванович"),
 *     @OA\Property(property="position", type="string", description="Должность", example="Главный администратор"),
 *     @OA\Property(property="phone", type="string", description="Номер телефона (логин)", example="79990001122"),
 *     @OA\Property(property="role", type="string", enum={"admin", "employee"}, description="Роль пользователя", example="admin"),
 *     @OA\Property(property="created_at", type="string", format="date-time", description="Дата создания", readOnly="true"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", description="Дата обновления", readOnly="true")
 * )
 */

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'last_name',
        'first_name',
        'patronymic',
        'position_id',
        //'position',
        'phone',
        'password',
        'role_id',
        //'role',
        'avatar_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'avatar_path',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Документы, назначенные этому пользователю.
     */
    public function documents(): BelongsToMany
    {
        $tableName = 'document_users'; 
        return $this->belongsToMany(Document::class, $tableName, 'user_id', 'document_id')
                    ->withPivot('status', 'read_at')
                    ->withTimestamps();
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Проверяет, имеет ли пользователь указанную роль.
     * @param string $roleName Имя роли ('admin', 'employee')
     * @return bool
     */
    public function hasRole(string $roleName): bool
    {
        return $this->role->name === $roleName;
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }


}