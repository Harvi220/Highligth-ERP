<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="Highlight ERP API Documentation",
 *      description="Документация API для проекта Highlight ERP",
 * )
 *
 * @OA\Server(
 *      url=L5_SWAGGER_CONST_HOST,
 *      description="Основной API сервер"
 * )

 * @OA\SecurityScheme(
 *      securityScheme="bearerAuth",
 *      type="http",
 *      scheme="bearer"
 * )
 */

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Аутентификация пользователя",
     *     tags={"Аутентификация"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"phone","password"},
     *             @OA\Property(property="phone", type="string", format="phone", example="79990001122"),
     *             @OA\Property(property="password", type="string", format="password", example="password"),
     *         ),
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Успешная аутентификация",
     *         @OA\JsonContent(
     *             @OA\Property(property="user", type="object", ref="#/components/schemas/User"),
     *             @OA\Property(property="token", type="string", example="1|aBcDeFgHiJkLmNoPqRsTuVwXyZ"),
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Ошибка валидации"
     *     )
     * )
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'phone'    => 'required|string',
            'password' => 'required|string'
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['Неверный номер телефона или пароль.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token
        ]);
    }

    /**
     * @OA\Post(
     *      path="/api/logout",
     *      summary="Выход из системы",
     *      tags={"Аутентификация"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Успешный выход",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Вы успешно вышли из системы.")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Не аутентифицирован"
     *      )
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Вы успешно вышли из системы.']);
    }
}