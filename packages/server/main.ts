import Express from "express";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { ThermoData } from "./src/types";
import dotenv from "dotenv";
dotenv.config();


const app = Express();
const influx = new InfluxDB({ url: process.env.INFLUX_URL ?? "http://localhost:8086", token: process.env.INFLUX_TOKEN });
const PORT = 3000;
let IntervalTime = 2000;
const sendDataLimit = 1000;

let data: ThermoData[] = [];
let prevWriteTime: number = 0;

app.use("/", (req, res, next) => {
    console.log(req.method, req.url, req.ip);
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
})

app.get("/", (req, res) => {
    res.send("Hello World!");
});


const writeData = async (newData: ThermoData) => {
    const now = Date.now();
    data.push(newData);
    if (now - prevWriteTime > 10000) {
        prevWriteTime = now;
        const writeApi = influx.getWriteApi(process.env.INFLUX_ORG ?? "", process.env.INFLUX_BUCKET ?? "");
        writeApi.useDefaultTags({ host: "server" });
        const point = new Point("thermo").floatField("temperature", newData.temperature).floatField("humidity", newData.humidity).floatField("pressure", newData.pressure);
        writeApi.writePoint(point);
        await writeApi.close();
    }
    // 2 sec * 900 = 30 minutes
    if (data.length > 900) {
        data.shift();
    }
}


app.get("/get", (req, res) => {
    const scale = Number(req.query.scale);
    if (isNaN(scale)) {
        res.send({
            success: true,
            data :data,
        });
        return;
    }
    const query = `
    from(bucket: "${process.env.INFLUX_BUCKET ?? ""}")
    |> range(start: -${scale}h)
    |> filter(fn: (r) => r["_measurement"] == "thermo")
    |> filter(fn: (r) => r["_field"] == "humidity" or r["_field"] == "pressure" or r["_field"] == "temperature")
    |> filter(fn: (r) => r["host"] == "server")
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> keep(columns: ["_time","humidity","pressure","temperature"])
    `
    let send_data: ThermoData[] = [];
    influx.getQueryApi(process.env.INFLUX_ORG ?? "").queryRows(query, {
        next: (row, tableMeta) => {
            const o = tableMeta.toObject(row);
            send_data.push({
                time: o._time,
                temperature: o.temperature,
                humidity: o.humidity,
                pressure: o.pressure,
            })
        },
        error: (error) => {
            console.error(error);
            res.send({
                success: false,
                data: [],
            });
        },
        complete: () => {
            if(send_data.length > sendDataLimit){
                const interval = Math.floor(send_data.length / sendDataLimit);
                send_data = send_data.filter((_,index) => index % interval == 0);
            }
            res.send({
                success: true,
                data:send_data,
            });
        },
    });
})


// post?temperature=30.0&humidity=50&pressure=10000
app.get("/post", (req, res) => {
    const time = Date.now();
    const temperature = Number(req.query.temperature);
    const humidity = Number(req.query.humidity);
    const pressure = Number(req.query.pressure);
    if (!(isNaN(temperature) || isNaN(humidity) || isNaN(pressure))) {
        const newData: ThermoData = {
            time,
            temperature,
            humidity,
            pressure,
        };
        writeData(newData);
        res.send({
            success: true,
            interval: IntervalTime,
        })
    }
    else {
        res.send({
            success: false,
            interval: 300,
        })
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`)
});