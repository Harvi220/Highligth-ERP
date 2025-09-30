<?php

namespace App\Repositories\Admin\Contracts;

use App\Models\Document;
use Illuminate\Database\Eloquent\Collection;

interface DocumentRepositoryInterface
{
    public function getAll(): Collection;
    public function create(array $data): Document;
    public function update(Document $document, array $data): Document;
    public function delete(Document $document): bool;
}