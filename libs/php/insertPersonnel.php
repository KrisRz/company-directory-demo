<?php

// Start the timer to measure how long the script runs
$beginTime = microtime(true);

// Include the database configuration
include("config.php");

// Set the response type to JSON
header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$database = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check if the database connection works
if (mysqli_connect_errno()) {
    $responseData = [];
    $responseData['status']['code'] = "300";
    $responseData['status']['name'] = "error";
    $responseData['status']['description'] = "Cannot connect to database";
    $responseData['status']['returnedIn'] = (microtime(true) - $beginTime) / 1000 . " ms";
    $responseData['data'] = [];

    mysqli_close($database);
    echo json_encode($responseData);
    exit;
}

// Check if all required fields are provided
$requiredFields = ['firstName', 'lastName', 'jobTitle', 'email', 'departmentID'];
foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        $responseData = [];
        $responseData['status']['code'] = "400";
        $responseData['status']['name'] = "error";
        $responseData['status']['description'] = "Missing required field: $field";
        $responseData['status']['returnedIn'] = (microtime(true) - $beginTime) / 1000 . " ms";
        $responseData['data'] = [];

        mysqli_close($database);
        echo json_encode($responseData);
        exit;
    }
}

// Clean the input data to prevent SQL injection
$firstName = sanitizeInput($_POST['firstName'], $database);
$lastName = sanitizeInput($_POST['lastName'], $database);
$jobTitle = sanitizeInput($_POST['jobTitle'], $database);
$email = sanitizeInput($_POST['email'], $database);
$departmentID = (int)$_POST['departmentID']; // Ensure departmentID is an integer

// Create and run the query to insert the new employee
$employeeQuery = "INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID) 
                  VALUES('$firstName', '$lastName', '$jobTitle', '$email', $departmentID)";
$queryResult = $database->query($employeeQuery);

// Check if the query worked
if (!$queryResult) {
    $responseData = [];
    $responseData['status']['code'] = "400";
    $responseData['status']['name'] = "error";
    $responseData['status']['description'] = "Failed to add employee";
    $responseData['status']['returnedIn'] = (microtime(true) - $beginTime) / 1000 . " ms";
    $responseData['data'] = [];

    mysqli_close($database);
    echo json_encode($responseData);
    exit;
}

// Success response
$responseData = [];
$responseData['status']['code'] = "200";
$responseData['status']['name'] = "ok";
$responseData['status']['description'] = "Employee added successfully";
$responseData['status']['returnedIn'] = (microtime(true) - $beginTime) / 1000 . " ms";
$responseData['data'] = [];

mysqli_close($database);
echo json_encode($responseData);

// Helper function to sanitize input
function sanitizeInput($input, $db) {
    $input = trim($input);
    $input = mysqli_real_escape_string($db, $input);
    return $input;
}

?>