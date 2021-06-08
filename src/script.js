const age = 18;
const requiredDoses = 1;
let date = new Date().toString('dd-MM-yyyy');
const district_id = 589; // (jagtial: 584, Karimnagar: 589)
// district id can be found here: https://github.com/bhattbhavesh91/cowin-vaccination-slot-availability/blob/main/district_mapping.csv
// change above values to see output in browser

function loadData() {
    document.getElementById("filter").innerHTML = '<label>District Id : </label>'+
    '<select id="district_id" name="district_id" onchange="valueSelected()">'+
        '<option value="589"' + (localStorage.getItem('district_id')=="589"?'selected':'') + '>Karimnagar</option>'+
        '<option value="584"' + (localStorage.getItem('district_id')=="584"?'selected':'') + '>Jagityal</option>'+
    '</select>'
}

let run = true;
async function getdata() {
    if(!localStorage.getItem("district_id")) {
        localStorage.setItem("district_id",district_id);
    }
    // console.log("Running")
    date = new Date().toString('dd-MM-yyyy');
    let abc = await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${localStorage.getItem("district_id")}&date=${date}`)

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

        // play notificiation sound - reference: https://github.com/goldfire/howler.js/
        // sound source: https://notificationsounds.com/notification-sounds/goes-without-saying-608
        var sound = new Howl({
            // src: ['goes-without-saying-608.mp3']
            src: ['alarm-buzzer-407.mp3']
        });

        var id1 = sound.play();
        sound.fade(0, 1, 5000, id1);
        // console.log("ABC")

        // // in the js code unmute the audio once the event happened
        // document.getElementById('notificationAudio').muted = false;
        // document.getElementById('notificationAudio').play();

        await new Promise(resolve => setTimeout(resolve, 10000)); // 3 sec

        alert("Dose Available")
        run = true;
    }

}

getdata();
async function repeat() {
    if (run)
        await getdata()
}
setInterval(repeat, 1000 * 60 * 2);

function valueSelected() {
    localStorage.setItem("district_id",document.forms["filter"]['district_id'].value);
    window.location.reload();
}