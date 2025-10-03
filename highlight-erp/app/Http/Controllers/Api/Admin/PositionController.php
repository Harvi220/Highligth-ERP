<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    /**
     * @OA\Get(
     *      path="/api/admin/positions",
     *      operationId="getPositions",
     *      summary="Получение списка всех должностей",
     *      security={{"bearerAuth":{}}},
     *      tags={"Администратор - Должности"},
     *      @OA\Response(
     *          response=200,
     *          description="Успешный ответ",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="data",
     *                  type="array",
     *                  @OA\Items(
     *                      type="object",
     *                      @OA\Property(property="id", type="integer"),
     *                      @OA\Property(property="name", type="string")
     *                  )
     *              )
     *          )
     *      )
     * )
     */
    public function index(): JsonResponse
    {
        $positions = Position::orderBy('name')->get(['id', 'name']);
        return response()->json(['data' => $positions]);
    }

    /**
     * @OA\Post(
     *      path="/api/admin/positions",
     *      operationId="storePosition",
     *      summary="Создание новой должности",
     *      tags={"Администратор - Должности"},
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"name"},
     *              @OA\Property(property="name", type="string", example="Менеджер")
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Должность успешно создана",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="object",
     *                  @OA\Property(property="id", type="integer"),
     *                  @OA\Property(property="name", type="string")
     *              )
     *          )
     *      ),
     *      @OA\Response(response=422, description="Ошибка валидации")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:positions,name',
        ], [
            'name.required' => 'Название должности обязательно.',
            'name.unique' => 'Должность с таким названием уже существует.',
        ]);

        $position = Position::create($validated);

        return response()->json(['data' => $position], 201);
    }

    /**
     * @OA\Put(
     *      path="/api/admin/positions/{position}",
     *      operationId="updatePosition",
     *      summary="Обновление должности",
     *      tags={"Администратор - Должности"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(
     *          name="position",
     *          description="ID должности",
     *          required=true,
     *          in="path",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"name"},
     *              @OA\Property(property="name", type="string", example="Старший менеджер")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Должность успешно обновлена",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="object",
     *                  @OA\Property(property="id", type="integer"),
     *                  @OA\Property(property="name", type="string")
     *              )
     *          )
     *      ),
     *      @OA\Response(response=404, description="Должность не найдена"),
     *      @OA\Response(response=422, description="Ошибка валидации")
     * )
     */
    public function update(Request $request, Position $position): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:positions,name,' . $position->id,
        ], [
            'name.required' => 'Название должности обязательно.',
            'name.unique' => 'Должность с таким названием уже существует.',
        ]);

        $position->update($validated);

        return response()->json(['data' => $position]);
    }

    /**
     * @OA\Delete(
     *      path="/api/admin/positions/{position}",
     *      operationId="deletePosition",
     *      summary="Удаление должности",
     *      tags={"Администратор - Должности"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(
     *          name="position",
     *          description="ID должности",
     *          required=true,
     *          in="path",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Должность успешно удалена"
     *      ),
     *      @OA\Response(response=404, description="Должность не найдена"),
     *      @OA\Response(response=409, description="Невозможно удалить должность, используется сотрудниками")
     * )
     */
    public function destroy(Position $position): JsonResponse
    {
        // Проверяем, есть ли сотрудники с этой должностью
        if ($position->users()->exists()) {
            return response()->json([
                'message' => 'Невозможно удалить должность. К ней привязаны сотрудники.'
            ], 409);
        }

        $position->delete();

        return response()->json(['message' => 'Должность успешно удалена.']);
    }
}
