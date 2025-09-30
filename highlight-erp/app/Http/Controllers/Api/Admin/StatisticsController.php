<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserStatisticsResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;
use App\Repositories\Admin\Contracts\StatisticRepositoryInterface;

class StatisticsController extends Controller
{

    public function __construct(
        private readonly StatisticRepositoryInterface $statisticRepository
    ) {}


    /**
     * @OA\Get(
     *      path="/api/admin/statistics",
     *      operationId="getStatistics",
     *      summary="Получение статистики по ознакомлению сотрудников",
     *      tags={"Администратор - Статистика"},
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Успешный ответ со статистикой",
     *          @OA\JsonContent(
     *              type="array",
     *              @OA\Items(ref="#/components/schemas/UserStatistics")
     *          )
     *      )
     * )
     */
    public function index(): AnonymousResourceCollection
    {
        $employeesWithStatus = $this->statisticRepository->getEmployeesWithDocumentsStatus();
        return UserStatisticsResource::collection($employeesWithStatus);
    }
}
