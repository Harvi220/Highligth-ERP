<?php

namespace App\Http\Controllers\Api\Employee;
 
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redis;
use App\Http\Resources\DocumentResource;
use Illuminate\Support\Facades\Storage;
use DateTime;

class DocumentController extends Controller
{
    /**
     * @OA\Get(
     *      path="/api/employee/documents",
     *      operationId="getEmployeeDocuments",
     *      summary="Получение списка назначенных документов",
     *      tags={"Сотрудник - Документы"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(response=200, description="Успешный ответ", @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Document")))
     * )
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $documents = $user->documents()
            ->orderBy('document_users.status', 'asc')
            ->orderBy('document_users.created_at', 'desc')
            ->get();

        $documents->each(function ($doc) {
            $doc->status = $doc->pivot->status;
        });

        return DocumentResource::collection($documents)->response();
    }

    /**
     * @OA\Post(
     *      path="/api/employee/documents/{document}/read",
     *      operationId="markDocumentAsRead",
     *      summary="Подтверждение ознакомления с документом",
     *      tags={"Сотрудник - Документы"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="document", in="path", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(response=200, description="Статус успешно обновлен"),
     *      @OA\Response(response=403, description="Документ не назначен"),
     *      @OA\Response(response=409, description="Документ уже был прочитан")
     * )
     */
    public function markAsRead(Document $document)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $assignedDocument = $user->documents()->find($document->id);


        if (!$assignedDocument) {
            return response()->json(['message' => 'Этот документ вам не назначен.'], 403);
        }

        if ($assignedDocument->pivot->status === 'read') {
            return response()->json(['message' => 'Документ уже был отмечен как прочитанный.'], 409);
        }

        $user->documents()->updateExistingPivot($document->id, [
            'status' => 'read',
            'read_at' => now(),
        ]);

        return response()->json(['message' => 'Документ успешно отмечен как прочитанный.']);
    }


    /**
     * @OA\Get(
     *      path="/api/employee/documents/{document}",
     *      operationId="getEmployeeDocumentDetails",
     *      summary="Получение детальной информации о документе",
     *      tags={"Сотрудник - Документы"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="document", in="path", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(response=200, description="Успешный ответ", @OA\JsonContent(ref="#/components/schemas/Document")),
     *      @OA\Response(response=403, description="Документ не назначен"),
     *      @OA\Response(response=404, description="Документ не найден")
     * )
     */
    public function show(Document $document): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $assignedDocument = $user->documents()->find($document->id);


        if (!$assignedDocument) {
            return response()->json(['message' => 'Этот документ вам не назначен.'], 403);
        }

        // Добавляем статус из pivot-данных
        $assignedDocument->status = $assignedDocument->pivot->status;
        // Добавляем флаг наличия PDF версии
        $assignedDocument->has_pdf = !empty($assignedDocument->pdf_file_path);

        return (new DocumentResource($assignedDocument))->response();
    }

    /**
     * @OA\Get(
     *      path="/api/employee/documents/{document}/content",
     *      operationId="getEmployeeDocumentContent",
     *      summary="Получение содержимого документа для просмотра",
     *      tags={"Сотрудник - Документы"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="document", in="path", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(response=200, description="Успешный ответ"),
     *      @OA\Response(response=403, description="Документ не назначен"),
     *      @OA\Response(response=404, description="Документ не найден или файл отсутствует")
     * )
     */
    public function content(Document $document): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $assignedDocument = $user->documents()->find($document->id);

        if (!$assignedDocument) {
            return response()->json(['message' => 'Этот документ вам не назначен.'], 403);
        }

        // Используем PDF версию если доступна, иначе оригинальный файл
        $filePath = $assignedDocument->pdf_file_path ?? $assignedDocument->file_path;
        $fileName = $assignedDocument->pdf_file_path
            ? pathinfo($assignedDocument->original_filename, PATHINFO_FILENAME) . '.pdf'
            : $assignedDocument->original_filename;

        // Проверяем наличие файла
        if (!$filePath || !Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'Файл документа не найден.'], 404);
        }

        // Добавляем статус из pivot-данных
        $assignedDocument->status = $assignedDocument->pivot->status;

        // Получаем пользователя для ответа
        $responseUser = [
            'id' => $user->id,
            'name' => $user->first_name . ' ' . $user->last_name,
            'position' => $user->position->name ?? null,
            'phone' => $user->phone,
            'avatar' => $user->avatar_url ?? null,
        ];

        // Используем API endpoint вместо прямого URL для избежания CORS проблем
        $fileUrl = url("/api/employee/documents/{$document->id}/download");

        // Возвращаем документ и его содержимое
        return response()->json([
            'document' => new DocumentResource($assignedDocument),
            'file_url' => $fileUrl,
            'file_name' => $fileName,
            'file_size' => Storage::disk('public')->size($filePath),
            'mime_type' => Storage::disk('public')->mimeType($filePath),
            'user' => $responseUser
        ]);
    }

    /**
     * @OA\Get(
     *      path="/api/employee/documents/{document}/download",
     *      operationId="downloadEmployeeDocument",
     *      summary="Скачивание документа сотрудником",
     *      tags={"Сотрудник - Документы"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="document", in="path", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Файл документа",
     *          @OA\MediaType(mediaType="application/octet-stream")
     *      ),
     *      @OA\Response(response=403, description="Документ не назначен"),
     *      @OA\Response(response=404, description="Документ или файл не найден")
     * )
     */
    public function download(Document $document)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $assignedDocument = $user->documents()->find($document->id);

        if (!$assignedDocument) {
            return response()->json(['message' => 'Этот документ вам не назначен.'], 403);
        }

        // Используем PDF версию если доступна, иначе оригинальный файл
        $filePath = $assignedDocument->pdf_file_path ?? $assignedDocument->file_path;
        $filename = $assignedDocument->pdf_file_path
            ? pathinfo($assignedDocument->original_filename, PATHINFO_FILENAME) . '.pdf'
            : $assignedDocument->original_filename;

        if (!$filePath || !Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'Файл документа не найден.'], 404);
        }

        return Storage::disk('public')->download($filePath, $filename);
    }

}
