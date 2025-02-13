<?php
if (!isset($_GET['file']) || !isset($_GET['type'])) {
    die('Invalid request');
}

$fileName = $_GET['file'];
$fileType = strtoupper($_GET['type']);
$uploadDir = 'uploads/' . $fileType . 's/';

// Find the file with time prefix
$files = glob($uploadDir . '*_' . $fileName);

if (empty($files)) {
    die('File not found');
}

$filePath = $files[0];

if (!file_exists($filePath)) {
    die('File not found');
}

// Log the download
$logMessage = date('Y-m-d H:i:s') . " - Downloaded: " . $fileName . "\n";
file_put_contents('download_log.txt', $logMessage, FILE_APPEND);

// Set headers for download
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $fileName . '"');
header('Content-Length: ' . filesize($filePath));

// Output file
readfile($filePath);
exit;
?>