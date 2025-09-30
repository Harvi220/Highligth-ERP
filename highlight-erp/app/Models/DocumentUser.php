<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class DocumentUser extends Pivot
{
    protected $table = 'document_users';

    protected $casts = [
        'read_at' => 'datetime',
    ];
}
