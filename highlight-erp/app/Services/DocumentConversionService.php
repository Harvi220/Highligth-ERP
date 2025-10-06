<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class DocumentConversionService
{
    private string $libreofficePath;

    public function __construct()
    {
        $this->libreofficePath = $this->getLibreOfficePath();
    }

    /**
     * Определяет путь к LibreOffice в зависимости от ОС
     */
    private function getLibreOfficePath(): string
    {
        if (PHP_OS_FAMILY === 'Windows') {
            return 'C:\Program Files\LibreOffice\program\soffice.exe';
        }
        return 'soffice'; // Linux - доступен в PATH
    }

    /**
     * Проверяет, нужна ли конвертация файла в PDF
     */
    public function needsConversion(string $mimeType): bool
    {
        return in_array($mimeType, [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',      // XLSX
            'application/msword',                                                      // DOC
            'application/vnd.ms-excel',                                                // XLS
            'application/vnd.ms-powerpoint',                                           // PPT
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
        ]);
    }

    /**
     * Конвертирует файл в PDF
     *
     * @param string $inputPath Путь к исходному файлу относительно storage/app/public
     * @return string|null Путь к PDF файлу относительно storage/app/public или null при ошибке
     */
    public function convertToPDF(string $inputPath): ?string
    {
        try {
            // Полный путь к исходному файлу
            $fullInputPath = Storage::disk('public')->path($inputPath);

            if (!file_exists($fullInputPath)) {
                Log::error("DocumentConversion: Исходный файл не найден: {$fullInputPath}");
                return null;
            }

            // Директория для временного хранения PDF
            $outputDir = dirname($fullInputPath);

            // Создаем процесс конвертации
            $process = new Process([
                $this->libreofficePath,
                '--headless',
                '--convert-to',
                'pdf',
                '--outdir',
                $outputDir,
                $fullInputPath
            ]);

            // Устанавливаем таймаут (60 секунд)
            $process->setTimeout(60);

            // Запускаем процесс
            $process->run();

            // Проверяем успешность
            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            // Определяем имя PDF файла
            $inputFilename = pathinfo($fullInputPath, PATHINFO_FILENAME);
            $pdfFilename = $inputFilename . '.pdf';
            $pdfFullPath = $outputDir . DIRECTORY_SEPARATOR . $pdfFilename;

            if (!file_exists($pdfFullPath)) {
                Log::error("DocumentConversion: PDF файл не был создан: {$pdfFullPath}");
                return null;
            }

            // Возвращаем относительный путь
            $relativePath = str_replace(
                Storage::disk('public')->path(''),
                '',
                $pdfFullPath
            );

            // Нормализуем путь (заменяем обратные слэши на прямые)
            $relativePath = str_replace('\\', '/', $relativePath);

            Log::info("DocumentConversion: Успешная конвертация: {$inputPath} -> {$relativePath}");

            return $relativePath;

        } catch (\Exception $e) {
            Log::error("DocumentConversion: Ошибка конвертации: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Получает размер PDF файла
     */
    public function getPdfFileSize(string $pdfPath): int
    {
        return Storage::disk('public')->size($pdfPath);
    }
}
