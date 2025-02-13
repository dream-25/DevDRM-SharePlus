<?php
header('Content-Type: application/json');

function generateTimePrefix() {
    return date('YmdHis');
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
    $originalName = $file['name'];
    
    // Remove time prefix for the public URL
    $publicName = $originalName;
    
    // Add time prefix for storage
    $storageName = $timePrefix . '_' . $originalName;
    
    $uploadDir = getUploadDirectory($extension);
    $uploadPath = $uploadDir . $storageName;
    
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // Log the upload
        $logMessage = date('Y-m-d H:i:s') . " - Uploaded: " . $originalName . " as " . $storageName . "\n";
        file_put_contents('upload_log.txt', $logMessage, FILE_APPEND);
        
        // Generate share link
        $shareLink = '/download.php?file=' . urlencode($publicName) . '&type=' . urlencode($extension);
        
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