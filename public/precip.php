<?php
require_once('../private/initialize.php');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set("xdebug.var_display_max_children", '-1');
ini_set("xdebug.var_display_max_data", '-1');
ini_set("xdebug.var_display_max_depth", '-1');

date_default_timezone_set('America/Chicago');
if (date_default_timezone_get()) {
    //echo 'date_default_timezone_set: ' . date_default_timezone_get() . '<br />';
}
if (ini_get('date.timezone')) {
    //echo 'date.timezone: ' . ini_get('date.timezone');
}

$basin = $_GET['basin'] ?? null;
$type = $_GET['type'] ?? null;
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Precip <?php if ($type == "inc") {
                        echo "Incremental";
                    } else if ($type == "cum") {
                        echo "Cummulative";
                    } ?></title>
    <meta name="Description" content="U.S. Army Corps of Engineers St. Louis District Home Page" />
    <link rel="stylesheet" href="../../css/body.css" />
    <link rel="stylesheet" href="stylesheets/style.css" />
    <link rel="stylesheet" href="../../css/breadcrumbs.css" />
    <link rel="stylesheet" href="../../css/jumpMenu.css" />
    <script type="text/javascript" src="../../js/main.js"></script>

    <!-- Add sidebar.css IF NOT LOAD SIDEBAR TEMPLATE -->
    <link rel="stylesheet" href="../../css/sidebar.css" />

    <!-- Include Moment.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <!-- Include the Chart.js library -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Include the Moment.js adapter for Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-moment@1.0.0"></script>
</head>

<body>
    <div id="page-container">
        <header id="header">
            <!--Header content populated here by JavaScript Tag at end of body -->
        </header>
        <div class="page-wrap">
            <div class="container-fluid">
                <div id="breadcrumbs">
                </div>
                <!--////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
                <!--APP STARTS-->
                <div class="page-content">
                    <div id="topPane" class="col-md backend-cp-collapsible">
                        <div class="box-usace">
                            <h2 class="box-header-striped">
                                <span class="titleLabel title">Precip <?php if ($type == "inc") {
                                                                            echo "Incremental";
                                                                        } else if ($type == "cum") {
                                                                            echo "Cummulative";
                                                                        } ?> <?php echo $basin; ?> PHP</span>
                                <span class="rss"></span>
                            </h2>
                            <div class="box-content" style="background-color:white;margin:auto">
                                <div class="content">
                                    <!-- Box Content Here -->
                                    <span>
                                        <h3><a href='precip.php?basin=Mississippi&type=<?php if ($type == "inc") {
                                                                                            echo "inc";
                                                                                        } else if ($type == "cum") {
                                                                                            echo "cum";
                                                                                        } ?>'>Switch to PHP</a></h3>
                                    </span>
                                    <span>
                                        <h3><a href='precip.html?basin=Mississippi&type=<?php if ($type == "inc") {
                                                                                            echo "inc";
                                                                                        } else if ($type == "cum") {
                                                                                            echo "cum";
                                                                                        } ?>&cda=internal'>Switch to Cloud Internal</a></h3>
                                    </span>
                                    <span>
                                        <h3><a href='precip.html?basin=Mississippi&type=<?php if ($type == "inc") {
                                                                                            echo "inc";
                                                                                        } else if ($type == "cum") {
                                                                                            echo "cum";
                                                                                        } ?>&cda=public'>Switch to Cloud Public</a></h3>
                                    </span>
                                    <div id="legend"></div>
                                    <script>
                                        // Create table element
                                        var table = document.createElement("table");
                                        table.id = "precip_title";

                                        // Create table row
                                        var row = document.createElement("tr");

                                        // Add cells to the row
                                        row.innerHTML = "<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>" +
                                            "<td class='precip_equal_0_legend'>#FFFFFF</td>" +
                                            "<td style='text-align: center'>Zero<br>Precip.</td>" +
                                            "<td class='precip_greater_0_legend'>#FFFFFF</td>" +
                                            "<td style='text-align: center'>Low<br>0.00-0.25</td>" +
                                            "<td class='precip_greater_25_legend'>#FFFFFF</td>" +
                                            "<td style='text-align: center'>Low-Med<br>0.25-0.50</td>" +
                                            "<td class='precip_greater_50_legend'>#FFFFFF</td>" +
                                            "<td style='text-align: center'>Med-High<br>0.50-1.00</td>" +
                                            "<td class='precip_greater_100_legend'>#FFFFFF</td>" +
                                            "<td style='text-align: center'>High<br>1.00-2.00</td>" +
                                            "<td class='precip_missing_legend'>#FFFFFF</td>" +
                                            "<td style='text-align: center'>Missing<br>Data</td>" +
                                            "<td class='precip_greater_200_legend'>#FFFFFF</td>" +
                                            "<td style='text-align: center'>Over<br>Limit</td>" +
                                            "<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

                                        // Append the row to the table
                                        table.appendChild(row);

                                        // Append the table to the div with id "legend"
                                        document.getElementById("legend").appendChild(table);
                                    </script>
                                    <table id="precip_title">
                                        <tr>
                                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                            <td>
                                                <p><strong><a href="precip.php?basin=Mississippi&type=<?php if ($type == "inc") {
                                                                                                            echo "inc";
                                                                                                        } else if ($type == "cum") {
                                                                                                            echo "cum";
                                                                                                        } ?>">Mississippi</a></strong></p>
                                            </td>
                                            <td>
                                                <p><strong><a href="precip.php?basin=Ohio&type=<?php if ($type == "inc") {
                                                                                                    echo "inc";
                                                                                                } else if ($type == "cum") {
                                                                                                    echo "cum";
                                                                                                } ?>">Ohio</a></strong></p>
                                            </td>
                                            <td>
                                                <p><strong><a href="precip.php?basin=Salt&type=<?php if ($type == "inc") {
                                                                                                    echo "inc";
                                                                                                } else if ($type == "cum") {
                                                                                                    echo "cum";
                                                                                                } ?>">Salt</a></strong></p>
                                            </td>
                                            <td>
                                                <p><strong><a href="precip.php?basin=Cuivre&type=<?php if ($type == "inc") {
                                                                                                        echo "inc";
                                                                                                    } else if ($type == "cum") {
                                                                                                        echo "cum";
                                                                                                    } ?>">Cuivre</a></strong></p>
                                            </td>
                                            <td>
                                                <p><strong><a href="precip.php?basin=Illinois&type=<?php if ($type == "inc") {
                                                                                                        echo "inc";
                                                                                                    } else if ($type == "cum") {
                                                                                                        echo "cum";
                                                                                                    } ?>">Illinois</a></strong></p>
                                            </td>
                                            <td>
                                                <p><strong><a href="precip.php?basin=Missouri&type=<?php if ($type == "inc") {
                                                                                                        echo "inc";
                                                                                                    } else if ($type == "cum") {
                                                                                                        echo "cum";
                                                                                                    } ?>">Missouri</a></strong></p>
                                            </td>
                                            <td>
                                                <p><strong><a href="precip.php?basin=Meramec&type=<?php if ($type == "inc") {
                                                                                                        echo "inc";
                                                                                                    } else if ($type == "cum") {
                                                                                                        echo "cum";
                                                                                                    } ?>">Meramec</a></strong></p>
                                            </td>
                                            <td>
                                                <p><strong><a href="precip.php?basin=Kaskaskia&type=<?php if ($type == "inc") {
                                                                                                        echo "inc";
                                                                                                    } else if ($type == "cum") {
                                                                                                        echo "cum";
                                                                                                    } ?>">Kaskaskia</a></strong></p>
                                            </td>
                                            <td>
                                                <p><strong><a href="precip.php?basin=Big Muddy&type=<?php if ($type == "inc") {
                                                                                                        echo "inc";
                                                                                                    } else if ($type == "cum") {
                                                                                                        echo "cum";
                                                                                                    } ?>">Big Muddy</a></strong></p>
                                            </td>
                                            <td>
                                                <p><strong><a href="precip.php?basin=St Francis&type=<?php if ($type == "inc") {
                                                                                                            echo "inc";
                                                                                                        } else if ($type == "cum") {
                                                                                                            echo "cum";
                                                                                                        } ?>">St Francis</a></strong></p>
                                            </td>
                                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <script>
                    var selectedBasin = <?php echo json_encode($_GET['basin'] ?? '1'); ?>;
                    console.log('selectedBasin: ', selectedBasin);
                    var type = <?php echo json_encode($_GET['type'] ?? '1'); ?>;
                    console.log('type: ', type);
                </script>
                <div id="loading_precip" style="display: none;"><img src="../../images/loading4.gif" style='height: 50px; width: 50px;' alt="Loading..." /></div>
                <div id="table_container_precip"></div>
                <script src="precip.js"></script>
                <!--APP ENDS-->
                <!--////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
                <div class="page-content">
                    <sidebar id="sidebar">
                        <!--Side bar content populated here by JavaScript Tag at end of body -->
                    </sidebar>
                    <div id="topPane" class="col-md backend-cp-collapsible">
                        <!--////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
                        <!-- Page Content Here -->
                        <div class="box-usace">
                            <h2 class="box-header-striped">
                                <span class="titleLabel title">Note</span>
                                <span class="rss"></span>
                            </h2>
                            <div class="box-content" style="background-color:white;margin:auto">
                                <div class="content">
                                    <!-- Box Content Here -->
                                    <p>Zero hour refers to time of most current precipitation data </p>
                                </div>
                            </div>
                        </div>
                        <!--////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
                    </div>
                </div>
            </div>
            <button id="returnTop" title="Return to Top of Page">Top</button>
        </div>
    </div>
    <footer id="footer">
        <!--Footer content populated here by script tag at end of body -->
    </footer>
    <script src="../../js/libraries/jQuery-3.3.6.min.js"></script>
    <script defer>
        // When the document has loaded pull in the page header and footer skins
        $(document).ready(function() {
            // Change the v= to a different number to force clearing the cached version on the client browser
            $('#header').load('../../templates/DISTRICT.header.html');
            //$('#sidebar').load('../../templates/DISTRICT.sidebar.html');
            $('#footer').load('../../templates/DISTRICT.footer.html');
        })
    </script>
</body>

</html>
<?php db_disconnect($db); ?>