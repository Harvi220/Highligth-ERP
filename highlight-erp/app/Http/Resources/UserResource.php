<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'position' => $this->whenLoaded('position', function () {
                return [
                    'id' => $this->position->id,
                    'name' => $this->position->name,
                ];
            }),            'phone' => $this->phone,
            'role' => $this->whenLoaded('role', function () {
                return [
                    'id' => $this->role->id,
                    'name' => $this->role->name,
                ];
            }),            
            'avatar_url' => $this->avatar_path ? url(Storage::url($this->avatar_path)) : null,
            'documents' => DocumentResource::collection($this->whenLoaded('documents')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
