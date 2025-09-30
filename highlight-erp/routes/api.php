<?php

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Здесь регистрируются все API-маршруты для приложения. Эти маршруты
| автоматически получают префикс /api. Для доступа к защищенным
| роутам требуется аутентификация через Sanctum (Bearer Token).
|
*/

use App\Http\Controllers\Api\Employee\DocumentController as EmployeeDocumentController;
use App\Http\Controllers\Api\Employee\ProfileController as EmployeeProfileController;
use App\Http\Controllers\Api\Admin\DocumentController;
use App\Http\Controllers\Api\Admin\StatisticsController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Публичные маршруты (Аутентификация)
|--------------------------------------------------------------------------
|
| Эти эндпоинты доступны для всех, включая неаутентифицированных
| пользователей.
|
*/

// Эндпоинт для входа в систему. Принимает телефон и пароль,
// в случае успеха возвращает данные пользователя и API токен.
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Защищенные маршруты
|--------------------------------------------------------------------------
|
| Все маршруты в этой группе требуют наличия валидного Sanctum токена
| в заголовке Authorization: Bearer <token>.
|
*/
Route::middleware('auth:sanctum')->group(function () {
    /**
     * Стандартный эндпоинт для получения информации о текущем
     * аутентифицированном пользователе. Используется фронтендом
     * для проверки валидности токена и получения данных юзера.
     */
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /**
     * Эндпоинт для выхода из системы. Отзывает текущий
     * использованный токен, делая его недействительным.
     */
    Route::post('/logout', [AuthController::class, 'logout']);


    /*
    |--------------------------------------------------------------------------
    | Маршруты для Администратора
    |--------------------------------------------------------------------------
    |
    | Эта группа маршрутов доступна только для пользователей с ролью 'admin'.
    | Проверка роли осуществляется с помощью middleware 'role:admin'.
    | Все роуты здесь также имеют префикс /api/admin.
    |
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        /**
         * Ресурсный контроллер для управления сотрудниками (CRUD).
         * Route::apiResource автоматически создает следующие эндпоинты:
         * - GET /users -> UserController@index
         * - POST /users -> UserController@store
         * - GET /users/{user} -> UserController@show
         * - PUT/PATCH /users/{user} -> UserController@update
         * - DELETE /users/{user} -> UserController@destroy
         */
        Route::apiResource('users', UserController::class);

        /**
         * Ресурсный контроллер для управления документами.
         * Создает аналогичный набор CRUD-эндпоинтов для документов.

        */
        Route::apiResource('documents', DocumentController::class);

        /**
         * Эндпоинт для получения сводной статистики по ознакомлению
         * сотрудников с документами.
         */
        Route::get('statistics', [StatisticsController::class, 'index']);
    });

    /*
    |--------------------------------------------------------------------------
    | Маршруты для Сотрудника
    |--------------------------------------------------------------------------
    |
    | Эта группа маршрутов будет доступна только для пользователей с ролью 'employee'.
    | Все роуты здесь также будут иметь префикс /api/employee.
    |
    */
    Route::middleware('role:employee')->prefix('employee')->group(function () {
        // --- Документы ---
        Route::get('documents', [EmployeeDocumentController::class, 'index']);
        Route::get('documents/{document}/content', [EmployeeDocumentController::class, 'content']);
        Route::get('documents/{document}', [EmployeeDocumentController::class, 'show']);
        Route::post('documents/{document}/read', [EmployeeDocumentController::class, 'markAsRead']);

        // --- Личный профиль ---
        Route::get('profile', [EmployeeProfileController::class, 'show']);
        Route::put('profile', [EmployeeProfileController::class, 'update']);
        Route::post('profile/change-password', [EmployeeProfileController::class, 'changePassword']);
        Route::post('profile/avatar', [EmployeeProfileController::class, 'updateAvatar']);
    });
});