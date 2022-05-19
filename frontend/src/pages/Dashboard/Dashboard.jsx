import React, { useState, useEffect } from "react";
import "../../styles/Dashboard.css";
import CircleLoader from "./components/CircleLoader";
import HistChart from "./components/Hist_chart";
import CompoChart from "./components/CompoChart";
import Table_balance from "./components/Table_balance";
import Total_balance from "./components/Total_balance";
import Select from "./components/Select_bar";
import axios from "axios";

function Balances() {
  let [status, setStatus] = useState(0);
  let [total_usd, setTotalUsdValue] = useState(0);
  let [balances, setBalances] = useState([]);
  let [composition, setComposition] = useState([]);
  let [histo, setHisto] = useState([]);
  let [select_device, setDevice] = useState(0);

  function getBalance() {
    axios.get("http://localhost:3000/api/balance").then((response) => {
      console.log(response);
      setTotalUsdValue(response.data.total_usd);
      setBalances(response.data.balances);
      setComposition(response.data.composition);
      axios.get("http://localhost:3000/api/histo").then((hist) => {
        setHisto(hist.data);
      });
      setStatus(1);
    });
  }

  useEffect(() => {
    getBalance();
  }, []);

  return (
    <span>
      {status === 0 ? (
        <div className="circle">
          <CircleLoader />
        </div>
      ) : (
        <div className="Dashboard">
          <div className="balance">
            <Table_balance balances={balances} />
          </div>
          <CompoChart series={composition} />
          <div className="total_usd">
            <Total_balance balance_total={total_usd} histo={histo} />
          </div>
          <div className="hist">
            <HistChart histo={histo} select_value={select_device} />
          </div>
          <div className="select_slide">
            <Select selFct={setDevice} />
          </div>
        </div>
      )}
    </span>
  );
}
export default Balances;
