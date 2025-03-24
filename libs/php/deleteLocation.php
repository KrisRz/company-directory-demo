<?php

// Start the timer to track how long the script runs
$timerStart = microtime(true);

// Include the database configuration
include("config.php");

// Set the response type to JSON
header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$dbConnection = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check if the database connection works
if (mysqli_connect_errno()) {
    $resultArray = buildResponse("300", "error", "Database connection failed", $timerStart, []);
    mysqli_close($dbConnection);
    echo json_encode($resultArray);
    exit;
}

// Check if the location ID is provided
if (!isset($_POST['id']) || empty($_POST['id'])) {
    $resultArray = buildResponse("400", "error", "Location ID is missing", $timerStart, []);
    mysqli_close($dbConnection);
    echo json_encode($resultArray);
    exit;
}

// Get the number of departments linked to this location
$locationId = $_POST['id'];
$checkQuery = "SELECT count(id) as deptCount FROM department WHERE locationID = $locationId";
$checkResult = $dbConnection->query($checkQuery);

$deptData = [];
while ($row = mysqli_fetch_assoc($checkResult)) {
    $deptData[] = $row;
}

$deptCount = $deptData[0]['deptCount'];

// If no departments are linked, delete the location
if ($deptCount == 0) {
    $deleteQuery = "DELETE FROM location WHERE id = $locationId";
    $deleteResult = $dbConnection->query($deleteQuery);

    if (!$deleteResult) {
        $resultArray = buildResponse("400", "error", "Failed to delete location", $timerStart, []);
        mysqli_close($dbConnection);
        echo json_encode($resultArray);
        exit;
    }

    $resultArray = buildResponse("200", "ok", "Location deleted successfully", $timerStart, $deptCount);
} else {
    $resultArray = buildResponse("400", "forbidden", "Cannot delete: Location has assigned departments", $timerStart, $deptCount);
}

// Close the database connection and send the response
mysqli_close($dbConnection);
echo json_encode($resultArray);

// Helper function to create the response array
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