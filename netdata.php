<?php 
include('vars.php');
file_put_contents('$DUMP_LOCATION', fopen('php://input', r), FILE_APPEND);
file_put_contents('$DUMP_LOCATION', ';', FILE_APPEND);
?>
