import * as WebBrowser from "expo-web-browser";
import * as moment from "moment";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Text,
  TouchableNativeFeedback,
  Picker,
} from "react-native";
import { Icon, Overlay, Card } from "react-native-elements";
import Constants from "expo-constants";

import axios from "axios";
import socket from "../socketConnection";

export default function HomeScreen() {
  async function getIndexData(symbol = "DJI") {
    const index = await axios.get(
      // `https://still-atoll-20317.herokuapp.com/marketData/${symbol}`
      `http://192.168.0.22:8080/marketData/${symbol}`
    );
    // setIsLoading(false);
    return index;
  }

  async function getHistoricalData(symbol) {
    const historyData = await axios.get(
      `http://192.168.0.22:8080/marketData/${symbol}`
    );
    return historyData;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [historyData, setHistoryData] = useState({});
  const [openSymbol, setOpenSymbol] = useState("");
  const [symbolList, setSymbolList] = useState([]);
  const [data, setData] = useState({});

  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    socket.emit("updateList", symbolList);
    socket.emit("getLiveData");
    socket.on("liveData", (res) => {
      setData(res);
      setIsLoading(false);
    });
    socket.on("liveHistoricalData", (res) => {
      console.log("historyDataaaa");
      setHistoricalData(res);
    });

    return () => {
      socket.off("liveData");
      socket.off("liveHistoricalData");
    };
  }, []);

  const idxSymbols = {
    "FTSE 100": "FTSE",
    "DOW JONES AVG": "DJI",
    NASDAQ: "IXIC",
    "XETRA DAX": "GDAXI",
    "PARIS CAC 40": "FCHI",
    "NIKKEI 225": "N225",
    "HANG SENG": "HSI",
  };

  function handleSubmit() {
    if (!symbolList.includes(symbol)) {
      setIsLoading(true);
      let newList = [...symbolList];
      newList.push(symbol);
      setSymbolList(newList);
    }
  }

  function handleOpenOverlay(symbol) {
    setOpenSymbol(symbol);
  }

  useEffect(() => {
    if (openSymbol !== "") {
      socket.emit("updateOpenModal", idxSymbols[openSymbol]);
    }
  }, [openSymbol]);

  useEffect(() => {
    Object.keys(data).forEach((idxName) => {
      let newHistoryData = { ...historyData };
      if (newHistoryData[idxName]) {
        newHistoryData[idxName] = [...newHistoryData[idxName], data[idxName]];
      } else {
        newHistoryData[idxName] = [data[idxName]];
      }
      setHistoryData(newHistoryData);
    });
  }, [data]);

  useEffect(() => {
    if (symbol) {
      socket.emit("updateList", symbolList);
    }
  }, [symbolList]);
  console.log(historicalData);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          Object.keys(data).map((d) => (
            <TouchableNativeFeedback
              useForeground
              onPress={() => handleOpenOverlay(d)}
              key={d}
            >
              <View>
                <Overlay
                  isVisible={!!openSymbol}
                  onBackdropPress={() => setOpenSymbol("")}
                >
                  <View style={{ flex: 1 }}>
                    <ScrollView>
                      {openSymbol && (
                        <View>
                          <Text style={styles.titleStyle}>
                            {data[openSymbol].name}
                          </Text>
                          <Text style={styles.titleStyle}>
                            {data[openSymbol].price}
                          </Text>
                          <Text style={styles.titleStyle}>
                            {`${data[openSymbol].change} (${data[openSymbol].changesPercentage}%)`}
                          </Text>
                          <Text style={styles.titleStyle}>
                            Day Low: {data[openSymbol].dayLow}
                          </Text>
                          <Text style={styles.titleStyle}>
                            Day High: {data[openSymbol].dayHigh}
                          </Text>
                          <Text style={styles.titleStyle}>
                            Year Low: {data[openSymbol].yearLow}
                          </Text>
                          <Text style={styles.titleStyle}>
                            Year High: {data[openSymbol].yearHigh}
                          </Text>
                          <Text style={styles.titleStyle}>
                            Open: {data[openSymbol].open}
                          </Text>
                          <Text style={styles.titleStyle}>
                            Prev Close: {data[openSymbol].previousClose}
                          </Text>
                          <Text style={styles.titleStyle}>
                            Last Updated:{" "}
                            {moment
                              .unix(data[openSymbol].timestamp)
                              .format("MMMM Do YYYY, h:mm:ss a")}
                          </Text>
                          <Card>
                            <Text>{historicalData.length}</Text>
                          </Card>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </Overlay>

                <Card key={d} title={d} titleStyle={styles.titleStyle}>
                  <Text>{data[d].price}</Text>
                  <Text>{`${data[d].change} (${data[d].changesPercentage}%)`}</Text>
                </Card>
              </View>
            </TouchableNativeFeedback>
          ))
        )}
      </ScrollView>

      <View style={{ backgroundColor: "#fff", flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Picker
            selectedValue={symbol}
            onValueChange={(itemValue, itemIndex) => setSymbol(itemValue)}
          >
            {Object.keys(idxSymbols).map((idxName) => (
              <Picker.Item
                key={idxName}
                label={idxName}
                value={idxSymbols[idxName]}
              />
            ))}
          </Picker>
        </View>
        <Icon
          reverse
          name="done"
          type="material"
          color="#517fa4"
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  scrollView: {},
  titleStyle: {
    fontSize: 18,
    textAlign: "left",
  },

  textPriceDown: {
    color: "red",
  },
  textPriceUp: {
    color: "blue",
  },
});
