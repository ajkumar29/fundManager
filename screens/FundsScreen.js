import * as WebBrowser from "expo-web-browser";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Text,
  TouchableNativeFeedback,
} from "react-native";
import { Input, Icon, Overlay, Card, ListItem } from "react-native-elements";
import Constants from "expo-constants";

import axios from "axios";

export default function FundScreen() {
  const [fundUrl, setFundUrl] = useState("");
  const [urlList, setUrlList] = useState([]);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [openFund, setOpenFund] = useState({});

  async function getFund(link) {
    setFundUrl("");
    const fund = await axios("https://still-atoll-20317.herokuapp.com/fund", {
      headers: {
        Link: link,
      },
    });
    setIsLoading(false);
    return fund;
  }

  //intentially made to return a promise as it is resolved using Promise.all in the useEffect hook below
  function getStock(link) {
    const stock = axios("https://still-atoll-20317.herokuapp.com/stock", {
      headers: {
        Link: link,
      },
    });
    return stock;
  }

  async function getUserData() {
    const userData = await axios(
      "https://still-atoll-20317.herokuapp.com/fundDB"
    );
    return userData.data;
  }

  function handleChange(textValue) {
    setFundUrl(textValue);
  }

  function handleSubmit() {
    if (fundUrl.trim() !== "" && !urlList.includes(fundUrl)) {
      setIsLoading(true);
      const newList = [...urlList];
      newList.push(fundUrl);
      setUrlList(newList);
    } else {
      setFundUrl("");
    }
  }

  useEffect(() => {
    if (Object.keys(openFund).length > 0) {
      const { holdings } = openFund;
      let stocks = [];
      //to make useEffect async, you need to create a private async function and call it within useEffect
      //
      let promises = [];
      async function fetchStocks() {
        Object.keys(holdings).forEach((holding) => {
          const { weight, linkToStockPage } = holdings[holding];
          if (linkToStockPage !== "None") {
            promises.push(
              getStock(linkToStockPage).then((response) => {
                return { weight, name: holding, result: response };
              })
            );
          } else {
            stocks.push({ weight, name: holding, change: "URL Not present" });
          }
        });
        const res = await Promise.all(promises);
        for (let r in res) {
          const { weight, result } = res[r];
          const { name, change, changeDirection } = result.data;
          stocks.push({ weight, name, change, changeDirection });
        }
        setStockData(stocks);
        setStockLoading(false);
      }
      fetchStocks();
    }
  }, [openFund]);

  useEffect(() => {
    if (fundUrl !== "") {
      getFund(fundUrl)
        .then((res) => {
          let newData = [...data];
          newData.push({ ...res.data });
          setData(newData);
        })
        .catch((err) => console.log(err));
    }
  }, [urlList]);

  function handleOverlayOpen(fund) {
    setOpenFund(fund);
    setStockLoading(true);
  }

  useEffect(() => {
    getUserData()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }, []);

  const renderChangeText = (changeDirection, change) => {
    if (change !== "URL Not present") {
      if (change == "No change") {
        return change;
      } else {
        return changeDirection + change;
      }
    } else {
      return "No data";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          data.map((d, i) => (
            <TouchableNativeFeedback
              useForeground
              onPress={() => handleOverlayOpen(d)}
              key={i}
            >
              <View>
                <Overlay
                  isVisible={Object.keys(openFund).length !== 0}
                  onBackdropPress={() => setOpenFund({})}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.titleStyle}>Top 10 Holdings</Text>
                    <ScrollView>
                      {stockLoading ? (
                        <ActivityIndicator size="large" color="#00ff00" />
                      ) : (
                        stockData.map((stock, i) => (
                          <ListItem
                            key={i}
                            title={stock.name}
                            subtitle={
                              <View>
                                <Text>Weight: {stock.weight}</Text>
                                <Text
                                  style={
                                    stock.changeDirection === "-"
                                      ? styles.textPriceDown
                                      : styles.textPriceUp
                                  }
                                >
                                  Change:{" "}
                                  {renderChangeText(
                                    stock.changeDirection,
                                    stock.change
                                  )}
                                </Text>
                              </View>
                            }
                            bottomDivider
                          />
                        ))
                      )}
                    </ScrollView>
                  </View>
                </Overlay>
                <Card title={d.name} titleStyle={styles.titleStyle}>
                  <Text
                    style={
                      d.changeDirection === "-"
                        ? styles.textPriceDown
                        : styles.textPriceUp
                    }
                  >
                    Buy Price: {d.buyPrice}
                  </Text>
                  <Text
                    style={
                      d.changeDirection === "-"
                        ? styles.textPriceDown
                        : styles.textPriceUp
                    }
                  >
                    {`Change: ${d.changeDirection}${d.changeP} (${d.changeDirection}${d.changePc})`}
                  </Text>
                </Card>
              </View>
            </TouchableNativeFeedback>
          ))
        )}
      </ScrollView>
      <View style={{ backgroundColor: "#fff", flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Input
            value={fundUrl}
            onChangeText={handleChange}
            placeholder="Fund URL"
            isFocused={true}
          />
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

FundScreen.navigationOptions = {
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
