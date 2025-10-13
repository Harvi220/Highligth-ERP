<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return 'Hello from Laravel!';
});

// Health check endpoint for Docker monitoring
Route::get('/api/health', function () {
    try {
        $dbStatus = DB::connection()->getPdo() ? 'connected' : 'disconnected';
    } catch (\Exception $e) {
        $dbStatus = 'error: ' . $e->getMessage();
    }

    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'services' => [
            'database' => $dbStatus,
        ],
    ]);
});
