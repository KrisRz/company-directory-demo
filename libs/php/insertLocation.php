<?php

// Start the timer to track script execution
$timerBegin = microtime(true);

// Include the database configuration
include("config.php");

// Set the response type to JSON
header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$dbConn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check if the database connection works
if (mysqli_connect_errno()) {
    $jsonResponse = [];
    $jsonResponse['status']['code'] = "300";
    $jsonResponse['status']['name'] = "error";
    $jsonResponse['status']['description'] = "Database not available";
    $jsonResponse['status']['returnedIn'] = (microtime(true) - $timerBegin) / 1000 . " ms";
    $jsonResponse['data'] = [];

    mysqli_close($dbConn);
    echo json_encode($jsonResponse);
    exit;
}

// Check if the location name is provided
if (!isset($_POST['name']) || empty(trim($_POST['name']))) {
    $jsonResponse = [];
    $jsonResponse['status']['code'] = "400";
    $jsonResponse['status']['name'] = "error";
    $jsonResponse['status']['description'] = "Location name is required";
    $jsonResponse['status']['returnedIn'] = (microtime(true) - $timerBegin) / 1000 . " ms";
    $jsonResponse['data'] = [];

    mysqli_close($dbConn);
    echo json_encode($jsonResponse);
    exit;
}

// Clean the location name to prevent SQL injection
$locationName = cleanInput($_POST['name'], $dbConn);

// Create and run the query to insert the new location
$insertQuery = "INSERT INTO location (name) VALUES('$locationName')";
$insertResult = $dbConn->query($insertQuery);

// Check if the query worked
if (!$insertResult) {
    $jsonResponse = [];
    $jsonResponse['status']['code'] = "400";
    $jsonResponse['status']['name'] = "error";
    $jsonResponse['status']['description'] = "Could not insert location";
    $jsonResponse['status']['returnedIn'] = (microtime(true) - $timerBegin) / 1000 . " ms";
    $jsonResponse['data'] = [];

    mysqli_close($dbConn);
    echo json_encode($jsonResponse);
    exit;
}

// Success response
$jsonResponse = [];
$jsonResponse['status']['code'] = "200";
$jsonResponse['status']['name'] = "ok";
$jsonResponse['status']['description'] = "Location added successfully";
$jsonResponse['status']['returnedIn'] = (microtime(true) - $timerBegin) / 1000 . " ms";
$jsonResponse['data'] = [];

mysqli_close($dbConn);
echo json_encode($jsonResponse);

// Helper function to clean input
function cleanInput($input, $dbConn) {
    $input = trim($input);
    $input = mysqli_real_escape_string($dbConn, $input);
    return $input;
}

?>