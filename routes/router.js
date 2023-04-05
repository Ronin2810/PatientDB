const express = require("express");
const router = express.Router();
const patient_schema = require("../models/patient");

router.get("/", (req, res) => {
    res.render("home", { msg: "" });
});
router.get("/create", (req, res) => {
    res.render("create");
});
router.get("/reentry", (req, res) => {
    res.render("reentry");
});

class Patient {
    constructor(name, date, sym, med, bill, due) {
        this.name = name;
        this.date = date;
        this.sym = sym;
        this.med = med;
        this.bill = bill;
        this.due = due;
    }
}

router.get("/read", (req, res) => {
    const result = patient_schema.find({}, { pname: 1, diagnosis: 1 })
        .then((result) => {
            // console.log(result);
            // res.send(result)
            let patient_arr = [];
            // console.log(result[3]);
            for (let i = 0; i < result.length; i++) {
                const tp = result[i];
                // console.log(tp["diagnosis"]);
                const tp1 = result[i].diagnosis;
                // console.log(tp1);
                for (let j = 0; j < tp1.length; j++) {
                    const tp2 = new Patient(tp.pname, tp1[j].date, tp1[j].symptoms, tp1[j].meds, tp1[j].bill, tp1[j].due);
                    patient_arr.push(tp2);
                }
            }
            // console.log(patient_arr);
            res.render('read', { patients: patient_arr })

        })
        .catch((err) => {
            console.log(err);
        })
});
router.get("/update", (req, res) => {
    res.render("update");
});

router.post("/home_create", (req, res) => {
    const { pname, gender, page, pno, pemail, ptype, sym, meds, bill, due } =
        req.body;

    // Do error handling here : if patient already exists redirect to re-entry page

    let ts = Date.now();

    let date_time = new Date(ts);
    let date = date_time.getDate();
    let month = date_time.getMonth() + 1;
    let year = date_time.getFullYear();
    let tp = `${date}-${month}-${year}`;
    const d1 = {
        date: tp,
        symptoms: sym,
        meds: meds,
        bill: Number(bill),
        due: Number(due)
    };

    const data = new patient_schema({
        pname: pname,
        gender: gender,
        page: page,
        pno: pno,
        email: pemail,
        ptype: ptype,
        diagnosis: [d1],
        totaldue: due,
    });

    data
        .save()
        .then(() => {
            res.render("home", { msg: "Data Entry Successful" });
        })
        .catch((err) => {
            console.log(err);
        });
});
router.post("/home_reentry", async (req, res) => {
    const { pnamere, sym, meds, bill, due } = req.body;
    const user = await patient_schema.findOne({ "pname": pnamere })
    console.log(user);
    let ts = Date.now();
    let date_time = new Date(ts);
    let date = date_time.getDate();
    let month = date_time.getMonth() + 1;
    let year = date_time.getFullYear();
    let tp = `${date}-${month}-${year}`;

    const data = {
        date: tp,
        symptoms: sym,
        meds: meds,
        bill: Number(bill),
        due: Number(due),
    };
    patient_schema
        .updateOne({ pname: pnamere }, { $push: { diagnosis: data } })
        .then(() => {
            let total = Number(Number(due) + Number(user.totaldue))
            patient_schema.updateOne({ pname: pnamere }, { $set: { totaldue: total } })
                .then(() => {
                    res.render("home", { msg: "Data Re-entry Successful" });
                })
                .catch((err) => {
                    console.log(err);
                })
        })
        .catch((err) => {
            console.log(err);
        });
});

router.post('/search', (req, res) => {
    const { ptype, pdate, pname } = req.body
    let newD = pdate.split('-').map(n => {
        return parseInt(n)
    }).join('-')
    newD = newD.split('-').reverse().join('-')

    if (pname == "" && ptype == "none" && pdate == "") {
        res.send("No Input given ... Try Again")
    }
    else if (pname == "" && ptype == "none") {
        // res.send("fakt date")
        const result = patient_schema.find({ "diagnosis.date": newD }, { pname: 1, diagnosis: 1 })
            .then((result) => {
                let patient_arr = [];
                for (let i = 0; i < result.length; i++) {
                    const tp = result[i];
                    const tp1 = result[i].diagnosis;
                    for (let j = 0; j < tp1.length; j++) {
                        const tp2 = new Patient(tp.pname, tp1[j].date, tp1[j].symptoms, tp1[j].meds, tp1[j].bill, tp1[j].due);
                        patient_arr.push(tp2);
                    }
                }
                res.render('read', { patients: patient_arr })
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else if (pname == "" && pdate == "") {
        // ("fakt type")
        const result = patient_schema.find({ ptype: ptype }, { pname: 1, diagnosis: 1 })
            .then((result) => {
                let patient_arr = [];
                for (let i = 0; i < result.length; i++) {
                    const tp = result[i];
                    const tp1 = result[i].diagnosis;
                    for (let j = 0; j < tp1.length; j++) {
                        const tp2 = new Patient(tp.pname, tp1[j].date, tp1[j].symptoms, tp1[j].meds, tp1[j].bill, tp1[j].due);
                        patient_arr.push(tp2);
                    }
                }
                res.render('read', { patients: patient_arr })
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else if (pdate == "" && ptype == "none") {
        // res.send("fakt name")
        const result = patient_schema.find({ pname: pname }, { pname: 1, diagnosis: 1 })
            .then((result) => {
                let patient_arr = [];
                for (let i = 0; i < result.length; i++) {
                    const tp = result[i];
                    const tp1 = result[i].diagnosis;
                    for (let j = 0; j < tp1.length; j++) {
                        const tp2 = new Patient(tp.pname, tp1[j].date, tp1[j].symptoms, tp1[j].meds, tp1[j].bill, tp1[j].due);
                        patient_arr.push(tp2);
                    }
                }
                res.render('read', { patients: patient_arr })
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else if (pname == "") {
        // res.send("date and type")
        const result = patient_schema.find({ "diagnosis.date": newD, ptype: ptype }, { pname: 1, diagnosis: 1 })
            .then((result) => {
                let patient_arr = [];
                for (let i = 0; i < result.length; i++) {
                    const tp = result[i];
                    const tp1 = result[i].diagnosis;
                    for (let j = 0; j < tp1.length; j++) {
                        const tp2 = new Patient(tp.pname, tp1[j].date, tp1[j].symptoms, tp1[j].meds, tp1[j].bill, tp1[j].due);
                        patient_arr.push(tp2);
                    }
                }
                res.render('read', { patients: patient_arr })
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else if (ptype == "none") {
        res.send("date and name")
        const result = patient_schema.find({ pname: pname, "diagnosis.date": newD }, { pname: 1, diagnosis: 1 })
            .then((result) => {
                let patient_arr = [];
                for (let i = 0; i < result.length; i++) {
                    const tp = result[i];
                    const tp1 = result[i].diagnosis;
                    for (let j = 0; j < tp1.length; j++) {
                        const tp2 = new Patient(tp.pname, tp1[j].date, tp1[j].symptoms, tp1[j].meds, tp1[j].bill, tp1[j].due);
                        patient_arr.push(tp2);
                    }
                }
                res.render('read', { patients: patient_arr })
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else if (pdate == "") {
        // res.send("type and name")
        const result = patient_schema.find({ pname: pname, ptype: ptype }, { pname: 1, diagnosis: 1 })
            .then((result) => {
                let patient_arr = [];
                for (let i = 0; i < result.length; i++) {
                    const tp = result[i];
                    const tp1 = result[i].diagnosis;
                    for (let j = 0; j < tp1.length; j++) {
                        const tp2 = new Patient(tp.pname, tp1[j].date, tp1[j].symptoms, tp1[j].meds, tp1[j].bill, tp1[j].due);
                        patient_arr.push(tp2);
                    }
                }
                res.render('read', { patients: patient_arr })
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else {
        const result = patient_schema.find({ pname: pname, ptype: ptype, "diagnosis.date": newD }, { pname: 1, diagnosis: 1 })
            .then((result) => {
                let patient_arr = [];
                for (let i = 0; i < result.length; i++) {
                    const tp = result[i];
                    const tp1 = result[i].diagnosis;
                    for (let j = 0; j < tp1.length; j++) {
                        const tp2 = new Patient(tp.pname, tp1[j].date, tp1[j].symptoms, tp1[j].meds, tp1[j].bill, tp1[j].due);
                        patient_arr.push(tp2);
                    }
                }
                res.render('read', { patients: patient_arr })
            })
            .catch((err) => {
                console.log(err);
            })
    }
})


module.exports = router;
