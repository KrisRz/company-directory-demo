<?php
require_once("config.php");

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if ($conn->connect_error) {
    die("❌ No connection: " . $conn->connect_error);
} else {
    echo "✅ Successful conection!";
}

$conn->close();
?>
