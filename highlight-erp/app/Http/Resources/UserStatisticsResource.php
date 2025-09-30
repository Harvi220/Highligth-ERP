<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Resources\Json\JsonResource;
/**
 * @OA\Schema(
 *     schema="UserStatistics",
 *     title="User Statistics",
 *     description="Статистика по документам для одного сотрудника",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="last_name", type="string", example="Батырев"),
 *     @OA\Property(property="first_name", type="string", example="К.В."),
 *     @OA\Property(property="patronymic", type="string", nullable=true, example=""),
 *     @OA\Property(property="position", type="string", example="Бармен"),
 *     @OA\Property(property="avatar_url", type="string", nullable=true, description="Полный URL аватара"),
 *     @OA\Property(
 *         property="documents",
 *         type="array",
 *         description="Список назначенных документов и их статусы",
 *         @OA\Items(ref="#/components/schemas/DocumentStatus")
 *     )
 * )
 */
class UserStatisticsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'last_name' => $this->last_name,
            'first_name' => $this->first_name,
            'patronymic' => $this->patronymic,
            'position' => $this->position,
            'avatar_url' => $this->avatar_path ? url(Storage::url($this->avatar_path)) : null,
            'documents' => DocumentStatusResource::collection($this->whenLoaded('documents')),
        ];
    }
}
