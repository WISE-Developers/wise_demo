const models = {};
const sgpNtFetch = require('node-fetch')
const getFireList = () => {
    return new Promise((resolve, reject) => {
        console.log("Executing getFireList()");

        const allFiresUrl = 'https://geowh.vm.sparcsonline.com/geoserver/sparcs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=sparcs:firesit_sparcsmap&maxFeatures=1000&outputFormat=application/json&SRS=epsg:4326'
        
        sgpNtFetch(allFiresUrl)
            .then(function (res) {
                return res.json()
            })
            .then(function (fireData) {
                //console.log('fireData', fireData)
                
                let fires = fireData.features

                console.log("Total Fires:", fires.length);
                // fires.map(f=>{
                //     console.log(f.properties);
                // })

                const liveFires: [] = fires.filter(f => f.properties.status !== 'DO')
                console.log("Active Fires:", liveFires.length);
                resolve(liveFires)

            })
            .catch(error => {
                console.error(error.stack)
            })





    });
}

(async function () {
        const ntModeler = require("./sgp")


        console.clear();
        

        console.time("Sequential Modelling Complete.")
        var fireList: any = await getFireList();
        // fireList.length = 10
        // console.log("using a 10 fire sample of full feed.");
        let totalToModel = fireList.length
        let currentModel = 1
        console.log(`Modelling ${totalToModel} fires Sequentially`)
        for (const liveFire of fireList) {

           const liveFireId = await liveFire.properties.fireid
           await console.log("=====================================================");
           await console.log(`Modelling ${liveFireId} (${currentModel} of ${totalToModel})`);
           models[liveFireId] =  await  ntModeler.easySGP(liveFireId)
           await console.log(`COMPLETE: ${liveFireId} (${currentModel} of ${totalToModel})`);
           currentModel++
        }
      // console.log(JSON.stringify(models[0],null,4))

       // cleanup the results.

       // get all job folders

       // process outputs

       // archive the jobs
       console.timeEnd("Sequential Modelling Complete.")
        process.exit()
    })();