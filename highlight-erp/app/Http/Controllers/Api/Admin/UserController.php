<?php

namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Repositories\Admin\Contracts\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Throwable;
use LogicException;

class UserController extends Controller
{

    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    /**
     * @OA\Get(
     *      path="/api/admin/users",
     *      summary="Получение списка всех сотрудников",
     *      tags={"Администратор - Сотрудники"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Успешный ответ",
     *          @OA\JsonContent(
     *              type="array",
     *              @OA\Items(ref="#/components/schemas/User")
     *          )
     *      )
     * )
     */
    public function index(): JsonResponse
    {
        $employees = $this->userRepository->all();
        return UserResource::collection($employees)->response();
    }

    /**
     * @OA\Post(
     *      path="/api/admin/users",
     *      summary="Создание нового сотрудника",
     *      tags={"Администратор - Сотрудники"},
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody
     *          (required=true,
     *          description="Данные нового сотрудника",
     *          @OA\JsonContent(ref="#/components/schemas/StoreUserRequest")
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Сотрудник успешно создан",
     *          @OA\JsonContent(ref="#/components/schemas/User")
     *      ),
     *      @OA\Response(response=422, description="Ошибка валидации"),
     *      @OA\Response(response=500, description="Внутренняя ошибка сервера")
     * )
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        try {
            $user = $this->userRepository->create($validatedData);
            $user->load('documents');

            return (new UserResource($user))->response()->setStatusCode(201);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Не удалось создать сотрудника.'], 500);
        }
    }

    /**
     * @OA\Get(
     *      path="/api/admin/users/{user}",
     *      operationId="getUserById",
     *      summary="Получение информации о конкретном сотруднике",
     *      tags={"Администратор - Сотрудники"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(
     *          name="user",
     *          description="ID сотрудника",
     *          required=true,
     *          in="path",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Успешный ответ",
     *          @OA\JsonContent(ref="#/components/schemas/User")
     *      ),
     *      @OA\Response(response=404, description="Сотрудник не найден")
     * )
     */

    public function show(User $user): JsonResponse
    {
        $user->load(['position', 'role', 'documents']);
        return (new UserResource($user))->response();  
    }

    /**
     * @OA\Put(
     *      path="/api/admin/users/{user}",
     *      operationId="updateUser",
     *      summary="Обновление данных сотрудника",
     *      tags={"Администратор - Сотрудники"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(
     *          name="user",
     *          description="ID сотрудника",
     *          required=true,
     *          in="path",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          description="Обновленные данные сотрудника",
     *          @OA\JsonContent(ref="#/components/schemas/UpdateUserRequest")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Сотрудник успешно обновлен",
     *          @OA\JsonContent(ref="#/components/schemas/User")
     *      ),
     *      @OA\Response(response=404, description="Сотрудник не найден"),
     *      @OA\Response(response=422, description="Ошибка валидации или бизнес-логики"),
     *      @OA\Response(response=500, description="Внутренняя ошибка сервера")
     * )
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        try {
            $updatedUser = $this->userRepository->update($user, $request->validated());

            return (new UserResource($updatedUser))->response();

        } catch (LogicException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Ошибка при обновлении сотрудника.'], 500);
        }
    }

        /**
     * @OA\Delete(
     *      path="/api/admin/users/{user}",
     *      operationId="deleteUser",
     *      summary="Удаление сотрудника",
     *      tags={"Администратор - Сотрудники"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(
     *          name="user",
     *          description="ID сотрудника",
     *          required=true,
     *          in="path",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\Response(response=204, description="Сотрудник успешно удален"),
     *      @OA\Response(response=404, description="Сотрудник не найден")
     * )
     */
    public function destroy(User $user): JsonResponse
    {
        $this->userRepository->delete($user);
        return response()->json(['message'=> 'Пользователь успешно удален.']);    
    }
}