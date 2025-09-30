<?php

namespace App\Http\Controllers\Api\Employee;

use App\Http\Requests\Employee\UpdateAvatarRequest;
use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\ChangePasswordRequest;
use App\Http\Requests\Employee\UpdateProfileRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * @OA\Get(
     *      path="/api/employee/profile",
     *      operationId="getEmployeeProfile",
     *      summary="Получение данных профиля текущего сотрудника",
     *      tags={"Сотрудник - Профиль"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(response=200, description="Успешный ответ", @OA\JsonContent(ref="#/components/schemas/User"))
     * )
     */
    public function show()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        return (new UserResource($user))->response();
    }

    /**
     * @OA\Put(
     *      path="/api/employee/profile",
     *      operationId="updateEmployeeProfile",
     *      summary="Обновление ФИО сотрудника",
     *      tags={"Сотрудник - Профиль"},
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"last_name", "first_name"},
     *              @OA\Property(property="last_name", type="string"),
     *              @OA\Property(property="first_name", type="string"),
     *              @OA\Property(property="patronymic", type="string", nullable=true)
     *          )
     *      ),
     *      @OA\Response(response=200, description="Данные успешно обновлены", @OA\JsonContent(ref="#/components/schemas/User"))
     * )
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->fill($request->validated())->save();
        return (new UserResource($user))->response();
    }

    /**
     * @OA\Post(
     *      path="/api/employee/profile/change-password",
     *      operationId="changeEmployeePassword",
     *      summary="Смена пароля сотрудника",
     *      tags={"Сотрудник - Профиль"},
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"password", "password_confirmation"},
     *              @OA\Property(property="password", type="string", format="password"),
     *              @OA\Property(property="password_confirmation", type="string", format="password")
     *          )
     *      ),
     *      @OA\Response(response=200, description="Пароль успешно изменен")
     * )
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->update([
            'password' => Hash::make($request->input('password')),
        ]);
        return response()->json(['message' => 'Пароль успешно изменен.']);
    }

    /**
     * @OA\Post(
     *      path="/api/employee/profile/avatar",
     *      operationId="updateEmployeeAvatar",
     *      summary="Загрузка/обновление аватара сотрудника",
     *      tags={"Сотрудник - Профиль"},
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\MediaType(
     *              mediaType="multipart/form-data",
     *              @OA\Schema(
     *                  type="object", required={"avatar"},
     *                  @OA\Property(property="avatar", type="string", format="binary", description="Файл изображения (jpg, png)")
     *              )
     *          )
     *      ),
     *      @OA\Response(response=200, description="Аватар успешно обновлен", @OA\JsonContent(@OA\Property(property="avatar_url", type="string")))
     * )
     */
    public function updateAvatar(UpdateAvatarRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $avatarFile = $request->file('avatar');

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $path = $avatarFile->store('avatars', 'public');
        $user->update(['avatar_path' => $path]);

        // 4. Возвращаем полный URL нового аватара.
        return response()->json([
            'message' => 'Аватар успешно обновлен.',
            'avatar_url' => url(Storage::url($path)),
        ]);
    }
}
