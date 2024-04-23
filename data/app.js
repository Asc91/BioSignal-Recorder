// Add event listeners to the start-stop buttons
const startButton = document.getElementById("option1");
const stopButton = document.getElementById("option2");

$(document).on("click", ".allow-focus", function (e) {
  e.stopPropagation();
});

function record() {
  $("#save_csv").prop("disabled", false);
  console.log($("#record-pause").text());
  if ($("#record-pause").hasClass("record")) {
    $("#record-pause").removeClass("record");
    $("#record-pause").removeClass("btn-primary");
    $("#record-pause").text("Pause");
  } else {
    $("#record-pause").text("Record");
    $("#record-pause").addClass("record");
    $("#record-pause").addClass("btn-primary");
  }
}
startButton.addEventListener("click", startOscilloscope);
stopButton.addEventListener("click", stopOscilloscope);

/*********************************************************************************************************************************/
/************************************ Visual configuration for data shown on chart ***********************************************/
var dataBSR = [];
dataBSR[0] = {
  labels: [0],
  datasets: [
    {
      label: "Channel 0",
      data: [],
      borderColor: "#00CCFF",
      backgroundColor: "#00CCFF",
      borderWidth: 2,
      pointRadius: 0,
    },
  ],
};
dataBSR[1] = {
  labels: [0],
  datasets: [
    {
      label: "Channel 1",
      data: [],
      borderColor: "#eb6434",
      backgroundColor: "#eb6434",
      borderWidth: 2,
      pointRadius: 0,
    },
  ],
};
dataBSR[2] = {
  labels: [0],
  datasets: [
    {
      label: "Channel 2",
      data: [],
      borderColor: "#dbbf30",
      backgroundColor: "#dbbf30",
      borderWidth: 2,
      pointRadius: 0,
    },
  ],
};
dataBSR[3] = {
  labels: [0],
  datasets: [
    {
      label: "Channel 3",
      data: [],
      borderColor: "#b80d43",
      backgroundColor: "#b80d43",
      borderWidth: 2,
      pointRadius: 0,
    },
  ],
};
dataBSR[4] = {
  labels: [0],
  datasets: [
    {
      label: "Channel 4",
      data: [],
      borderColor: "#b80d43",
      backgroundColor: "#b80d43",
      borderWidth: 2,
      pointRadius: 0,
    },
  ],
};
dataBSR[5] = {
  labels: [0],
  datasets: [
    {
      label: "Channel 5",
      data: [],
      borderColor: "#b80d43",
      backgroundColor: "#b80d43",
      borderWidth: 2,
      pointRadius: 0,
    },
  ],
};
dataBSR[6] = {
  labels: [0],
  datasets: [
    {
      label: "Channel 6",
      data: [],
      borderColor: "#b80d43",
      backgroundColor: "#b80d43",
      borderWidth: 2,
      pointRadius: 0,
    },
  ],
};
dataBSR[7] = {
  labels: [0],
  datasets: [
    {
      label: "Channel 7",
      data: [],
      borderColor: "#ff38fd",
      backgroundColor: "#b80d43",
      borderWidth: 2,
      pointRadius: 0,
    },
  ],
};

// config for chart
var optionsBSR = {
  scales: {
    y: {
      display: true,
      title: {
        display: true,
        text: "Analog",
        color: "#999",
        font: {
          family: "Roboto",
          size: 20,
          lineHeight: 1.2,
        },
        padding: { top: 10, left: 0, right: 0, bottom: 0 },
      },
      suggestedMin: 0,
      suggestedMax: 5000,
    },
    x: {
      display: true,
      title: {
        display: true,
        text: "Time",
        color: "#999",
        font: {
          family: "Roboto",
          size: 20,
          lineHeight: 1.2,
        },
        padding: { top: 10, left: 0, right: 0, bottom: 0 },
      },
      ticks: {
        maxTicksLimit: 10,
      },
    },
  },
  animation: {
    duration: 0,
  },
  elements: {
    line: {
      tension: 0.5,
    },
  },
  responsive: true,
};

Chart.defaults.font.size = 13;
Chart.defaults.font.style = "normal";
Chart.defaults.backgroundColor = "#44d474";
/**********************************************************************************************************************************/

// This array will contain chart instances. We can use these to update individual charts
var chart = [];
var active_charts = [];

function destroy_charts() {
  if (chart.length) {
    for (var i = 0; i < active_charts.length; i++) {
      canvas_parent = "#d" + i;
      $(canvas_parent).toggleClass("d-none");
      ID = "#c" + i;
      chart[i].destroy();
      $(ID).toggleClass("d-none");
    }
    chart.length = 0;
  }
  if ($(".input_sampling_rate")[0]) {
    $(".input_sampling_rate").remove();
  }
}

function create_chart() {
  //Before we create new charts we need to remove older ones by removing corresponding canvas
  for (var i = 0; i < active_charts.length; i++) {
    channel_ID = "#channel" + active_charts[i];

    channel = $(channel_ID).prop("checked");

    if (channel) {
      ID_C = "#c" + i;
      ID_D = "#d" + i;
      $(ID_D).toggleClass("d-none");
      $(ID_C).toggleClass("d-none");

      const ctx = $(ID_C)[0].getContext("2d");

      chart[i] = new Chart(ctx, {
        type: "line",
        data: dataBSR[active_charts[i]],
        options: optionsBSR,
      });
      var subparent = document.createElement("p");

      var input_sampling_rate = document.createElement("input");
      input_sampling_rate.setAttribute(
        "class",
        "input_sampling_rate w-auto m-1 form-md"
      );
      input_sampling_rate.setAttribute(
        "placeholder",
        "Enter Sampling rate"
      );
      input_sampling_rate.style.textAlign = "center";
      subparent.appendChild(input_sampling_rate);
      cl = "#d" + i;
      $(cl).append(subparent);
    }
  }
}

$(".input_sampling_rate").attr("type", "number");
$(document).ready(function () {
  $("input").attr({
    max: 5000,
    min: 1,
  });
});
function update_active_charts(channel_number) {
  destroy_charts();

  id = "#channel" + channel_number;
  if ($(id).prop("checked")) {
    if (active_charts.length >= 4) {
      window.alert("Only 4 Channels can be used at a time.");
      $(id).prop("checked", false);
    } else {
      active_charts.push(channel_number);
      console.log(active_charts);
    }
  } else {
    active_charts.splice(active_charts.indexOf(channel_number), 1);
    console.log(active_charts);
  }
  create_chart();
}
update_active_charts(0);

// This stores websocket object when we start websocket connection
var webSocket = null;

// close websocket connection when toggle is switched off
function stopOscilloscope() {
  if (webSocket != null) {
    webSocket.close();
    webSocket = null;
  }
}
// Initialise CSV file
var csvFileData = "Channel, Time, Analog, Packet No.\n";
/*  Called when toggle is switched On.
This function is used to start websocket connection.*/
function startOscilloscope() {
  var pin = active_charts;
  // Create array of selected sampling rate
  var rate = [];
  var i = 0;
  $(".input_sampling_rate").each(function () {
    rate[i] = $(this).val();
    i++;
  });
  // Start a new websocket connection
  webSocket = new WebSocket("ws://" + window.location.hostname + ":81/");
  webSocket.binaryType = "arraybuffer";
  // When connection is 'opened' GPIO and corresponding sampling rate should be transmitted.
  webSocket.addEventListener("open", (event) => {
    msg = chart.length + "9";
    webSocket.send(msg);
    for (var i = 0; i < chart.length; i++) {
      msg = rate[i] + pin[i];
      webSocket.send(msg);
    }
  });
  // Store current time before starting chart
  // we will use relative time as lable in chart
  start_t = Date.now();
  // Whenever a packet is recieved through websocket following function is called
  webSocket.onmessage = function (event) {
    // Store received data
    if (event.data instanceof ArrayBuffer) {
      ADC = new Uint16Array(event.data);
    }
    // Last index of recieved packet has 'channel number'
    channel_count = active_charts[ADC[ADC.length - 1]];
    // Second last index of data recieved has 'packet number' for given channel
    packet_count = ADC[ADC.length - 2];
    // Add recieved data to dataset of chart
    for (var i = 0; i < ADC.length - 2; i++) {
      dataBSR[channel_count].datasets[0].data.unshift(ADC[i]);
    }
    // Remove old data if number of points on screen is greater than 250
    while (dataBSR[channel_count].datasets[0].data.length > 1000) {
      dataBSR[channel_count].datasets[0].data.pop();
    }
    if (dataBSR[channel_count].labels.length > 1000) {
      dataBSR[channel_count].labels.pop();
    }

    // Get current time, just before updating CSV and chart
    current_t = Date.now();
    time = parseInt(current_t) - parseInt(start_t);
    dataBSR[channel_count].labels.unshift(time);

    // if Record button is pressed (now turned to pause) start recording
    if (!$("#record").hasClass("record")) {
      // Append new data to CSV file
      for (var i = 0; i < ADC.length - 2; i++) {
        csvFileData +=
          channel_count +
          "," +
          time +
          "," +
          ADC[i] +
          "," +
          packet_count +
          "\n";
      }
    }
  };

  // Refresh rate of 30 FPS
  window.setInterval(callback, 33);
  function callback() {
    for (var i = 0; i < chart.length; i++) {
      chart[i].update();
    }
  }
}

// Download CSV file
function save_csv() {
  var hiddenElement = document.createElement("a");
  hiddenElement.href =
    "data:text/csv;charset=utf-8," + encodeURI(csvFileData);
  hiddenElement.target = "_blank";

  //provide the name for the CSV file to be downloaded
  hiddenElement.download = "chart.csv";
  hiddenElement.click();

  // Turn off toggle
  $(".toggle").prop("checked", false);
}