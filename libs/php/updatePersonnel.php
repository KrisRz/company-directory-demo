<?php

// Start the timer to track how long the script runs
$startTime = microtime(true);

// Include the database configuration
include("config.php");

// Set the response type to JSON
header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$dbConn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check if the database connection works
if (mysqli_connect_errno()) {
    $responseArray = [];
    $responseArray['status']['code'] = "300";
    $responseArray['status']['name'] = "error";
    $responseArray['status']['description'] = "Cannot connect to database";
    $responseArray['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";
    $responseArray['data'] = [];

    mysqli_close($dbConn);
    echo json_encode($responseArray);
    exit;
}

// Check if all required fields are provided
$requiredFields = ['id', 'firstName', 'lastName', 'email', 'jobTitle', 'departmentID'];
foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        $responseArray = [];
        $responseArray['status']['code'] = "400";
        $responseArray['status']['name'] = "error";
        $responseArray['status']['description'] = "Missing required field: $field";
        $responseArray['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";
        $responseArray['data'] = [];

        mysqli_close($dbConn);
        echo json_encode($responseArray);
        exit;
    }
}

// Clean the input data to prevent SQL injection
$personId = (int)$_POST['id']; // Ensure id is an integer
$firstName = cleanInput($_POST['firstName'], $dbConn);
$lastName = cleanInput($_POST['lastName'], $dbConn);
$email = cleanInput($_POST['email'], $dbConn);
$jobTitle = cleanInput($_POST['jobTitle'], $dbConn);
$deptId = (int)$_POST['departmentID']; // Ensure departmentID is an integer

// Create and run the query to update the employee
$updateQuery = "UPDATE personnel SET 
                firstName = '$firstName', 
                lastName = '$lastName', 
                email = '$email', 
                jobTitle = '$jobTitle', 
                departmentID = $deptId 
                WHERE id = $personId";
$updateResult = $dbConn->query($updateQuery);

// Check if the query worked
if (!$updateResult) {
    $responseArray = [];
    $responseArray['status']['code'] = "400";
    $responseArray['status']['name'] = "error";
    $responseArray['status']['description'] = "Failed to update employee";
    $responseArray['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";
    $responseArray['data'] = [];

    mysqli_close($dbConn);
    echo json_encode($responseArray);
    exit;
}

// Success response
$responseArray = [];
$responseArray['status']['code'] = "200";
$responseArray['status']['name'] = "ok";
$responseArray['status']['description'] = "Employee updated successfully";
$responseArray['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";
$responseArray['data'] = [];

mysqli_close($dbConn);
echo json_encode($responseArray);

// Helper function to clean input
function cleanInput($input, $db) {
    $input = trim($input);
    $input = mysqli_real_escape_string($db, $input);
    return $input;
}

?>