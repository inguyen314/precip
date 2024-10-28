document.addEventListener('DOMContentLoaded', function () {
    // Display the loading_alarm_mvs indicator
    const loadingIndicator = document.getElementById('loading_precip');
    loadingIndicator.style.display = 'block';

    // Gage control json file URL
    const jsonFileURL = 'https://wm.mvs.ds.usace.army.mil/php_data_api/public/json/gage_control.json';
    console.log('jsonFileURL: ', jsonFileURL);

    // Fetch JSON data from the specified URL
    fetch(jsonFileURL)
        .then(response => {
            // Check if response is OK, if not, throw an error
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            // Log the fetched data
            console.log('data: ', data);

            console.log('selectedBasin: ', selectedBasin);

            // Function to filter data for the "Big Muddy" basin
            function filterBasin(data) {
                return data.filter(entry => entry.basin === selectedBasin);
            }

            // Extracted data for the selected basin
            const basinData = filterBasin(data);

            // Print the extracted data for selected basin
            console.log('basinData: ', basinData);


            // Create an array of promises for each fetch
            const fetchPromises = basinData.map(item => {
                // Process each item and call the second fetch
                const basin = item.basin;

                const secondFetchUrl = `https://wm.mvs.ds.usace.army.mil/php_data_api/public/get_gage_control_by_basin.php?basin=${basin}`;
                console.log('secondFetchUrl:', secondFetchUrl);

                // Return the fetch promise
                return fetch(secondFetchUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    });
            });
            // Execute all fetch operations concurrently
            return Promise.all(fetchPromises)
                .then(secondDataArray => {
                    // Handle the combined data from the second fetch
                    console.log('secondDataArray:', secondDataArray);

                    // Merge the data
                    const mergedData = mergeData(basinData, secondDataArray);
                    console.log('mergedData: ', mergedData);

                    // Function to filter locations with report_precip === true
                    function filterLocations(data) {
                        const filteredData = [];
                        data.forEach(item => {
                            const filteredItem = { basin: item.basin, gages: [] };
                            item.gages.forEach(gage => {
                                if (gage.report_precip === true) {
                                    filteredItem.gages.push(gage);
                                }
                            });
                            if (filteredItem.gages.length > 0) { // At least one gage with report_precip === true
                                filteredData.push(filteredItem);
                            }
                        });
                        return filteredData;
                    }

                    // Filter the data
                    const filteredData = filterLocations(basinData);

                    // Call the function to create and populate the table
                    createTable(filteredData);

                    // Hide the loading_alarm_mvs indicator after the table is loaded
                    loadingIndicator.style.display = 'none';
                })
        })
        .catch(error => {
            // Log any errors that occur during fetching or parsing JSON
            console.error('Error fetching data:', error);
            // Hide the loading_alarm_mvs indicator if there's an error
            loadingIndicator.style.display = 'none';
        });
});

// Function to merge two jsons based on basin and location
function mergeData(data, secondDataArray) {
    if (Array.isArray(data) && data.length > 0) {
        // Iterate through each basin in data
        data.forEach(basin => {
            console.log('Processing basin:', basin);

            // Check if basin has gages and gages is an array
            if (Array.isArray(basin.gages) && basin.gages.length > 0) {
                // Iterate through each gage in the current basin's gages
                basin.gages.forEach(gage => {
                    // Find the matching data in secondDataArray based on location_id
                    secondDataArray.forEach(dataArr => {
                        const matchedObj = dataArr.find(obj => obj.location_id === gage.location_id);
                        if (matchedObj) {
                            // Merge the matched data into the corresponding location object
                            Object.assign(gage, matchedObj);
                        }
                    });
                })
            }
        })
    }
    return data;
}

// Function to create ld summary table
function createTable(filteredData) {
    // Create a table element
    const table = document.createElement('table');
    table.setAttribute('id', 'gage_data'); // Set the id to "gage_data"

    console.log("filteredData inside createTable = ", filteredData);

    // Create a table header row
    const headerRow = document.createElement('tr');

    if (type === "inc") {
        // Create table headers for the desired columns
        const columns = ["River Mile", "Location", "06 hr.", "12 hr.", "18 hr.", "24 hr.", "30 hr.", "36 hr.", "42 hr.", "48 hr.", "54 hr.", "60 hr.", "66 hr.", "72 hr.", "Zero hr."];
        columns.forEach((columnName) => {
            const th = document.createElement('th');
            th.textContent = columnName;
            th.style.height = '50px';
            headerRow.appendChild(th);
        });
    } else if (type === "cum") {
        // Create table headers for the desired columns
        const columns = ["River Mile", "Location", "06 hr.", "12 hr.", "24 hr.", "48 hr.", "72 hr.", "Zero hr."];
        columns.forEach((columnName) => {
            const th = document.createElement('th');
            th.textContent = columnName;
            th.style.height = '50px';
            headerRow.appendChild(th);
        });
    }


    // Append the header row to the table
    table.appendChild(headerRow);

    // Append the table to the document or a specific container
    const tableContainer = document.getElementById('table_container_precip');
    if (tableContainer) {
        tableContainer.appendChild(table);
    }

    // Populate table cells asynchronously
    populateTableCells(filteredData, table);

}

// Function to populate table cells asynchronously
function populateTableCells(filteredData, table) {
    filteredData.forEach(basin => {
        basin.gages.forEach(location => {
            console.log("Location ID:", location.location_id);
            console.log("Order:", location.order);
            console.log("TS ID:", location.tsid_precip_raw);
            console.log("River Mile:", location.station);
            // Access other properties of each location here
            console.log();

            // Create a new row for each data object
            const row = table.insertRow();
            console.log("Calling fetchAndUpdateData")
            fetchAndUpdateData(location.location_id, location.tsid_precip_raw, location.station, row);
        });
    });
}

// Function to fetch ld summary data
function fetchAndUpdateData(location_id, tsid_precip_raw, station, row) {
    // Create an object to hold all the properties you want to pass
    const dataToSend = {
        cwms_ts_id: tsid_precip_raw,
    };
    console.log('dataToSend:', dataToSend);

    // Convert the object into a query string
    const queryString = Object.keys(dataToSend).map(key => key + '=' + dataToSend[key]).join('&');
    console.log('queryString:', queryString);

    // Make an AJAX request to the PHP script, passing all the variables
    const url = `https://wm.mvs.ds.usace.army.mil/php_data_api/public/get_precip.php?${queryString}`;
    console.log('url:', url);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('data :', data);

            if (type === "inc") {
                if (data !== null) {
                    // RIVER MILE
                    const rivermileCell = row.insertCell();
                    rivermileCell.innerHTML = station;

                    // LOCATION
                    const locationCell = row.insertCell();
                    locationCell.innerHTML = data.location_id;

                    // 06
                    const value06Cell = row.insertCell();
                    const delta6 = ((parseFloat(data.value).toFixed(2)) - (parseFloat(data.value_6).toFixed(2))).toFixed(2);
                    const myClass6 = setPrecipClass(delta6, "inc_6");
                    value06Cell.innerHTML = delta6;
                    value06Cell.classList.add(myClass6);

                    // 12
                    const value12Cell = row.insertCell();
                    const delta12 = ((parseFloat(data.value_6).toFixed(2)) - (parseFloat(data.value_12).toFixed(2))).toFixed(2);
                    const myClass12 = setPrecipClass(delta12, "inc_12");
                    value12Cell.innerHTML = delta12;
                    value12Cell.classList.add(myClass12);

                    // 18
                    const value18Cell = row.insertCell();
                    const delta18 = ((parseFloat(data.value_12).toFixed(2)) - (parseFloat(data.value_18).toFixed(2))).toFixed(2);
                    const myClass18 = setPrecipClass(delta18, "inc_18");
                    value18Cell.innerHTML = delta18;
                    value18Cell.classList.add(myClass18);

                    // 24
                    const value24Cell = row.insertCell();
                    const delta24 = ((parseFloat(data.value_18).toFixed(2)) - (parseFloat(data.value_24).toFixed(2))).toFixed(2);
                    const myClass24 = setPrecipClass(delta24, "inc_24");
                    value24Cell.innerHTML = delta24;
                    value24Cell.classList.add(myClass24);

                    // 30
                    const value30Cell = row.insertCell();
                    const delta30 = ((parseFloat(data.value_24).toFixed(2)) - (parseFloat(data.value_30).toFixed(2))).toFixed(2);
                    const myClass30 = setPrecipClass(delta30, "inc_30");
                    value30Cell.innerHTML = delta30;
                    value30Cell.classList.add(myClass30);

                    // 36
                    const value36Cell = row.insertCell();
                    const delta36 = ((parseFloat(data.value_30).toFixed(2)) - (parseFloat(data.value_36).toFixed(2))).toFixed(2);
                    const myClass36 = setPrecipClass(delta36, "inc_36");
                    value36Cell.innerHTML = delta36;
                    value36Cell.classList.add(myClass36);

                    // 42
                    const value42Cell = row.insertCell();
                    const delta42 = ((parseFloat(data.value_36).toFixed(2)) - (parseFloat(data.value_42).toFixed(2))).toFixed(2);
                    const myClass42 = setPrecipClass(delta42, "inc_42");
                    value42Cell.innerHTML = delta42;
                    value42Cell.classList.add(myClass42);

                    // 48
                    const value48Cell = row.insertCell();
                    const delta48 = ((parseFloat(data.value_42).toFixed(2)) - (parseFloat(data.value_48).toFixed(2))).toFixed(2);
                    const myClass48 = setPrecipClass(delta48, "inc_48");
                    value48Cell.innerHTML = delta48;
                    value48Cell.classList.add(myClass48);

                    // 54
                    const value54Cell = row.insertCell();
                    const delta54 = ((parseFloat(data.value_48).toFixed(2)) - (parseFloat(data.value_54).toFixed(2))).toFixed(2);
                    const myClass54 = setPrecipClass(delta54, "inc_54");
                    value54Cell.innerHTML = delta54;
                    value54Cell.classList.add(myClass54);

                    // 60
                    const value60Cell = row.insertCell();
                    const delta60 = ((parseFloat(data.value_54).toFixed(2)) - (parseFloat(data.value_60).toFixed(2))).toFixed(2);
                    const myClass60 = setPrecipClass(delta60, "inc_60");
                    value60Cell.innerHTML = delta60;
                    value60Cell.classList.add(myClass60);

                    // 66
                    const value66Cell = row.insertCell();
                    const delta66 = ((parseFloat(data.value_60).toFixed(2)) - (parseFloat(data.value_66).toFixed(2))).toFixed(2);
                    const myClass66 = setPrecipClass(delta66, "inc_66");
                    value66Cell.innerHTML = delta66;
                    value66Cell.classList.add(myClass66);

                    // 72
                    const value72Cell = row.insertCell();
                    const delta72 = ((parseFloat(data.value_66).toFixed(2)) - (parseFloat(data.value_72).toFixed(2))).toFixed(2);
                    const myClass72 = setPrecipClass(delta72, "inc_72");
                    value72Cell.innerHTML = delta72;
                    value72Cell.classList.add(myClass72);

                    // Zero Hr
                    const zeroCell = row.insertCell();
                    zeroCell.innerHTML = data.date_time_cst;
                } else {
                    // RIVER MILE
                    const rivermileCell = row.insertCell();
                    rivermileCell.innerHTML = station;

                    // LOCATION
                    const locationCell = row.insertCell();
                    locationCell.innerHTML = location_id;

                    // 06
                    const value06Cell = row.insertCell();
                    value06Cell.innerHTML = "-M-";

                    // 12
                    const value12Cell = row.insertCell();
                    value12Cell.innerHTML = "-M-";

                    // 18
                    const value18Cell = row.insertCell();
                    value18Cell.innerHTML = "-M-";

                    // 24
                    const value24Cell = row.insertCell();
                    value24Cell.innerHTML = "-M-";

                    // 30
                    const value30Cell = row.insertCell();
                    value30Cell.innerHTML = "-M-";

                    // 36
                    const value36Cell = row.insertCell();
                    value36Cell.innerHTML = "-M-";

                    // 42
                    const value42Cell = row.insertCell();
                    value42Cell.innerHTML = "-M-";

                    // 48
                    const value48Cell = row.insertCell();
                    value48Cell.innerHTML = "-M-";

                    // 54
                    const value54Cell = row.insertCell();
                    value54Cell.innerHTML = "-M-";

                    // 60
                    const value60Cell = row.insertCell();
                    value60Cell.innerHTML = "-M-";

                    // 66
                    const value66Cell = row.insertCell();
                    value66Cell.innerHTML = "-M-";

                    // 72
                    const value72Cell = row.insertCell();
                    value72Cell.innerHTML = "-M-";

                    // Zero Hr
                    const zeroCell = row.insertCell();
                    zeroCell.innerHTML = "";
                }
            } else if (type === "cum") {
                if (data !== null) {
                    // RIVER MILE
                    const rivermileCell = row.insertCell();
                    rivermileCell.innerHTML = station;

                    // LOCATION
                    const locationCell = row.insertCell();
                    locationCell.innerHTML = data.location_id;

                    // 06
                    const value06Cell = row.insertCell();
                    const delta6 = ((parseFloat(data.value).toFixed(2)) - (parseFloat(data.value_6).toFixed(2))).toFixed(2);
                    const myClass6 = setPrecipClass(delta6, "inc_6");
                    value06Cell.innerHTML = delta6;
                    value06Cell.classList.add(myClass6);

                    // 12
                    const value12Cell = row.insertCell();
                    const delta12 = ((parseFloat(data.value).toFixed(2)) - (parseFloat(data.value_12).toFixed(2))).toFixed(2);
                    const myClass12 = setPrecipClass(delta12, "inc_12");
                    value12Cell.innerHTML = delta12;
                    value12Cell.classList.add(myClass12);


                    // 24
                    const value24Cell = row.insertCell();
                    const delta24 = ((parseFloat(data.value).toFixed(2)) - (parseFloat(data.value_24).toFixed(2))).toFixed(2);
                    const myClass24 = setPrecipClass(delta24, "inc_24");
                    value24Cell.innerHTML = delta24;
                    value24Cell.classList.add(myClass24);


                    // 48
                    const value48Cell = row.insertCell();
                    const delta48 = ((parseFloat(data.value).toFixed(2)) - (parseFloat(data.value_48).toFixed(2))).toFixed(2);
                    const myClass48 = setPrecipClass(delta48, "inc_48");
                    value48Cell.innerHTML = delta48;
                    value48Cell.classList.add(myClass48);


                    // 72
                    const value72Cell = row.insertCell();
                    const delta72 = ((parseFloat(data.value).toFixed(2)) - (parseFloat(data.value_72).toFixed(2))).toFixed(2);
                    const myClass72 = setPrecipClass(delta72, "inc_72");
                    value72Cell.innerHTML = delta72;
                    value72Cell.classList.add(myClass72);

                    // Zero Hr
                    const zeroCell = row.insertCell();
                    zeroCell.innerHTML = data.date_time_cst;
                } else {
                    // RIVER MILE
                    const rivermileCell = row.insertCell();
                    rivermileCell.innerHTML = station;

                    // LOCATION
                    const locationCell = row.insertCell();
                    locationCell.innerHTML = location_id;

                    // 06
                    const value06Cell = row.insertCell();
                    value06Cell.innerHTML = "-M-";

                    // 12
                    const value12Cell = row.insertCell();
                    value12Cell.innerHTML = "-M-";


                    // 24
                    const value24Cell = row.insertCell();
                    value24Cell.innerHTML = "-M-";


                    // 48
                    const value48Cell = row.insertCell();
                    value48Cell.innerHTML = "-M-";


                    // 72
                    const value72Cell = row.insertCell();
                    value72Cell.innerHTML = "-M-";

                    // Zero Hr
                    const zeroCell = row.insertCell();
                    zeroCell.innerHTML = "";
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle errors here
        });
}

// Function to get current data time
function subtractHoursFromDate(date, hoursToSubtract) {
    return new Date(date.getTime() - (hoursToSubtract * 60 * 60 * 1000));
}

function setPrecipClass(value, variableName) {
    if (value < 0) {
        console.log(variableName + " less than 0");
        return "precip_less_0";
    } else if (value === 0.00) {
        console.log(variableName + " equal to 0");
        return "precip_equal_0";
    } else if (value > 0.00 && value <= 0.25) {
        console.log(variableName + " greater than 0 and less than or equal to 0.25");
        return "precip_greater_0";
    } else if (value > 0.25 && value <= 0.50) {
        console.log(variableName + " greater than 0.25 and less than or equal to 0.50");
        return "precip_greater_25";
    } else if (value > 0.50 && value <= 1.00) {
        console.log(variableName + " greater than 0.50 and less than or equal to 1.00");
        return "precip_greater_50";
    } else if (value > 1.00 && value <= 2.00) {
        console.log(variableName + " greater than 1.00 and less than or equal to 2.00");
        return "precip_greater_100";
    } else if (value > 2.00) {
        console.log(variableName + " greater than 2.00");
        return "precip_greater_200";
    } else if (value === null) {
        console.log(variableName + " missing");
        return "precip_missing";
    } else {
        console.log(variableName + " equal to else");
        return "blank";
    }
}