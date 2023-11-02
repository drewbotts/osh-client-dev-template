import CesiumView from './osh-js/source/core/ui/view/map/CesiumView.js';
import {
    Cartesian3,
    CesiumTerrainProvider,
    Cesium3DTileset,
    EllipsoidTerrainProvider,
    Ion,
    IonResource
} from 'cesium';
import * as Cesium from "cesium";
import SosGetResultJson from "./osh-js/source/core/datasource/SosGetResultJson";
import PointMarkerLayer from "./osh-js/source/core/ui/layer/PointMarkerLayer";
import PolygonLayer from "./osh-js/source/core/ui/layer/PolygonLayer";
import FFMPEGView from "./osh-js/source/core/ui/view/video/FFMPEGView";
import SosGetResultVideo from "./osh-js/source/core/datasource/SosGetResultVideo";
import ChartJsView from './osh-js/source/core/ui/view/chart/ChartJsView.js';
import CurveLayer from './osh-js/source/core/ui/layer/CurveLayer.js';
import DataSynchronizer from './osh-js/source/core/timesync/DataSynchronizer'
import {Mode} from "./osh-js/source/core/datasource/Mode";

window.CESIUM_BASE_URL = './';

Ion.defaultAccessToken = '';

let server = "localhost:8282/sensorhub/admin";
let start = "2023-10-20T18:49:32Z";
let end = "2023-10-20T18:49:49Z";
let offeringId = "urn:osh:sensor:rapiscanrpm0001";
let gammaProperty = "http://www.opengis.net/def/gamma-scan";
let neutronProperty = "http://www.opengis.net/def/neutron-scan";

let dataSources = [];

//DATASOURCES

let gammaDataSource = new SosGetResultJson("Gamma-Scan", {
    endpointUrl: server,
    offeringID: offeringId,
    observedProperty: gammaProperty,
    startTime: start,
    endTime: end,
    minTime: start,
    maxTime: end,
    mode: Mode.BATCH,
    tls: false
});

dataSources.push(gammaDataSource);

let neutronDataSource = new SosGetResultJson("Neutron-Scan", {
    endpointUrl: server,
    offeringId: offeringId,
    observedProperty: neutronProperty,
    startTime: start,
    endTime: end,
    minTime: start,
    maxTime: end,
    mode: Mode.BATCH,
    tls: false
});

dataSources.push(neutronDataSource);

// Layers

let gammaCurveLayer = new CurveLayer({
    getValues: {
        dataSourceId: gammaDataSource.id,
        handler: function (rec, timestamp) {
            return{
                x: timestamp,
                y: rec.gamma1
            };
        }
    },
    name: 'GAMMA COUNT',
    backgroundColor: 'rgb(255,255,255)',
    lineColor: 'rgba(220,89,67,0.83)',
    maxValues: 2500000
});

let neutronCurveLayer = new CurveLayer({
    getValues: {
        dataSourceId: neutronDataSource.id,
    handler: function (rec, timestamp) {
        return {
            x: timestamp,
            y: rec.neutron1
        };
    },
    name: 'NEUTRON COUNT',
        backgroundColor: 'rgb(255,255,255)',
        lineColor: 'rgba(87,30,234,0.83)',
        maxValues: 2500000
}});

// VIEWS

let gammaChartView = new ChartJsView({
    container: 'gamma-chart-window',
    layers: [gammaCurveLayer],
    css: "chart-view"
});

let neutronChartView = new ChartJsView({
    container: 'neutron-chart-window',
    layers: [neutronCurveLayer],
    css: "chart-view"
});

// start streaming
let masterTimeController = new DataSynchronizer({
    replaySpeed: 1,
    intervalRate: 5,
    dataSources: dataSources
  });

masterTimeController.connect();
