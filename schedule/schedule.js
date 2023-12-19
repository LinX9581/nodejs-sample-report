import schedule from "node-schedule";
import { exec } from 'child_process';
import { promisify } from 'util';
import query from '../mysql-connect'
import moment from 'moment'
import * as crawler from '../component/crawler'

const execProm = promisify(exec);

// test()
async function test(){
  let stockData = await crawler.getStock();
  console.log(stockData)
}

schedule.scheduleJob("0 1 15 * * *", async function () {
  try {
    let stockData = await crawler.getStock();
  } catch (error) {
    console.log(error);
  }
});
