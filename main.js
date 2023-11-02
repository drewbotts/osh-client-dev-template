import SosGetResult from "./osh-js/source/core/datasource/sos/SosGetResult.datasource";
import ChartJsView from './osh-js/source/core/ui/view/chart/ChartJsView.js';
import CurveLayer from './osh-js/source/core/ui/layer/CurveLayer.js';
import DataSynchronizer from './osh-js/source/core/timesync/DataSynchronizer';
import {Mode} from "./osh-js/source/core/datasource/Mode";
import VideoDataLayer from "./osh-js/source/core/ui/layer/VideoDataLayer";
import VideoView from "./osh-js/source/core/ui/view/video/VideoView";

/// --------------------- ///
/// WITH VIDEO PLAYBACK VERSION ///
/// --------------------- ///

let server = "localhost:8282/sensorhub/sos";
// GAMMA Alarm 1 Occupancy
let gammaAOStart = "2023-10-31T18:20:45Z";
let gammaAOEnd = "2023-10-31T18:21:02Z";

let fullStart = "2023-10-31T18:20:18Z";
let fullEnd = "2023-10-31T18:23:12Z";

let testStart = "2023-11-01T15:03:13.515Z";
let testEnd = "2023-11-01T15:08:14.515Z";

// Full Database
let start = gammaAOStart;
let end = gammaAOEnd;
let offeringId = "urn:osh:sensor:rapiscanrpm0001";
let videoOfferingID = "urn:android:device:3260a03a280be236";
let gammaProperty = "http://www.opengis.net/def/gamma-scan";
let neutronProperty = "http://www.opengis.net/def/neutron-scan";
let videoProperty = "http://sensorml.com/ont/swe/property/VideoFrame";
let mode = Mode.BATCH;



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
});

let gammaHiDS = new SosGetResult("Gamma-Scan", {
    endpointUrl: server,
    offeringID: offeringId,
    observedProperty: gammaProperty,
    startTime: start,
    endTime: end,
    minTime: start,
    maxTime: end,
    mode: mode,
    tls: false,
    protocol:"ws",
});

// dataSources.push(gammaHiDS);


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
});

let neutronHiDS = new SosGetResult("Neutron-Scan", {
    endpointUrl: server,
    offeringID: offeringId,
    observedProperty: neutronProperty,
    startTime: start,
    endTime: end,
    minTime: start,
    maxTime: end,
    mode: mode,
    tls: false,
    protocol:"ws",
});

// dataSources.push(neutronHiDS);

let cameraDataSource = new SosGetResult("Camera",{
    endpointUrl: server,
    offeringID: videoOfferingID,
    observedProperty: videoProperty,
    startTime:start,
    endTime: end,
    mode:mode,
    tls:false,
    protocol:"ws",

});

dataSources.push(cameraDataSource);

// Layers
let gammaCurveLayer = new CurveLayer({
    dataSourceId: gammaDataSource.id,
    name: 'GAMMA COUNT',
    backgroundColor: 'rgba(91,67,65,0.66)',
    lineColor: 'rgba(91,67,65,0.66)',
    maxValues: 250,
    getValues: (rec, timeStamp) => {
        return{
            x:timeStamp,
            y: rec.Gamma1
        };
    },
});

let gammaHiCurveLayer = new CurveLayer({
    dataSourceId: gammaHiDS.id,
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

let neutronCurveLayer = new CurveLayer({
    dataSourceId: neutronDataSource.id,
    maxValues: 250,
    name: 'NEUTRON COUNT',
    backgroundColor: 'rgba(91,67,65,0.66)',
    lineColor: 'rgba(91,67,65,0.66)',
    getValues: {
        handler: function (rec, timestamp) {
            return {
                x: timestamp,
                y: rec.Neutron1
            };
        }
    }});
let neutronHiCurveLayer = new CurveLayer({
    dataSourceId: neutronHiDS.id,
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

let cameraVideoLayer = new VideoDataLayer({
    dataSourceId: cameraDataSource.id,
    getFrameData: (rec)=> rec.img,
    getTimestamp: (rec)=> rec.timestamp,
});

// VIEWS

let gammaChartView = new ChartJsView({
    container: 'gamma-chart-window',
    layers: [gammaHiCurveLayer],
    css: "chart-view",
    type: "line",
});

let neutronChartView = new ChartJsView({
    container: 'neutron-chart-window',
    layers: [neutronHiCurveLayer],
    css: "chart-view"
});

let cameraView = new VideoView({
    container: 'video-window',
    css: 'video-h264',
    name: 'Camera',
    showTime: true,
    showStats: true,
    layers: [cameraVideoLayer]
});

gammaHiDS.connect();
neutronHiDS.connect();
// cameraDataSource.connect();


// start streaming
let masterTimeController = new DataSynchronizer({
    startTime: start,
    intervalRate: 5,
    dataSources: dataSources
});

masterTimeController.connect();
