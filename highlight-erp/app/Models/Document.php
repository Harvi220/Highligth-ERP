<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Document",
 *     title="Document",
 *     description="Модель документа",
 *     @OA\Property(property="id", type="integer", readOnly="true", example="1"),
 *     @OA\Property(property="title", type="string", description="Название документа", example="Инструкция по технике безопасности"),
 *     @OA\Property(property="description", type="string", nullable=true, description="Краткое описание"),
 *     @OA\Property(property="file_path", type="string", description="Путь к файлу в хранилище", example="documents/xyz.pdf"),
 *     @OA\Property(property="original_filename", type="string", description="Исходное имя файла", example="instrukciya.pdf"),
 *     @OA\Property(property="file_mime_type", type="string", description="MIME-тип файла", example="application/pdf"),
 *     @OA\Property(property="file_size", type="integer", description="Размер файла в байтах", example="102400"),
 *     @OA\Property(property="is_for_all_employees", type="boolean", description="Флаг 'Назначить всем'", example=false),
 *     @OA\Property(property="created_at", type="string", format="date-time", readOnly="true"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", readOnly="true")
 * )
 */

class Document extends Model
{
    protected $fillable = [
        'title',
        'description',
        'file_path',
        'original_filename',
        'file_mime_type',
        'file_size',
        'is_for_all_employees',
    ];
    
    protected $casts = [
    'is_for_all_employees' => 'boolean',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'document_users', 'document_id', 'user_id')->withPivot('status', 'read_at')->withTimestamps();
    }

}
