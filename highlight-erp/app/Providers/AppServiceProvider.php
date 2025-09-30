<?php

namespace App\Providers;

use App\Repositories\Admin\Contracts\UserRepositoryInterface;
use App\Repositories\Admin\Eloquent\EloquentUserRepository;
use App\Repositories\Admin\Contracts\DocumentRepositoryInterface;
use App\Repositories\Admin\Contracts\StatisticRepositoryInterface;
use App\Repositories\Admin\Eloquent\EloquentDocumentRepository;
use App\Repositories\Admin\Eloquent\EloquentStatisticRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            UserRepositoryInterface::class,
            EloquentUserRepository::class
        );
        $this->app->bind(
            DocumentRepositoryInterface::class,
            EloquentDocumentRepository::class
        );

        $this->app->bind(
            StatisticRepositoryInterface::class,
            EloquentStatisticRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
