import SosGetResult from "./osh-js/source/core/datasource/sos/SosGetResult.datasource";
import ChartJsView from './osh-js/source/core/ui/view/chart/ChartJsView.js';
import CurveLayer from './osh-js/source/core/ui/layer/CurveLayer.js';
import DataSynchronizer from './osh-js/source/core/timesync/DataSynchronizer';
import {Mode} from "./osh-js/source/core/datasource/Mode";

// window.CESIUM_BASE_URL = './';

// Ion.defaultAccessToken = '';

let server = "localhost:8282/sensorhub/sos";
// GAMMA Alarm 1 Occupancy
let gammaStart = "2023-10-20T18:49:32Z";
let gammaEnd = "2023-10-20T18:49:49Z";

// Full Database
let fullStart = "2023-10-20T18:49:00Z";
let fullEnd = "2023-10-20T18:51:30Z";
let offeringId = "urn:osh:sensor:rapiscanrpm0001";
let gammaProperty = "http://www.opengis.net/def/gamma-scan";
let neutronProperty = "http://www.opengis.net/def/neutron-scan";

let start = fullStart;
let end = fullEnd;


let dataSources = [];

//DATASOURCES

let gammaDataSource = new SosGetResult("Gamma-Scan", {
    endpointUrl: server,
    offeringID: offeringId,
    observedProperty: gammaProperty,
    startTime: start,
    endTime: end,
    minTime: start,
    maxTime: end,
    mode: Mode.BATCH,
    tls: false,
    protocol:"ws",
    responseFormat: 'application/json'
});

dataSources.push(gammaDataSource);


let neutronDataSource = new SosGetResult("Neutron-Scan", {
    endpointUrl: server,
    offeringID: offeringId,
    observedProperty: neutronProperty,
    startTime: start,
    endTime: end,
    minTime: start,
    maxTime: end,
    mode: Mode.BATCH,
    tls: false,
    protocol:"ws",
    responseFormat: 'application/json'
});

dataSources.push(neutronDataSource);

// Layers
let gammaCurveLayer = new CurveLayer({
    dataSourceId: gammaDataSource.id,
    name: 'GAMMA COUNT',
    backgroundColor: 'rgba(220,89,67,0.83)',
    lineColor: 'rgba(220,89,67,0.83)',
    maxValues: 250,
    getValues: (rec, timeStamp) => {
        return{
            x:timeStamp,
            y: rec.Gamma1
        };
    },
});
// let gammaCurveLayer = new CurveLayer({
//     getValues: {
//         dataSourceId: gammaDataSource.id,
//         handler: function (rec, timestamp) {
//             return{
//                 x: timestamp,
//                 y: rec.Gamma1
//             };
//         }
//     },
//
// });

let neutronCurveLayer = new CurveLayer({
    dataSourceId: neutronDataSource.id,
    maxValues: 250,
    name: 'NEUTRON COUNT',
    backgroundColor: 'rgba(87,30,234,0.83)',
    lineColor: 'rgba(87,30,234,0.83)',
    getValues: {
        handler: function (rec, timestamp) {
            return {
                x: timestamp,
                y: rec.Neutron1
            };
        }
    }});

// VIEWS

let gammaChartView = new ChartJsView({
    container: 'gamma-chart-window',
    layers: [gammaCurveLayer, neutronCurveLayer],
    css: "chart-view",
    type: "line",
});

let neutronChartView = new ChartJsView({
    container: 'neutron-chart-window',
    layers: [neutronCurveLayer],
    css: "chart-view"
});

// gammaDataSource.connect();
// neutronDataSource.connect();


// // start streaming
// let masterTimeController = new DataSynchronizer({
//     startTime: start,
//     intervalRate: 5,
//     dataSources: dataSources
// });

// masterTimeController.connect();
