const age = 18;
const requiredDoses = 1;
const date = new Date().toString('dd-MM-yyyy');
const district_id = 584;
// district id can be found here: https://github.com/bhattbhavesh91/cowin-vaccination-slot-availability/blob/main/district_mapping.csv
// change above values to see output in browser

let run = true;
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

    // console.log(onlyData18And1stDoseFilter)
    let div = document.getElementById("table");
    div.innerHTML = "";

    if (onlyData18And1stDoseFilter.length > 0) {

        onlyData18And1stDoseFilter.forEach(data => {
            let sessLen = data.sessions.length;
            div.innerHTML +=
                `
            <tr>
            <td rowspan="${sessLen}">${data.name}</td>
            <td rowspan="${sessLen}">${data.district_name}</td>
            <td>${data.sessions[0].date}</td>
            <td>${data.sessions[0].available_capacity_dose1}</td>
            <td>${data.sessions[0].slots.join("<br> <br>")}</td>
        </tr>

            `

            if (sessLen > 1) {
                for (i = 1; i < sessLen; i++) {

                    div.innerHTML +=
                        `
                    <tr>
                    <td>${data.sessions[i].date}</td>
                    <td>${data.sessions[i].available_capacity_dose1}</td>
                    <td>${data.sessions[i].slots.join("<br> <br>")}</td>
                </tr>
            
            `

                }
            }
        })

        run = false;
        alert("Dose Available")
        run = true;
    }

}

getdata();
async function repeat() {
    if (run)
        await getdata()
}
setInterval(repeat, 1000 * 60 * 5);

