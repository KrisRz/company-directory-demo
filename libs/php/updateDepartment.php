<?php

// Start the timer to track script execution
$timeStart = microtime(true);

// Include the database configuration
include("config.php");

// Set the response type to JSON
header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$dbConnection = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check if the database connection works
if (mysqli_connect_errno()) {
    $resultData = buildResponse("300", "error", "Database connection failed", $timeStart, []);
    mysqli_close($dbConnection);
    echo json_encode($resultData);
    exit;
}

// Check if all required fields are provided
$requiredFields = ['id', 'name', 'locationID'];
foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        $resultData = buildResponse("401", "error", "Missing required field: $field", $timeStart, []);
        mysqli_close($dbConnection);
        echo json_encode($resultData);
        exit;
    }
}

// Get and clean the input data
$deptId = (int)$_POST['id']; // Ensure id is an integer
$deptName = mysqli_real_escape_string($dbConnection, trim($_POST['name']));
$locId = (int)$_POST['locationID']; // Ensure locationID is an integer

// Create and run the query to update the department
$updateQuery = "UPDATE department SET name = '$deptName', locationID = $locId WHERE id = $deptId";
$updateResult = $dbConnection->query($updateQuery);

// Check if the query worked
if (!$updateResult) {
    $resultData = buildResponse("400", "error", "Failed to update department", $timeStart, []);
    mysqli_close($dbConnection);
    echo json_encode($resultData);
    exit;
}

// Success response
$resultData = buildResponse("200", "ok", "Department updated successfully", $timeStart, []);

// Close the database connection and send the response
mysqli_close($dbConnection);
echo json_encode($resultData);

// Helper function to build the response array
function buildResponse($code, $name, $description, $startTime, $data) {
    $response = [];
    $response['status']['code'] = $code;
    $response['status']['name'] = $name;
    $response['status']['description'] = $description;
    $response['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";
    $response['data'] = $data;
    return $response;
}

?>