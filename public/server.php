<?php
header('Content-Type: application/json');

function generateTimePrefix() {
    return date('YmdHis');
}

function generateRandomString($length = 5) {
    return substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, $length);
}

function getUploadDirectory($extension) {
    $baseDir = 'uploads/';
    $typeDir = strtoupper($extension) . 's/';
    $fullDir = $baseDir . $typeDir;

    if (!file_exists($fullDir)) {
        mkdir($fullDir, 0777, true);
    }

    return $fullDir;
}

try {
    if (!isset($_FILES['file'])) {
        throw new Exception('No file uploaded');
    }

    $file = $_FILES['file'];
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $timePrefix = generateTimePrefix();
    $randomString = generateRandomString();
    $originalName = $file['name'];

    // Ensure unique filename
    $storageName = $timePrefix . '_' . $randomString . '_' . $originalName;
    $uploadDir = getUploadDirectory($extension);
    $uploadPath = $uploadDir . $storageName;

    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // Store mapping (original name | stored unique name)
        $logData = $originalName . '|' . $storageName . "\n";
        file_put_contents('file_mappings.txt', $logData, FILE_APPEND);

        // Use unique filename in the download link
        $shareLink = '/download.php?file=' . urlencode($storageName) . '&type=' . urlencode($extension);

        echo json_encode([
            'success' => true,
            'shareLink' => $shareLink
        ]);
    } else {
        throw new Exception('Failed to move uploaded file');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
