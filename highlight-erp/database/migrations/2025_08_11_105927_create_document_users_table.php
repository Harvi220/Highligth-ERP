<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('document_users', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('document_id')->constrained()->onDelete('cascade');

            $table->enum('status', ['assigned', 'read'])->default('assigned');

            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'document_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_users');
    }
};
