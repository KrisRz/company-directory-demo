<?php

// Start the timer to measure script execution
$startTimer = microtime(true);

// Include the database configuration
include("config.php");

// Set the response type to JSON
header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$dbLink = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check if the database connection works
if (mysqli_connect_errno()) {
    $resultArray = buildResponse("301", "error", "Cannot connect to database", $startTimer, []);
    mysqli_close($dbLink);
    echo json_encode($resultArray);
    exit;
}

// Check if the location ID is provided
if (!isset($_POST['id']) || empty($_POST['id'])) {
    $resultArray = buildResponse("400", "error", "Location ID is missing", $startTimer, []);
    mysqli_close($dbLink);
    echo json_encode($resultArray);
    exit;
}

// Get the number of departments linked to this location
$locationId = (int)$_POST['id']; // Ensure id is an integer
$deptQuery = "SELECT count(id) as deptCount FROM department WHERE locationID = $locationId";
$deptResult = $dbLink->query($deptQuery);

$deptData = [];
while ($row = mysqli_fetch_assoc($deptResult)) {
    $deptData[] = $row;
}

$deptCount = $deptData[0]['deptCount'];

// Check if the location has departments assigned
if ($deptCount == 0) {
    $resultArray = buildResponse("200", "ok", "No departments assigned to this location", $startTimer, $deptCount);
} else {
    $resultArray = buildResponse("400", "forbidden", "Departments are assigned to this location", $startTimer, $deptCount);
}

// Close the database connection and send the response
mysqli_close($dbLink);
echo json_encode($resultArray);

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