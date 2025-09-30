<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Массив ролей, которым разрешен доступ.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {

        $user = $request->user();

        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                return $next($request);
            }
        }
        return response()->json(['message' => 'This action is unauthorized.'], 403);
    }
}