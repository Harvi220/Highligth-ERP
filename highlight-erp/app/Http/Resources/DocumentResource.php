<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'file_url' => $this->file_path ? url(Storage::url($this->file_path)) : null,
            'original_filename' => $this->original_filename,
            'file_mime_type' => $this->file_mime_type,
            'file_size' => $this->file_size,
            'is_for_all_employees' => $this->is_for_all_employees,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];

        if ($this->resource->relationLoaded('pivot') && $this->pivot) {
            $data['status'] = $this->pivot->status;
        }

        return $data;
    }
}
