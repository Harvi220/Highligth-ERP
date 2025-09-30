<?php

namespace App\Repositories\Admin\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface StatisticRepositoryInterface
{
  public function getEmployeesWithDocumentsStatus(): Collection;
}