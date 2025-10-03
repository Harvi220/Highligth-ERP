<?php

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Settings;

class DocumentConverterService
{
    /**
     * Конвертирует DOCX документ в PDF
     *
     * @param string $docxPath Путь к DOCX файлу
     * @param string $outputPath Путь для сохранения PDF
     * @return bool
     */
    public function convertDocxToPdf(string $docxPath, string $outputPath): bool
    {
        try {
            // Загружаем DOCX документ
            $phpWord = IOFactory::load($docxPath);

            // Конвертируем в HTML
            $htmlWriter = IOFactory::createWriter($phpWord, 'HTML');

            // Создаем временный файл для HTML
            $tempHtmlPath = sys_get_temp_dir() . '/' . uniqid('doc_') . '.html';
            $htmlWriter->save($tempHtmlPath);

            // Читаем HTML содержимое
            $html = file_get_contents($tempHtmlPath);

            // Удаляем временный HTML файл
            @unlink($tempHtmlPath);

            // Конвертируем HTML в PDF с помощью Dompdf
            $options = new Options();
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isRemoteEnabled', true);
            $options->set('defaultFont', 'DejaVu Sans');

            $dompdf = new Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            // Сохраняем PDF
            $output = $dompdf->output();
            file_put_contents($outputPath, $output);

            return true;
        } catch (\Exception $e) {
            Log::error('Document conversion error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Проверяет, является ли файл DOCX
     *
     * @param string $filePath
     * @return bool
     */
    public function isDocx(string $filePath): bool
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        return $extension === 'docx';
    }

    /**
     * Проверяет, является ли файл PDF
     *
     * @param string $filePath
     * @return bool
     */
    public function isPdf(string $filePath): bool
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        return $extension === 'pdf';
    }
}
