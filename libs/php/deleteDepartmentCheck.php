<?php

// Start the timer to track script execution
$timerStart = microtime(true);

// Include the database configuration
include("config.php");

// Set the response type to JSON
header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$connection = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check if the database connection works
if (mysqli_connect_errno()) {
    $responseData = formatResponse("301", "error", "Database connection failed", $timerStart, []);
    mysqli_close($connection);
    echo json_encode($responseData);
    exit;
}

// Check if the department ID is provided
if (!isset($_POST['id']) || empty($_POST['id'])) {
    $responseData = formatResponse("400", "error", "Department ID is missing", $timerStart, []);
    mysqli_close($connection);
    echo json_encode($responseData);
    exit;
}

// Get the number of employees in this department
$deptId = (int)$_POST['id']; // Ensure id is an integer
$checkQuery = "SELECT count(id) as empCount FROM personnel WHERE departmentID = $deptId";
$checkResult = $connection->query($checkQuery);

$empData = [];
while ($row = mysqli_fetch_assoc($checkResult)) {
    $empData[] = $row;
}

$empCount = $empData[0]['empCount'];

// Check if the department has employees
if ($empCount == 0) {
    $responseData = formatResponse("200", "ok", "No employees in this department", $timerStart, $empCount);
} else {
    $responseData = formatResponse("400", "forbidden", "Employees are assigned to this department", $timerStart, $empCount);
}

// Close the database connection and send the response
mysqli_close($connection);
echo json_encode($responseData);

// Helper function to format the response
function formatResponse($code, $name, $description, $startTime, $data) {
    $response = [];
    $response['status']['code'] = $code;
    $response['status']['name'] = $name;
    $response['status']['description'] = $description;
    $response['status']['returnedIn'] = (microtime(true) - $startTime) / 1000 . " ms";
    $response['data'] = $data;
    return $response;
}

?>