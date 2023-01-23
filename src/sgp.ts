/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * An example that creates job.fgmj in the jobs folder via PSaaS Builder.
 */
Object.defineProperty(exports, "__esModule", {
    value: true,
});
// import { AllGeoJSON } from "@turf/turf";
//const dataSetCutter = require('./datasetCutter.js')
console.clear();
//const { exec } = require("child_process");
import {exec} from 'child_process';

// const turf = require('@turf/turf')
import  turf  from '@turf/turf';
const spotWxService = require('./spotwx_service.js')

const sgpFetch = require("node-fetch")

const fs = require("fs-extra");

//const path = require("path");
import path from 'path';
const luxon_1 = require("luxon");





luxon_1.Settings.defaultZoneName = 'UTC-6'
var modeller = require("psaas-js-api");
let serverConfig = new modeller.defaults.ServerConfiguration();
console.log("serverConfig", serverConfig);
//initialize the connection settings for PSaaS_Builder
modeller.globals.SocketHelper.initialize(
    'sparcsonline.com',
    32479
);
//turn on debug messages
modeller.globals.PSaaSLogger.getInstance().setLogLevel(
    modeller.globals.PSaaSLogLevel.VERBOSE //  1 
    // modeller.globals.PSaaSLogLevel.DEBUG // 2
    // modeller.globals.PSaaSLogLevel.INFO // 3
    // modeller.globals.PSaaSLogLevel.WARN // 4
    // modeller.globals.PSaaSLogLevel.NONE // 5

);

const remoteDataPath = "/home/sparcsadmin/psaas_data/test_data/"
const remotejobsFolder = path.join(__dirname, './psaas_data/jobs/');
const psaasExec = "/usr/bin/psaas"
//set the default MQTT broker to use when listening for PSaaS events
modeller.client.JobManager.setDefaults({

    host: "emqx.vm.sparcsonline.com",
    port: 1883,
    topic: "psaas",
    username: "psaasuser",
    password: "psaaspass"
});



//the directory of the test files
//make sure the path ends in a trailing slash
//var localDir = path.join(__dirname, './psaas_data/testdata/');
var localDir = path.join(__dirname, './psaas_data/nwt_dataset/test_data/');

//var localDir = path.join(__dirname, '../../nwt/test_data/');

//an asynchronous function for creating a job and listening for status messages.

const sgpModel = (fireID: string, lat: any, lon: any, ele: any, fireGeom: any, modelDataset: any, weather: any, cffdrs: any) => {
    console.log(`Executing the SGP model on ${fireID}`);
    return new Promise(async (resolve, reject) => {
        // newDataset {
        //     path: '/Users/franconogarin/nwt/FS001-21/',
        //     bbox: 'bbox.geoJson',
        //     lut: 'dataset.lut',
        //     prj: 'dataset.prj',
        //     elevation: 'elevation.tif',
        //     fuels: 'fuels.tif'
        //   }
        // console.log("weather",weather);

        var scenarioStartString = await weather.firstDateLocal.split(" ")[0] + "T13:00:00"
        var scenarioEndString = await luxon_1.DateTime.fromISO(weather.firstDateLocal.split(" ")[0] + "T13:00:00").plus({ hours: 24 }).toISODate() + "T13:00:00"
        var scenarioThreeDayEndString = await luxon_1.DateTime.fromISO(weather.firstDateLocal.split(" ")[0] + "T13:00:00").plus({ hours: 72 }).toISODate() + "T13:00:00"
        await modeller.globals.PSaaSLogger.getInstance().info("Start: " + scenarioStartString);
        await modeller.globals.PSaaSLogger.getInstance().info("End: " + scenarioEndString);
        var bcStartDate = await weather.firstDateLocal.split(" ")[0]
        var bcEndDate = await luxon_1.DateTime.fromISO(weather.firstDateLocal.split(" ")[0] + "T13:00:00").plus({ hours: 24 }).toISODate()
        var bcDay1Date = await luxon_1.DateTime.fromISO(weather.firstDateLocal.split(" ")[0] + "T13:00:00").plus({ hours: 24 }).toISODate()
        var bcDay2Date = await luxon_1.DateTime.fromISO(weather.firstDateLocal.split(" ")[0] + "T13:00:00").plus({ hours: 48 }).toISODate()
        var bcDay3Date = await luxon_1.DateTime.fromISO(weather.firstDateLocal.split(" ")[0] + "T13:00:00").plus({ hours: 72 }).toISODate()
        //fetch the default settings for some parameters from PSaaS Builder
        await modeller.globals.PSaaSLogger.getInstance().info("Grabbing the jDefaults.");
        var jDefaults = await new modeller.defaults.JobDefaults().getDefaultsPromise();
        await modeller.globals.PSaaSLogger.getInstance().info("We have the jDefaults.");
        // console.log(jDefaults);
        await modeller.globals.PSaaSLogger.getInstance().info("Building Prometheus job.");
        //set this to the location of the test files folder.
        var prom = await new modeller.psaas.PSaaS();

        var projectionFile = await modelDataset.path + modelDataset.prj
        //console.log('Proj File used:', projectionFile);
        await prom.setProjectionFile(projectionFile);


        await prom.setElevationFile(modelDataset.path + modelDataset.elevation);
        await prom.setFuelmapFile(modelDataset.path + modelDataset.fuels);
        await prom.setLutFile(modelDataset.path + modelDataset.lut);

        await prom.setTimezoneByValue(18); //hard coded to MDT, see example_timezone.js for an example getting the IDs




        var spotwxWeatherStation = await prom.addWeatherStation(ele, new modeller.globals.LatLon(lat, lon));

        var header = await "HOURLY,HOUR,TEMP,RH,WD,WS,PRECIP"
        var forecastLines = await weather.records.map((r: any) => {
            return `${r.localDate}, ${r.localHour}, ${r.temp}, ${r.rh}, ${r.wd}, ${r.ws}, ${r.precip}`
        })
        await forecastLines.unshift(header)

        // console.log("forecast", forecast)
        var spotwxAttachment = await prom.addAttachment('spotwx_forecast.txt', forecastLines.join('\n'));

        if (cffdrs.cffdrs.ffmc === null || cffdrs.cffdrs.dmc === null || cffdrs.cffdrs.dc === null){
            await console.log("WARNING: detected a null value in cffdrs:",cffdrs.cffdrs);
            cffdrs.cffdrs.ffmc = 85
            cffdrs.cffdrs.dmc = 6
            cffdrs.cffdrs.dc = 15
            console.log("WARNING: substituting defaults in cffdrs:",cffdrs.cffdrs);

        }

        var spotwxWeatherStream = await spotwxWeatherStation.addWeatherStream(
            spotwxAttachment, 94.0, 17,
            modeller.psaas.HFFMCMethod.LAWSON,
            cffdrs.cffdrs.ffmc,
            cffdrs.cffdrs.dmc,
            cffdrs.cffdrs.dc,
            parseFloat(cffdrs.cffdrs.rn24),
            weather.firstDateLocal.split(" ")[0],
            weather.lastDateLocal.split(" ")[0]);



    //    console.log("fireGeom", fireGeom);
        if (fireGeom.geometry.type == 'Point') {
            //create the ignition points
            var latLongObj = await new modeller.globals.LatLon(
                lat,
                lon
            );

            // add it to the model

                // create small fuel poly

               let  fuelPoly = await turf.buffer(fireGeom,300,{units: 'meters'})
               let coords = await fuelPoly.geometry.coordinates[0].map(pair=>{
                return new modeller.globals.LatLon(
                    pair[1],
                    pair[0]
                );
            })
            var mainIgnition = await prom.addPointIgnition(
                latLongObj,
                //luxon_1.DateTime.fromISO(weather.firstDateLocal.split(" ")[0] + "T13:00:00"));
                scenarioStartString);


                // var ignitionPatch:any = await prom.addPolygonFuelPatch(
                //     coords, "allFuels", "c-2",  'this is an ignition fuel patch'
                // )
        }
        else if(fireGeom.geometry.type == 'MultiPolygon'){
            //geometry: { type: 'MultiPolygon', coordinates: [ [Array] ] },
            var ignitionPatch:any = await false
            mainIgnition = []

            fireGeom.geometry.coordinates.forEach(subpolyCoords=>{
                let coords = subpolyCoords[0].map(pair => {
                    return new modeller.globals.LatLon(pair[1], pair[0]);
                });
        
            
               let ignition = prom.addPolygonIgnition(coords, scenarioStartString);
               mainIgnition.push(ignition)
            })
        }
        else {
            //create ignition polygon
            console.log("odd geom:",fireGeom);
            // prom.addPolygonIgnition(

            // )
        }



        // create weather patches for best and worst case

        // the Best case lowers the predicted temperatures by 5 degrees and raises the predicted RH by 5% 
        // the worst case raises temperatures by 5 degrees and lowers RH by 5%. 

        var bestCaseWeatherPatch = await prom.addLandscapeWeatherPatch(
            //       "YYYY-MM-DDThh:mm:ss".
            //     weather.firstDateLocal.split(" ")[0] + "T13:00:00"

            //luxon_1.DateTime.fromISO(weather.firstDateLocal.split(" ")[0] + "T13:00:00"),
            scenarioStartString,
            modeller.globals.Duration.createTime(13, 0, 0, false),
            //"13:00:00",
            //luxon_1.DateTime.fromISO(weather.firstDateLocal.split(" ")[0] + "T21:00:00"),
            scenarioEndString,
            modeller.globals.Duration.createTime(13, 0, 0, false), fireID + " Best Case Patch");
        //  "13:00:00");
        bestCaseWeatherPatch.setTemperatureOperation(modeller.psaas.WeatherPatchOperation.MINUS, 5);
        bestCaseWeatherPatch.setRhOperation(modeller.psaas.WeatherPatchOperation.PLUS, 5);
        //bestCaseWeatherPatch.setWindSpeedOperation(modeller.psaas.WeatherPatchOperation.MINUS, 25);

        var worstCaseWeatherPatch = prom.addLandscapeWeatherPatch(
            scenarioStartString,
            modeller.globals.Duration.createTime(13, 0, 0, false),
            scenarioEndString,
            modeller.globals.Duration.createTime(13, 0, 0, false), fireID + " Worst Case Patch");
        worstCaseWeatherPatch.setTemperatureOperation(modeller.psaas.WeatherPatchOperation.PLUS, 5);
        worstCaseWeatherPatch.setRhOperation(modeller.psaas.WeatherPatchOperation.MINUS, 5);
 

        //create 3 scenarios


        let bestScenario: any = prom.addScenario(
            scenarioStartString,
            scenarioEndString,
            "This is the best case Scenario");


        bestScenario.setName(fireID + " Best Case Scenario");
        bestScenario.displayInterval = modeller.globals.Duration.createTime(24, 0, 0, false);
        bestScenario.addBurningCondition(bcStartDate, 0, 24, 19, 0.0, 95.0, 0.0);
        bestScenario.addBurningCondition(bcEndDate, 0, 24, 19, 0.0, 95.0, 0.0);
        let maxAccTS = modeller.globals.Duration.createTime(0, 2, 0, false); // The maximum time step during acceleration.
        let distRes = 1.0; // The distance resolution.
        let perimRes = 1.0; // The perimeter resolution.
        let minSpreadRos = 0.001 // Minimum Spreading ROS.
        let stopAtGridEnd = false; // Whether to stop the fire spread when the simulated fire reaches the boundary of the grid data.
        let breaching = true; // Whether breaching is turned on or off.
        let dynSpatialT = true; // Whether using the dynamic spatial threshold algorithm is turned on or off.
        let spotting = true; // Whether the spotting model should be activated.
        let purgeND = false; // purge Non Displayable - Whether internal/hidden time steps are retained.
        let useGrowthPctl = false; // Whether the growth percentile value is applied.
        let GrowthPctl = 50.0; // Growth percentile, to apply to specific fuel types.

        // setFbpOptions(terrainEffect: boolean, windEffect: boolean)

        let terrainEffect = true
        let windEffect = true;
        // setFmcOptions(perOverrideVal: number, nodataElev: number, terrain: boolean, accurateLocation: boolean)

        let perOverrideVal = -1 //disabled
        let nodataElev = 0.0
        let fmcTerrain = true
        let fmcAccurateLocation = false

        // setFwiOptions(fwiSpacInterp: boolean, fwiFromSpacWeather: boolean, historyOnEffectedFWI: boolean, burningConditionsOn: boolean, fwiTemporalInterp: boolean)

        let fwiSpacInterp = true
        let fwiFromSpacWeather = true
        let historyOnEffectedFWI = true
        let burningConditionsOn = true
        let fwiTemporalInterp = false

        bestScenario.setFgmOptions(maxAccTS, distRes, perimRes, minSpreadRos, stopAtGridEnd,
            breaching, dynSpatialT, spotting, purgeND, useGrowthPctl, GrowthPctl);

        bestScenario.setFbpOptions(terrainEffect, windEffect);
        bestScenario.setFmcOptions(perOverrideVal, nodataElev, fmcTerrain, fmcAccurateLocation);
        bestScenario.setFwiOptions(fwiSpacInterp, fwiFromSpacWeather, historyOnEffectedFWI, burningConditionsOn, fwiTemporalInterp);
        
        if(Array.isArray(mainIgnition)){
            console.log("adding multiple ignitions");
            for (const subIgnition of mainIgnition) {
                bestScenario.addIgnitionReference(subIgnition);
            }
        }
        else {
            bestScenario.addIgnitionReference(mainIgnition);
        }

        // if (ignitionPatch!== false){
        //     console.log("using an ignition patch on best case");
        //     bestScenario.addFuelPatchReference(ignitionPatch,8)
        // }

        bestScenario.addWeatherStreamReference(spotwxWeatherStream);
        bestScenario.addWeatherPatchReference(bestCaseWeatherPatch, 4);
        let bestScenarioOutputKml = prom.addOutputVectorFileToScenario(
            modeller.psaas.VectorFileType.KML,
            'bestCase.kml',
            scenarioStartString,
            scenarioEndString,
            bestScenario);

        bestScenarioOutputKml.mergeContact = true;
        bestScenarioOutputKml.multPerim = true;
        bestScenarioOutputKml.removeIslands = true;
        bestScenarioOutputKml.metadata = jDefaults.metadataDefaults;
        bestScenarioOutputKml.shouldStream = true;

        //allow the file to be streamed to a remote location after it is written (ex. streamOutputToMqtt, streamOutputToGeoServer).

        let bestScenarioOutputSummary = prom.addOutputSummaryFileToScenario(bestScenario, "bestSummary.txt");
        bestScenarioOutputSummary.shouldStream = true;



        let worstScenario = prom.addScenario(
            scenarioStartString,
            scenarioEndString,
            "This is the worst case Scenario");


        worstScenario.setName(fireID + " Worst Case Scenario");
        worstScenario.displayInterval = modeller.globals.Duration.createTime(24, 0, 0, false);
        worstScenario.addBurningCondition(bcStartDate, 0, 24, 19, 0.0, 95.0, 0.0);
        worstScenario.addBurningCondition(bcEndDate, 0, 24, 19, 0.0, 95.0, 0.0);
        worstScenario.setFgmOptions(maxAccTS, distRes, perimRes, minSpreadRos, stopAtGridEnd,
            breaching, dynSpatialT, spotting, purgeND, useGrowthPctl, GrowthPctl);
        worstScenario.setFbpOptions(terrainEffect, windEffect);
        worstScenario.setFmcOptions(perOverrideVal, nodataElev, fmcTerrain, fmcAccurateLocation);
        worstScenario.setFwiOptions(fwiSpacInterp, fwiFromSpacWeather, historyOnEffectedFWI, burningConditionsOn, fwiTemporalInterp);
  
        if(Array.isArray(mainIgnition)){
            console.log("adding multiple ignitions");
            for (const subIgnition of mainIgnition) {
                worstScenario.addIgnitionReference(subIgnition);
            }
        }
        else {
            worstScenario.addIgnitionReference(mainIgnition);
        }


        // if (ignitionPatch !== false){
        //     console.log("using an ignition patch on worst case");
        //     worstScenario.addFuelPatchReference(ignitionPatch,9)
        // }
        worstScenario.addWeatherStreamReference(spotwxWeatherStream);
        worstScenario.addWeatherPatchReference(worstCaseWeatherPatch, 5);
        let worstScenarioOutputKml = prom.addOutputVectorFileToScenario(
            modeller.psaas.VectorFileType.KML,
            'worstCase.kml',
            scenarioStartString,
            scenarioEndString,
            worstScenario);

        worstScenarioOutputKml.mergeContact = true;
        worstScenarioOutputKml.multPerim = true;
        worstScenarioOutputKml.removeIslands = true;
        worstScenarioOutputKml.metadata = jDefaults.metadataDefaults;
        worstScenarioOutputKml.shouldStream = true;

        //allow the file to be streamed to a remote location after it is written (ex. streamOutputToMqtt, streamOutputToGeoServer).

        let worstScenarioOutputSummary = prom.addOutputSummaryFileToScenario(worstScenario, "worstSummary.txt");
        worstScenarioOutputSummary.shouldStream = true;
        let doThreeDay = false
        
        if (doThreeDay){
        let threeDayScenario = prom.addScenario(
            scenarioStartString,
            scenarioThreeDayEndString,
            "This is the Three Day Scenario");
        
      
        threeDayScenario.setName(fireID + " 3 Day Scenario");
        threeDayScenario.displayInterval = modeller.globals.Duration.createTime(2, 0, 0, false);
        threeDayScenario.addBurningCondition(bcStartDate, 0, 24, 19, 0.0, 95.0, 0.0);
        threeDayScenario.addBurningCondition(bcDay1Date, 0, 24, 19, 0.0, 95.0, 0.0);
        threeDayScenario.addBurningCondition(bcDay2Date, 0, 24, 19, 0.0, 95.0, 0.0);
        threeDayScenario.addBurningCondition(bcDay3Date, 0, 24, 19, 0.0, 95.0, 0.0);
        threeDayScenario.setFgmOptions(maxAccTS, distRes, perimRes, minSpreadRos, stopAtGridEnd,
            breaching, dynSpatialT, spotting, purgeND, useGrowthPctl, GrowthPctl);
        threeDayScenario.setFbpOptions(terrainEffect, windEffect);
        threeDayScenario.setFmcOptions(perOverrideVal, nodataElev, fmcTerrain, fmcAccurateLocation);
        threeDayScenario.setFwiOptions(fwiSpacInterp, fwiFromSpacWeather, historyOnEffectedFWI, burningConditionsOn, fwiTemporalInterp);
        
        if(Array.isArray(mainIgnition)){
            console.log("adding multiple ignitions");
            for (const subIgnition of mainIgnition) {
                threeDayScenario.addIgnitionReference(subIgnition);
            }
        }
        else {
            threeDayScenario.addIgnitionReference(mainIgnition);
        }
        
        
        threeDayScenario.addWeatherStreamReference(spotwxWeatherStream);
        
       // let statsFile = modeller.PSaaS.Outputs.newStatsFile(threeDayScenario)
       let statsFile = prom.addOutputStatsFileToScenario(threeDayScenario,'3dayScenarioStats.csv')
        
         // DATE_TIME | ELAPSED_TIME | TIME_STEP_DURATION | TEMPERATURE | DEW_POINT | RELATIVE_HUMIDITY | WIND_SPEED | WIND_DIRECTION | PRECIPITATION | HFFMC | HISI | DMC | DC | HFWI | BUI | FFMC | ISI | FWI | TIMESTEP_AREA | TIMESTEP_BURN_AREA | TOTAL_AREA | TOTAL_BURN_AREA | AREA_GROWTH_RATE | EXTERIOR_PERIMETER | EXTERIOR_PERIMETER_GROWTH_RATE | ACTIVE_PERIMETER | ACTIVE_PERIMETER_GROWTH_RATE | TOTAL_PERIMETER | TOTAL_PERIMETER_GROWTH_RATE | FI_LT_10 | FI_10_500 | FI_500_2000 | FI_2000_4000 | FI_4000_10000 | FI_GT_10000 | ROS_0_1 | ROS_2_4 | ROS_5_8 | ROS_9_14 | ROS_GT_15 | MAX_ROS | MAX_FI | MAX_FL | MAX_CFB | MAX_CFC | MAX_SFC | MAX_TFC | TOTAL_FUEL_CONSUMED | CROWN_FUEL_CONSUMED | SURFACE_FUEL_CONSUMED | NUM_ACTIVE_VERTICES | NUM_VERTICES | CUMULATIVE_VERTICES | CUMULATIVE_ACTIVE_VERTICES | NUM_ACTIVE_FRONTS | NUM_FRONTS | MEMORY_USED_START | MEMORY_USED_END | NUM_TIMESTEPS | NUM_DISPLAY_TIMESTEPS | NUM_EVENT_TIMESTEPS | NUM_CALC_TIMESTEPS | TICKS | PROCESSING_TIME | GROWTH_TIME): GlobalStatistics
         let stats = [
             modeller.globals.GlobalStatistics.DATE_TIME,  modeller.globals.GlobalStatistics.ELAPSED_TIME,  modeller.globals.GlobalStatistics.TIME_STEP_DURATION,  modeller.globals.GlobalStatistics.TEMPERATURE, // modeller.globals.GlobalStatistics.RELATIVE_HUMIDITY,  modeller.globals.GlobalStatistics.WIND_SPEED,  modeller.globals.GlobalStatistics.WIND_DIRECTION,  modeller.globals.GlobalStatistics.PRECIPITATION,  modeller.globals.GlobalStatistics.HFFMC,  modeller.globals.GlobalStatistics.HISI,  modeller.globals.GlobalStatistics.DMC,  modeller.globals.GlobalStatistics.DC,  modeller.globals.GlobalStatistics.HFWI,  modeller.globals.GlobalStatistics.BUI,  modeller.globals.GlobalStatistics.FFMC,  modeller.globals.GlobalStatistics.ISI,  modeller.globals.GlobalStatistics.FWI,  modeller.globals.GlobalStatistics.TIMESTEP_AREA,  modeller.globals.GlobalStatistics.TIMESTEP_BURN_AREA,  modeller.globals.GlobalStatistics.TOTAL_AREA,  modeller.globals.GlobalStatistics.TOTAL_BURN_AREA,  modeller.globals.GlobalStatistics.AREA_GROWTH_RATE,  modeller.globals.GlobalStatistics.EXTERIOR_PERIMETER,  modeller.globals.GlobalStatistics.EXTERIOR_PERIMETER_GROWTH_RATE,  modeller.globals.GlobalStatistics.ACTIVE_PERIMETER,  modeller.globals.GlobalStatistics.ACTIVE_PERIMETER_GROWTH_RATE,  modeller.globals.GlobalStatistics.TOTAL_PERIMETER,  modeller.globals.GlobalStatistics.TOTAL_PERIMETER_GROWTH_RATE,  modeller.globals.GlobalStatistics.FI_LT_10,  modeller.globals.GlobalStatistics.FI_10_500,  modeller.globals.GlobalStatistics.FI_500_2000,  modeller.globals.GlobalStatistics.FI_2000_4000,  modeller.globals.GlobalStatistics.FI_4000_10000,  modeller.globals.GlobalStatistics.FI_GT_10000,  modeller.globals.GlobalStatistics.ROS_0_1,  modeller.globals.GlobalStatistics.ROS_2_4,  modeller.globals.GlobalStatistics.ROS_5_8,  modeller.globals.GlobalStatistics.ROS_9_14,  modeller.globals.GlobalStatistics.ROS_GT_15,  modeller.globals.GlobalStatistics.MAX_ROS,  modeller.globals.GlobalStatistics.MAX_FI,  modeller.globals.GlobalStatistics.MAX_FL,  modeller.globals.GlobalStatistics.MAX_CFB,  modeller.globals.GlobalStatistics.MAX_CFC,  modeller.globals.GlobalStatistics.MAX_SFC,  modeller.globals.GlobalStatistics.MAX_TFC,  modeller.globals.GlobalStatistics.TOTAL_FUEL_CONSUMED,  modeller.globals.GlobalStatistics.CROWN_FUEL_CONSUMED,  modeller.globals.GlobalStatistics.SURFACE_FUEL_CONSUMED,  modeller.globals.GlobalStatistics.NUM_ACTIVE_FRONTS,  modeller.globals.GlobalStatistics.NUM_FRONTS,  modeller.globals.GlobalStatistics.MEMORY_USED_START,  modeller.globals.GlobalStatistics.MEMORY_USED_END,  modeller.globals.GlobalStatistics.NUM_TIMESTEPS,  modeller.globals.GlobalStatistics.NUM_DISPLAY_TIMESTEPS,  modeller.globals.GlobalStatistics.NUM_EVENT_TIMESTEPS,  modeller.globals.GlobalStatistics.NUM_CALC_TIMESTEPS,  modeller.globals.GlobalStatistics.PROCESSING_TIME,  modeller.globals.GlobalStatistics.GROWTH_TIME
         ]
         
        stats.forEach(s=>{
            statsFile.addColumn(s)
        })
        
        let threeDayScenarioOutputKml = prom.addOutputVectorFileToScenario(
            modeller.psaas.VectorFileType.KML,
            '3dayScenario.kml',
            scenarioStartString,
            scenarioThreeDayEndString,
            threeDayScenario);
        
        threeDayScenarioOutputKml.mergeContact = true;
        threeDayScenarioOutputKml.multPerim = true;
        threeDayScenarioOutputKml.removeIslands = true;
        threeDayScenarioOutputKml.metadata = jDefaults.metadataDefaults;
        threeDayScenarioOutputKml.shouldStream = true;
        
        //allow the file to be streamed to a remote location after it is written (ex. streamOutputToMqtt, streamOutputToGeoServer).
        
        let threeDayScenarioOutputSummary = prom.addOutputSummaryFileToScenario(threeDayScenario, "threeDaySummary.txt");
        threeDayScenarioOutputSummary.shouldStream = true;
        }
        try {
            prom.isValid()
        } catch (error) {
            console.log(error);
            process.exit();
        }



        if (prom.isValid()) {
            // console.log("Model is valid...");
            modeller.globals.PSaaSLogger.getInstance().info("The Model is VALID.");
            //  console.log(prom.inputs.ignitions);
            //start the job asynchronously
            modeller.globals.PSaaSLogger.getInstance().info("start the job asynchronously.");
            let wrapper = await prom.beginJobPromise();
            //trim the name of the newly started job
            var jobName = wrapper.name.replace(/^\s+|\s+$/g, "");
            //console.log("jobName", jobName);
            modeller.globals.PSaaSLogger.getInstance().info("We have a job number from builder:" + jobName);
            //a manager for listening for status messages
            modeller.globals.PSaaSLogger.getInstance().info("create a manager for listening for status messages.");
            let manager = new modeller.client.JobManager(jobName);
            //start the job manager
            modeller.globals.PSaaSLogger.getInstance().info("start the client job manager.");
            await manager.start();
            modeller.globals.PSaaSLogger.getInstance().info("client job manager started., waiting for job to complete...");
            //when the PSaaS job triggers that it is complete, shut down the listener
            console.log("passing job name to main code");
            // resolve({ model: prom, jobName: jobName })

            var fireModel = await { model: prom, jobName: jobName }
            modeller.globals.PSaaSLogger.getInstance().info(`Executing PSaaS Directly, ${fireModel.jobName} `);
            // shell out and run psaas
            var jobFile = await remotejobsFolder + fireModel.jobName + "/job.fgmj"
            var validateFile = await remotejobsFolder + fireModel.jobName + "/validation.json"
            var bestSummaryFile = await remotejobsFolder + fireModel.jobName + "/Outputs/bestSummary.txt"
            var worstSummaryFile = await remotejobsFolder + fireModel.jobName + "/Outputs/worstSummary.txt"
            // /usr/src/app/psaas_data/jobs/job_20210616115828573/Outputs
            var worstKml = await remotejobsFolder + fireModel.jobName + "/Outputs/worstCase.kml"
            var bestKml = await remotejobsFolder + fireModel.jobName + "/Outputs/bestCase.kml"
            // var controlKml = await remotejobsFolder + fireModel.jobName + "/Outputs/controlCase.kml"

            const shellValidateString = await `${psaasExec} --validate ${jobFile}`
            const shellOutAndValidate = (shellValidateString, validateFile) => {
                return new Promise(async (resolve, reject) => {
                    await exec(shellValidateString, async (error: Error, stdout: String, stderr: String) => {
                        if (error) {
                            modeller.globals.PSaaSLogger.getInstance().info(`error: ${error.message}`);
                            modeller.globals.PSaaSLogger.getInstance().info(`stderr: ${stderr}`);
                            resolve(false)
            
                        }
                        if (stderr) {
                            modeller.globals.PSaaSLogger.getInstance().info(`stderr: ${stderr}`);
                            //  return;
                        }
                        //  console.log(`stdout: ${stdout}`);
            
                        if (fs.existsSync(validateFile)) {
                            fs.readFile(validateFile, async (error: Error, bestData: any) => {
                                if (error) {
                                    modeller.globals.PSaaSLogger.getInstance().info(`error: ${error.message}`);
                                    resolve(false)
                                }
                                else {
                                    // console.log("bestCase:", bestData.toString());
                                    resolve(true)
                                }
                                // console.log("We are done...");
                            });
                        }
                        resolve(false)
            
            
            
            
            
                    });
                });
            }
            await shellOutAndValidate(shellValidateString,validateFile)

            



            const shellCommandString = await `${psaasExec} ${jobFile}`
            await exec(shellCommandString, async (error: Error, stdout: String, stderr: String) => {
                if (error) {
                    modeller.globals.PSaaSLogger.getInstance().info(`error: ${error.message}`);
                    resolve(false)

                }
                if (stderr) {
                    modeller.globals.PSaaSLogger.getInstance().info(`stderr: ${stderr}`);
                    //  return;
                }
                //  console.log(`stdout: ${stdout}`);
                fs.readFile(bestSummaryFile, async (error: Error, bestData: any) => {
                    if (error) {
                        modeller.globals.PSaaSLogger.getInstance().info(`error: ${error.message}`);
                        resolve(false)
                    }
                    else {
                        // console.log("bestCase:", bestData.toString());
                        fs.readFile(worstSummaryFile, async (error: Error, worstData: any) => {
                            if (error) {
                                modeller.globals.PSaaSLogger.getInstance().info(`error: ${error.message}`);
                            }
                            else {
                                //    console.log("worstCase:", worstData.toString());
                            }

                            // now lets copy the results to serve out

                            //    await fs.copyFile(bestKml, 'data/bestKml.kml', (err: Error) => {
                            //         if (err) throw err;
                            //         console.log('copied...', bestKml);
                            //     });
                            //    await fs.copyFile(worstKml, 'data/worstKml.kml', (err: Error) => {
                            //         if (err) throw err;
                            //         console.log('copied...', worstKml);
                            //     });
                            //    await fs.copyFile(controlKml, 'data/controlKml.kml', (err: Error) => {
                            //         if (err) throw err;
                            //         console.log('copied...', controlKml);
                            //     });
                            //   await  fs.copyFile(jobFile, `data/${fireModel.jobName}.fgmj`, (err: Error) => {
                            //         if (err) throw err;
                            //         console.log('copied...', jobFile);
                            //         console.log('grab it here:', `http://psaas-results.api.intellifirenwt.com/data/${fireModel.jobName}.fgmj`);
                            //     });
                            console.log("We are done...");
                            resolve({ model: prom, jobName: jobName })
                        });
                    }
                    // console.log("We are done...");
                });



            });





        } else {
            console.log("Model is NOT valid...");

            if (!prom.inputs.isValid()) {
                console.log("Inputs are not valid");
                console.log("checkValid", JSON.stringify(prom.inputs.checkValid(), null, 4));
                //  console.log(prom.inputs);
            }

            else if (!prom.outputs.isValid()) {
                console.log("Outputs are not valid");
                console.log("checkValid", JSON.stringify(prom.outputs.checkValid(), null, 4));
                console.log(prom.outputs);
            }
            else {
                console.log(prom);
            }
            resolve({ model: prom, jobName: jobName })

        }





    });
}

const manualPsaasExecution = (fireModel: any) => {
    return new Promise(async (resolve, reject) => {
        modeller.globals.PSaaSLogger.getInstance().info(`Executing PSaaS Directly, ${fireModel.jobName} `);
        // shell out and run psaas
        var jobFile = await remotejobsFolder + fireModel.jobName + "/job.fgmj"
        var bestSummaryFile = await remotejobsFolder + fireModel.jobName + "/Outputs/bestSummary.txt"
        var worstSummaryFile = await remotejobsFolder + fireModel.jobName + "/Outputs/worstSummary.txt"
        // /usr/src/app/psaas_data/jobs/job_20210616115828573/Outputs
        var worstKml = await remotejobsFolder + fireModel.jobName + "/Outputs/worstCase.kml"
        var bestKml = await remotejobsFolder + fireModel.jobName + "/Outputs/bestCase.kml"
        var controlKml = await remotejobsFolder + fireModel.jobName + "/Outputs/controlCase.kml"




        const shellCommandString = await `${psaasExec} ${jobFile}`
        await exec(shellCommandString, async (error: Error, stdout: Text, stderr: Text) => {
            if (error) {
                modeller.globals.PSaaSLogger.getInstance().info(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                modeller.globals.PSaaSLogger.getInstance().info(`stderr: ${stderr}`);
                //  return;
            }
            // console.log(`stdout: ${stdout}`);
            fs.readFile(bestSummaryFile, async (error: Error, bestData: any) => {
                if (error) {
                    modeller.globals.PSaaSLogger.getInstance().info(`error: ${error.message}`);
                }
                else {
                    console.log("bestCase:", bestData.toString());
                    fs.readFile(worstSummaryFile, async (error: Error, worstData: any) => {
                        if (error) {
                            modeller.globals.PSaaSLogger.getInstance().info(`error: ${error.message}`);
                        }
                        else {
                            console.log("worstCase:", worstData.toString());
                        }

                        // now lets copy the results to serve out

                        fs.copyFile(bestKml, 'data/bestKml.kml', (err: Error) => {
                            if (err) throw err;
                            console.log('copied...', bestKml);
                        });
                        fs.copyFile(worstKml, 'data/worstKml.kml', (err: Error) => {
                            if (err) throw err;
                            console.log('copied...', worstKml);
                        });
                        fs.copyFile(controlKml, 'data/controlKml.kml', (err: Error) => {
                            if (err) throw err;
                            console.log('copied...', controlKml);
                        });
                        fs.copyFile(jobFile, `data/${fireModel.jobName}.fgmj`, (err: Error) => {
                            if (err) throw err;
                            console.log('copied...', jobFile);
                            console.log('grab it here:', `http://psaas-results.api.intellifirenwt.com/data/${fireModel.jobName}.fgmj`);
                        });
                        console.log("We are done...");
                    });
                }
                // console.log("We are done...");
            });



        });
    });
}

const getFireGeomByFireId = fireId => {
    return new Promise((resolve, reject) => {
        //     console.log(`Getting fire info for ${fireId}`);
        let cql = "&SRS=epsg:4326&CQL_FILTER=fireid='" + fireId + "'"
        let urlGps =
            'https://geowh.vm.sparcsonline.com/geoserver/sparcs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=sparcs:current_fire_gps&maxFeatures=1&outputFormat=application/json' +
            cql
        let urlPoint = 'https://geowh.vm.sparcsonline.com/geoserver/sparcs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=sparcs:firesit_sparcsmap&maxFeatures=1&outputFormat=application/json' + cql

        sgpFetch(urlGps)
            .then(function (res) {
                return res.json()
            })
            .then(async function (gpsData) {
                // console.log('gpsData', gpsData)
                if (gpsData.totalFeatures == 1) {
                    console.log("Using fire polygon")

                    //    let bigger =  await turf.buffer(gpsData.features[0],500,'meters')
                    //    let fixed = await turf.buffer(bigger,-500,'meters')

                    resolve(gpsData)
                }
                else {
                    //cutterFetch the fire point.
                    sgpFetch(urlPoint)
                        .then(function (res) {
                            return res.json()
                        })
                        .then(function (pointData) {
                            ///    console.log('pointData', pointData)
                            if (pointData.totalFeatures == 1) {
                                console.log("Using fire point")
                                resolve(pointData)
                            }
                            else {
                                //cutterFetch the fire point.
                                reject("no fire point found")
                            }

                        })
                        .catch(error => {
                            console.error(error.stack)
                        })

                }

            })
            .catch(error => {
                console.error(error.stack)
            })
    });

}

const getCentriodFromGeom = (polygon) => {
    //  console.log("Incoming geom:", polygon);
    var centroid = turf.centroid(polygon);
    return centroid
}

const easySGP = (fireID) => {
    return new Promise(async (resolve, reject) => {
        const datasetPath = await {
            path: "/usr/src/app/psaas_data/nwt_dataset" + "/" + fireID + "/",
            bbox: "bbox.geoJson",
            lut: "dataset.lut",
            prj: "dataset.prj",
            elevation: "elevation.tif",
            fuels: "fuels.tif"
        }

        // we need:
        // (fireID: string, lat: any, lon: any, ele: any, fireGeom: any, modelDataset: any, weather: any, cffdrs: any
        const fireCollection: any = await getFireGeomByFireId(fireID)


        const fireGeom = await fireCollection.features[0]
       // console.log(fireGeom);

        if (fireGeom.geometry.type == 'Point') {
            console.log("we have point");
            var lat = await fireGeom.geometry.coordinates[1]
            var lon = await fireGeom.geometry.coordinates[0]
            var ignitionType = 'point'
        }
        else {
            console.log('we have a poly, need a centroid');

            let centroid = await getCentriodFromGeom(fireGeom)
            //  await  console.log("centroid",centroid);
            var lat = centroid.geometry.coordinates[1]
            var lon = centroid.geometry.coordinates[0]
            var ignitionType = 'poly'

        }
        let ele = 100

        //get forecast

        let weather = await spotWxService.byLatLon(lat, lon)
        // console.log("got weather",weather.records.length);
        let cffdrs = await spotWxService.getCffdrsByLatLon(lat, lon)
        
        if (cffdrs == false) {
            console.log("No CFFDRS - Using Defaults");
            cffdrs = await{  "cffdrs": { "ffmc": 85, "dmc": 6, "dc": 15 } }
            console.log("FFMC:", `${cffdrs.cffdrs.ffmc} `);
            console.log("DMC:", `${cffdrs.cffdrs.dmc} `);
            console.log("DC:", `${cffdrs.cffdrs.dc} `);
        } 
        else {
            console.log("Got CFFDRS", `${cffdrs.header.name} (${cffdrs.header.nesdis})`);
            console.log("FFMC:", `${cffdrs.cffdrs.ffmc} `);
            console.log("DMC:", `${cffdrs.cffdrs.dmc} `);
            console.log("DC:", `${cffdrs.cffdrs.dc} `);
        }
        await console.log("run the model....");
        const model = await sgpModel(fireID, lat, lon, ele, fireGeom, datasetPath, weather, cffdrs)
        await console.log("model run complete....");


        resolve({
            model: model,

            inputs: {
                fireID, lat, lon, fireGeom, datasetPath, weather, cffdrs
            }
        }
        );
    });
}

// ##################
// use this to set verbosity in the FGMJ file.
// enum Verbosity {
//     NONE = 0;
//     SEVERE = 1;
//     WARN = 2;
//     INFO = 3;
//     MAX = 4;
// }



// ####################
// use this to ttranslate status messages in status.JSON
// enum statusType {
//     /
//      * The job was submitted to the manager.
//      */
//     SUBMITTED = 0;
//     /
//      * A new job has been started. This will be the current status when Prometheus starts up.
//      */
//     STARTED = 1;
//     /
//      * A new scenario has started.
//      */
//     SCENARIO_STARTED = 2;
//     /
//      * A scenario has finished.
//      */
//     SCENARIO_COMPLETED = 3;
//     /
//      * A scenario failed to finish properly.
//      */
//     SCENARIO_FAILED = 4;
//     /
//      * The job has completed successfully.
//      */
//     COMPLETE = 5;
//     /
//      * Prometheus ended in an unexpected manner. This shouldn't be used by Prometheus, the manager will mark the job as Failed if the process
//      * is terminated without being marked as either Complete or Error.
//      */
//     FAILED = 6;
//     /
//      * An exception was caught within Prometheus and the job was terminated.
//      */
//     ERROR = 7;
//     /
//      * An informational note.
//      */
//     INFORMATION = 8;
//     /
//      * The simulation has been requested to stop.
//      */
//     SHUTDOWN_REQUESTED = 9;
// }
export { name1, /* …, */ nameN } from "spg";
exports.sgp = sgpModel
exports.easySGP = easySGP