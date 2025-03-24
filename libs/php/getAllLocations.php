<?php

// Start the timer to measure script execution time
$startTimer = microtime(true);

// Include the database configuration
include("config.php");

// Set the response type to JSON
header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$dbLink = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check if the database connection works
if (mysqli_connect_errno()) {
    $response = createResponse("300", "error", "Could not connect to database", $startTimer, []);
    mysqli_close($dbLink);
    echo json_encode($response);
    exit;
}

// Run the query to get all locations
$locationQuery = "SELECT id, name FROM location ORDER BY name";
$queryResult = $dbLink->query($locationQuery);

// Check if the query worked
if (!$queryResult) {
    $response = createResponse("400", "error", "Query did not work", $startTimer, []);
    mysqli_close($dbLink);
    echo json_encode($response);
    exit;
}

// Fetch the locations into an array
$locations = [];
while ($row = mysqli_fetch_assoc($queryResult)) {
    $locations[] = $row;
}

// Check if any locations were found (just for clarity)
$locationCount = count($locations);
if ($locationCount === 0) {
    $description = "No locations found";
} else {
    $description = "Locations retrieved successfully";
}

// Create the success response
$response = createResponse("200", "ok", $description, $startTimer, $locations);

// Close the database connection and send the response
mysqli_close($dbLink);
echo json_encode($response);

// Helper function to create the response array
function createResponse($code, $name, $desc, $start, $data) {
    $response = [];
    $response['status']['code'] = $code;
    $response['status']['name'] = $name;
    $response['status']['description'] = $desc;
    $response['status']['returnedIn'] = (microtime(true) - $start) / 1000 . " ms";
    $response['data'] = $data;
    return $response;
}

?>