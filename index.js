"use strict";

function bitmex(chart) {
    var prevPrice;
    var ws = new WebSocket("wss://www.bitmex.com/realtime");
    ws.onopen = function() {
        var cmd = {"op": "subscribe", "args": ["instrument:XBTUSD"]};
        ws.send(JSON.stringify(cmd));
    };
    ws.onclose = function() {
        console.log("BitMEX closed, reconnect.");
        setTimeout(function() {
            bitmex(chart);
        }, 1000);
    };
    ws.onmessage = function(msg) {
        var obj = JSON.parse(msg.data);
        if (obj.table) {
            obj.data.forEach(element => {
                var price;
                if (element.lastTickDirection == "PlusTick" || element.lastTickDirection == "MinusTick") {
                    price = element.lastPrice;
                    prevPrice = element.lastPrice;
                } else {
                    price = prevPrice;
                }
                chart.data.datasets[0].data.push({x: element.timestamp, y: price});
            });
        };
    };
}

function coinbase(chart) {
    var ws = new WebSocket("wss://ws-feed.pro.coinbase.com");
    ws.onopen = function() {
        var cmd = {
            "type": "subscribe",
            "product_ids": [
                "BTC-USD",
            ],
            "channels": [
                "ticker",
            ]
        }
        ws.send(JSON.stringify(cmd));
    };
    ws.onclose = function() {
        console.log("Coinbase closed, reconnect.");
        setTimeout(function() {
            coinbase(chart);
        }, 1000);
    };
    ws.onmessage = function(msg) {
        var obj = JSON.parse(msg.data);
        if (obj.type == "ticker" && obj.time) {
            chart.data.datasets[1].data.push({x: obj.time, y: parseFloat(obj.price)});
        }
    };
}

function binance(chart) {
    var ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
    ws.onopen = function() {
    };
    ws.onclose = function() {
        console.log("Binance closed, reconnect.")
        setTimeout(function() {
            binance(chart);
        }, 1000);
    };
    ws.onmessage = function(msg) {
        var obj = JSON.parse(msg.data);
        if (obj.e == "trade") {
            chart.data.datasets[2].data.push({x: obj.E, y: parseFloat(obj.p)});
        }
    };
}

function onload(event) {
    var ctx = document.getElementById("container").getContext("2d");
    var chart = new Chart(ctx, {
        type: "line",
        data: {
                datasets: [
                    {
                        label: "BitMEX",
                        borderColor: "rgb(255, 127, 127)",
                        backgroundColor: "rgb(255, 127, 127)",
                        borderWidth: 2,
                        fill: false,
                        lineTension: 0,
                        data: [],
                    },
                    {
                        label: "Coinbase Pro",
                        borderColor: "rgb(127, 255, 127)",
                        backgroundColor: "rgb(127, 255, 127)",
                        borderWidth: 2,
                        fill: false,
                        lineTension: 0,
                        data: [],
                    },
                    {
                        label: "Binance",
                        borderColor: "rgb(127, 127, 255)",
                        backgroundColor: "rgb(127, 127, 255)",
                        borderWidth: 2,
                        fill: false,
                        lineTension: 0,
                        data: [],
                    }],
            },
        options: {
            events: [],
            scales: {
                xAxes: [{
                    type: "realtime",
                    realtime: {
                        duration: 60000,
                    }
                }],
            }
        },
    });

    bitmex(chart);
    coinbase(chart);
    binance(chart);
}

document.addEventListener("DOMContentLoaded", onload);