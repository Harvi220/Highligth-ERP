<?php

namespace App\Repositories\Admin\Eloquent;

use App\Models\Document;
use App\Models\User;
use App\Repositories\Admin\Contracts\DocumentRepositoryInterface;
use App\Services\DocumentConversionService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use App\Models\Role;

class EloquentDocumentRepository implements DocumentRepositoryInterface
{
  protected DocumentConversionService $conversionService;

  public function __construct(DocumentConversionService $conversionService)
  {
    $this->conversionService = $conversionService;
  }

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
        'description' => $data['description'] ?? null,
        'file_path' => $filePath,
        'original_filename' => $file->getClientOriginalName(),
        'file_mime_type' => $file->getClientMimeType(),
        'file_size' => $file->getSize(),
        'is_for_all_employees' => $data['is_for_all_employees'] ?? false,
      ]);

      // Конвертация в PDF если нужно
      $this->ensurePdfVersion($document);

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

        // Удаляем старые файлы
        Storage::disk('public')->delete($document->file_path);
        if ($document->pdf_file_path && $document->pdf_file_path !== $document->file_path) {
          Storage::disk('public')->delete($document->pdf_file_path);
        }

        $newFilePath = Storage::disk('public')->putFile('documents', $newFile);
        $document->update([
          'file_path' => $newFilePath,
          'original_filename' => $newFile->getClientOriginalName(),
          'file_mime_type' => $newFile->getClientMimeType(),
          'file_size' => $newFile->getSize(),
          'pdf_file_path' => null,
          'pdf_file_size' => null,
        ]);

        // Конвертация в PDF если нужно
        $this->ensurePdfVersion($document);
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
      $pdfFilePath = $document->pdf_file_path;
      $deletedFromDb = $document->delete();

      if ($deletedFromDb) {
        Storage::disk('public')->delete($filePath);
        if ($pdfFilePath && $pdfFilePath !== $filePath) {
          Storage::disk('public')->delete($pdfFilePath);
        }
      }
      return $deletedFromDb;
    });
  }

  /**
   * Обеспечивает наличие PDF версии документа
   */
  private function ensurePdfVersion(Document $document): void
  {
    // Если файл уже PDF - используем его
    if ($document->file_mime_type === 'application/pdf') {
      $document->update([
        'pdf_file_path' => $document->file_path,
        'pdf_file_size' => $document->file_size,
      ]);
      return;
    }

    // Если нужна конвертация
    if ($this->conversionService->needsConversion($document->file_mime_type)) {
      $pdfPath = $this->conversionService->convertToPDF($document->file_path);

      if ($pdfPath) {
        $pdfSize = $this->conversionService->getPdfFileSize($pdfPath);
        $document->update([
          'pdf_file_path' => $pdfPath,
          'pdf_file_size' => $pdfSize,
        ]);
      } else {
        \Log::warning("Не удалось сконвертировать документ ID {$document->id} в PDF");
      }
    }
  }
}