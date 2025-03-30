<?php
if (!isset($_GET['file']) || !isset($_GET['type'])) {
    die('Invalid request');
}

$storageFileName = $_GET['file']; // Now, we directly receive the unique filename
$fileType = strtoupper($_GET['type']);
$uploadDir = 'uploads/' . $fileType . 's/';

// Validate file existence
$filePath = $uploadDir . $storageFileName;

if (!file_exists($filePath)) {
    die('File not found');
}

// Extract original filename from stored mapping
$mappingFile = 'file_mappings.txt';
$originalName = $storageFileName;

if (file_exists($mappingFile)) {
    $lines = file($mappingFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        list($original, $stored) = explode('|', $line);
        if ($stored === $storageFileName) {
            $originalName = $original;
            break;
        }
    }
}

// Log the download
$logMessage = date('Y-m-d H:i:s') . " - Downloaded: " . $originalName . " -> " . $storageFileName . "\n";
file_put_contents('download_log.txt', $logMessage, FILE_APPEND);

// Set headers for download
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $originalName . '"');
header('Content-Length: ' . filesize($filePath));

// Output file
readfile($filePath);
exit;
?>
