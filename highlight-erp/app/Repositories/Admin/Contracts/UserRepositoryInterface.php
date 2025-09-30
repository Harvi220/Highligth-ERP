<?php

namespace App\Repositories\Admin\Contracts;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
  public function all(): Collection;
  public function create(array $data): User;
  public function update(User $user, array $data): User;
  public function delete(User $user): bool;

}
