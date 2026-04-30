<?php
    $host ="127.0.0.1";
    $dbname = "portfolio-website";
    $dbuser = "root";
    $dbpass = "";

    function getConnection(){
        global $host;
        global $dbname;
        $con = mysqli_connect($host, $GLOBALS['dbuser'], $GLOBALS['dbpass'], $dbname);
        return $con;
    }
?>