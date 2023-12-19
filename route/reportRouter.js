import express from "express";
import moment from "moment";
import query from "../mysql-connect";

const router = express.Router();

router.get("/", async function (req, res) {
  let channel = "channel";
  let nowDate = moment(new Date()).add(-0, "days").format("YYYY-MM-DD HH:mm:ss");
  console.log(nowDate);
  res.render("report", {
    channel,
  });
});

router.post("/", async function (req, res) {
  let begin_date = req.body.begin_date;
  let end_date = req.body.end_date;

  let stockData1 = await query(`SELECT DATE_FORMAT(date,'%Y-%m-%d') AS time, col1, col2,col3,col4 FROM crawler.stock WHERE date BETWEEN ? AND ?`, [
    begin_date,
    end_date,
  ]);

  let stockData2 = await query(`SELECT DATE_FORMAT(date,'%Y-%m-%d') AS time, col5,col6,col7,col8 FROM crawler.stock WHERE date BETWEEN ? AND ?`, [
    begin_date,
    end_date,
  ]);

  let stockTotalData = await query(`SELECT DATE_FORMAT(date,'%Y-%m-%d') AS time, col1, col2,col3,col4,col5,col6,col7,col8 FROM crawler.stock WHERE date BETWEEN ? AND ?`, [
    begin_date,
    end_date,
  ]);
  res.send(
    JSON.stringify({
      stockData1: stockData1,
      stockData2: stockData2,
      stockTotalData: stockTotalData,
    })
  );
});

// test()
async function test() {
  let begin_date = "2023-12-12";
  let end_date = "2023-12-13";
  let report = await query(`SELECT * FROM crawler.stock WHERE date BETWEEN ? AND ?`, [begin_date, end_date]);
  console.log(report);
}

export default router;
