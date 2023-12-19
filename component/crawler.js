import axios from "axios";
import cheerio from "cheerio";
import moment from "moment";
import query from "../mysql-connect";

// getStock();
export async function getStock() {
  const dateFormat = "YYYY/MM/DD";
  // const dates = [...Array(100).keys()].map((_, i) => moment().subtract(i + 1081, "days"));
  const dates = [...Array(1).keys()].map((_, i) => moment().subtract(i, "days"));
  let getData = [];
  for (const date of dates) {
    const formattedDate = moment(date).format(dateFormat);
    // POST 請求的數據
    const postData1 = {
      queryDate: formattedDate,
      queryType: "",
    };

    const response1 = await axios.post("https://www.taifex.com.tw/cht/3/callsAndPutsDate", postData1, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response1.data;
    const $ = cheerio.load(data);

    // 輔助函數，用於解析數字，如果是 NaN 則返回 0
    function parseNumber(selector) {
      const numberString = $(selector).text().trim().replace(/,/g, "");
      const number = parseInt(numberString, 10);
      return isNaN(number) ? 0 : number;
    }

    // 使用輔助函數獲取數字
    const number1 = parseNumber(
      "#printhere > div:nth-child(4) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(12)"
    );
    const number2 = parseNumber(
      "#printhere > div:nth-child(4) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(7) > td:nth-child(10)"
    );
    const number3 = parseNumber(
      "#printhere > div:nth-child(4) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(14)"
    );
    const number4 = parseNumber(
      "#printhere > div:nth-child(4) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(7) > td:nth-child(12)"
    );

    const postData2 = {
      queryDate: formattedDate,
      contractId: "TX",
    };

    const response2 = await axios.post("https://www.taifex.com.tw/cht/3/largeTraderFutQry", postData2, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const data2 = response2.data;
    const $2 = cheerio.load(data2);

    function parseNumber2(selector) {
      let content = $2(selector).html();

      // 如果 content 為 null，則直接返回 0
      if (content === null) {
        return 0;
      }

      const regex = /\(([^)]+)\)/; // 新增：正則表達式用於提取括號內的數字
      const matches = content.match(regex);
      const numberString = matches ? matches[1].replace(/,/g, "") : ""; // 使用正則表達式提取的數字

      const number = parseInt(numberString, 10);
      return isNaN(number) ? 0 : number;
    }

    const number5 = parseNumber2(
      "#printhere > div:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(6) > td:nth-child(4) > div"
    );
    const number6 = parseNumber2(
      "#printhere > div:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(6) > td:nth-child(8) > div"
    );

    getData.push([
      formattedDate,
      number1,
      number2,
      number3,
      number4,
      number1 - number2,
      -number3 + number4,
      number1 + number4 - number2 - number3,
      number5 - number6,
    ]);
  }
  const data = await query("INSERT INTO crawler.stock VALUES ?", [getData]);
  await query("DELETE FROM crawler.stock WHERE col1 = 0");
  console.log(data);
  console.log(getData);
}

// updateData();
async function updateData() {
  const dateFormat = "YYYY/MM/DD";
  const dates = [...Array(180).keys()].map((_, i) => moment().subtract(i + 1, "days"));
  let getData = [];
  for (const date of dates) {
    const formattedDate = moment(date).format(dateFormat);
    // POST 請求的數據

    // 使用 URL 编码格式化 POST 数据
    const postData = {
      queryDate: formattedDate,
      contractId: "TX",
    };

    const response2 = await axios.post("https://www.taifex.com.tw/cht/3/largeTraderFutQry", postData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const data2 = response2.data;
    const $2 = cheerio.load(data2);

    function parseNumber2(selector) {
      let content = $2(selector).html();

      // 如果 content 为 null，则直接返回 0
      if (content === null) {
        return 0;
      }

      const numberString = content.split("<br>")[0].trim().replace(/,/g, "");
      const number = parseInt(numberString, 10);
      return isNaN(number) ? 0 : number;
    }

    const number5 = parseNumber2(
      "#printhere > div:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(6) > td:nth-child(4) > div"
    );
    const number6 = parseNumber2(
      "#printhere > div:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(6) > td:nth-child(8) > div"
    );

    getData.push([number5, number6, formattedDate]);
  }

  console.log(getData);
  for (const data of getData) {
    const data2 = await query(`UPDATE crawler.stock SET col5 = ?,col6 = ? WHERE date = ?`, [data[0], data[1], data[2]]);
  }
  console.log("done");
}
