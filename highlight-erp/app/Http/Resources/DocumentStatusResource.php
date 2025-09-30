<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
/**
 * @OA\Schema(
 *     schema="DocumentStatus",
 *     title="Document Status",
 *     description="Статус одного документа в списке статистики",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="title", type="string", example="Правила компании"),
 *     @OA\Property(property="status", type="string", enum={"assigned", "read"}, example="read")
 * )
 */
class DocumentStatusResource extends JsonResource
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
            'title' => $this->title,
            'status' => $this->whenPivotLoaded('document_users', function () {
                return $this->pivot->status;
            }),
        ];
    }
}
