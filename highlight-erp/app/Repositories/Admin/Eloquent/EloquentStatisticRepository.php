<?php

namespace App\Repositories\Admin\Eloquent;
use App\Models\User;


use App\Repositories\Admin\Contracts\StatisticRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentStatisticRepository implements StatisticRepositoryInterface
{
  public function getEmployeesWithDocumentsStatus(): Collection
  {
    return User::whereHas('role', function ($query) {$query->where('name', 'employee');})
    ->with(['role', 'position', 'documents'])
    ->orderBy('last_name')
    ->get();
  
  }
}