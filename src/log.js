// const age = 18;
// const requiredDoses = 1;
// const date = new Date().toString('dd-MM-yyyy');
// const district_id = 584;
// // district id can be found here: https://github.com/bhattbhavesh91/cowin-vaccination-slot-availability/blob/main/district_mapping.csv
// // change above values to see output in browser

// // let run = true;
async function getdata() {
    let abc = await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${date}`)

    let response = await abc.json();
    let data18exists = response.centers.filter(x => x.sessions.filter(y => y.min_age_limit == age).length)
    let onlyData18And1stDose = data18exists.map((el) => {
        el.sessions = el.sessions.filter(y =>
            y.min_age_limit == age && y.available_capacity_dose1 >= requiredDoses
        );
        return el;
    });
    let onlyData18And1stDoseFilter = onlyData18And1stDose.filter(x => x.sessions.length);

    let jsonExport = { List: [] }

    let checkAvailability = onlyData18And1stDoseFilter.length > 0 ? "Available" : "Not Available";

    onlyData18And1stDoseFilter.forEach(data => {
        let sessLen = data.sessions.length;
        let hospital = {
            Name: data.name,
            District: data.district_name
        }

        let session = {
            ...hospital,
            ...{
                Date: data.sessions[0].date,
                Doses: data.sessions[0].available_capacity_dose1
            }
        }

        jsonExport.List.push(session);

        if (sessLen > 1) {
            for (i = 1; i < sessLen; i++) {
                session = {
                    ...hospital,
                    ...{
                        Date: data.sessions[i].date,
                        Doses: data.sessions[i].available_capacity_dose1
                    }
                }

                jsonExport.List.push(session);

            }
        }
    })


    var fileContent = JSON.stringify(jsonExport, undefined, 4);
    var bb = new Blob([fileContent], { type: 'application/json' });
    var a = document.createElement('a');
    a.download = `cowinAPI_log - ${checkAvailability} - ${new Date().toLocaleString()}.json`;
    a.href = window.URL.createObjectURL(bb);
    a.click();

}

getdata();
async function repeat() {
    await getdata()
}
setInterval(repeat, 1000 * 60 * 5);

