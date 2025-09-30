<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\StoreDocumentRequest;
use App\Http\Requests\Admin\UpdateDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use App\Repositories\Admin\Contracts\DocumentRepositoryInterface;


class DocumentController extends Controller
{

    public function __construct(
        private readonly DocumentRepositoryInterface $documentRepository
    ) {}

    /**
     * @OA\Get(
     *      path="/api/admin/documents",
     *      operationId="getDocuments",
     *      summary="Получение списка всех документов",
     *      security={{"bearerAuth":{}}},
     *      tags={"Администратор - Документы"},
     *      @OA\Response(
     *          response=200,
     *          description="Успешный ответ",
     *          @OA\JsonContent(
     *              type="array",
     *              @OA\Items(ref="#/components/schemas/Document")
     *          )
     *      )
     * )
     */
    public function index(): JsonResponse
    {
        $documents = $this->documentRepository->getAll();
        return DocumentResource::collection($documents)->response();
    }


    /**
     * @OA\Post(
     *      path="/api/admin/documents",
     *      operationId="storeDocument",
     *      summary="Загрузка нового документа",
     *      tags={"Администратор - Документы"},
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          description="Данные для загрузки документа. Используйте multipart/form-data.",
     *          @OA\MediaType(
     *              mediaType="multipart/form-data",
     *              @OA\Schema(
     *                  type="object",
     *                  required={"title", "file"},
     *                  @OA\Property(property="title", type="string", description="Название документа"),
     *                  @OA\Property(property="file", type="string", format="binary", description="Файл документа (PDF, DOCX, XLSX)"),
     *                  @OA\Property(property="is_for_all_employees", type="boolean", description="Назначить всем сотрудникам")
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Документ успешно создан",
     *          @OA\JsonContent(ref="#/components/schemas/Document")
     *      ),
     *      @OA\Response(response=422, description="Ошибка валидации")
     * )
     */
    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $document = $this->documentRepository->create($request->validated());

        return (new DocumentResource($document))->response()->setStatusCode(201);
    }

    /**
     * @OA\Post(
     *      path="/api/admin/documents/{document}",
     *      operationId="updateDocument",
     *      summary="Обновление документа (включая замену файла)",
     *      description="Позволяет изменить название, флаг и/или заменить файл. Статусы ознакомления не сбрасываются. Используйте multipart/form-data и метод POST с полем _method=PUT.",
     *      tags={"Администратор - Документы"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(
     *          name="document",
     *          description="ID документа для обновления",
     *          required=true,
     *          in="path",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\RequestBody(
     *          @OA\MediaType(
     *              mediaType="multipart/form-data",
     *              @OA\Schema(
     *                  type="object",
     *                  @OA\Property(property="_method", type="string", enum={"PUT"}, default="PUT", description="Обязательно для эмуляции PUT-запроса."),
     *                  @OA\Property(property="title", type="string", description="Новое название (опционально)"),
     *                  @OA\Property(property="file", type="string", format="binary", description="Новый файл (опционально)"),
     *                  @OA\Property(property="is_for_all_employees", type="boolean", description="Новое значение флага (опционально)")
     *              )
     *          )
     *      ),
     *      @OA\Response(response=200, description="Документ успешно обновлен", @OA\JsonContent(ref="#/components/schemas/Document")),
     *      @OA\Response(response=404, description="Документ не найден"),
     *      @OA\Response(response=422, description="Ошибка валидации")
     * )
     */
    public function update(UpdateDocumentRequest $request, Document $document): JsonResponse
    {
        $updatedDocument = $this->documentRepository->update($document, $request->validated());
        return (new DocumentResource($updatedDocument))->response();
    }

    /**
     * @OA\Delete(
     *      path="/api/admin/documents/{document}",
     *      operationId="deleteDocument",
     *      summary="Удаление документа",
     *      tags={"Администратор - Документы"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(
     *          name="document",
     *          description="ID документа",
     *          required=true,
     *          in="path",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\Response(
     *          response=204,
     *          description="Документ успешно удален"
     *      ),
     *      @OA\Response(response=404, description="Документ не найден")
     * )
     */
    public function destroy(Document $document): JsonResponse
    {
        $this->documentRepository->delete($document);
        return response()->json(['message'=> 'Документ успешно удален.']);
    }
}
