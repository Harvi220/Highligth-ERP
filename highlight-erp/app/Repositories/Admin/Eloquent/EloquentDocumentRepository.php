<?php

namespace App\Repositories\Admin\Eloquent;

use App\Models\Document;
use App\Models\User;
use App\Repositories\Admin\Contracts\DocumentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use App\Models\Role;

class EloquentDocumentRepository implements DocumentRepositoryInterface
{
  public function getAll(): Collection
  {
    return Document::orderBy('created_at', 'desc')->get();
  }

  public function create(array $data): Document
  {
    return DB::transaction(function () use ($data)
    {
      $file = $data['file'];
      $filePath = Storage::disk('public')->putFile('documents', $file);

      $document = Document::create([
        'title' => $data['title'],
        'file_path' => $filePath,
        'original_filename' => $file->getClientOriginalName(),
        'file_mime_type' => $file->getClientMimeType(),
        'file_size' => $file->getSize(),
        'is_for_all_employees' => $data['is_for_all_employees'] ?? false,
      ]);
      if ($document->is_for_all_employees) {
        $employeeRoleId = Role::where('name', 'employee')->value('id');
        $employeeIds = User::where('role_id', $employeeRoleId)->pluck('id');

        if ($employeeIds->isNotEmpty()) {
          $document->users()->attach($employeeIds);
        }
      }
      return $document;
    });
  }

  public function update(Document $document, array $data): Document
  {
    return DB::transaction(function () use ($document, $data) {
      $wasForAll = $document->is_for_all_employees;
      $document->update(Arr::except($data, ['file']));

      if (Arr::has($data, 'file')) {
        $newFile = $data['file'];
        Storage::disk('public')->delete($document->file_path);
        $newFilePath = Storage::disk('public')->putFile('documents', $newFile);
        $document->update([
          'file_path' => $newFilePath,
          'original_filename' => $newFile->getClientOriginalName(),
          'file_mime_type' => $newFile->getClientMimeType(),
          'file_size' => $newFile->getSize(),
        ]);
      }
      if (!$wasForAll && $document->is_for_all_employees) {
        $employeeRoleId = Role::where('name', 'employee')->value('id');
        $employeeIdsToAssign = User::where('role_id', $employeeRoleId)
        ->whereDoesntHave('documents', function ($query) use ($document) {
        $query->where('document_id', $document->id);
      })->pluck('id');
        if ($employeeIdsToAssign->isNotEmpty()) {
          $document->users()->attach($employeeIdsToAssign);
        }
      }
      return $document->fresh();
    });
  }


  public function delete(Document $document): bool
  {
    return DB::transaction(function () use ($document)
    {
      $filePath = $document->file_path;
      $deletedFromDb = $document->delete();

      if ($deletedFromDb) {
        Storage::disk('public')->delete($filePath);
      }
      return $deletedFromDb;
    });
  }
}