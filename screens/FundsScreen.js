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
import { Input, Icon, Overlay, Card } from "react-native-elements";
import Constants from "expo-constants";

import axios from "axios";

export default function FundScreen() {
  const [fundUrl, setFundUrl] = useState("");
  const [urlList, setUrlList] = useState([]);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockData, setStockData] = useState({});
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

  async function getStock(link) {
    const stock = await axios("https://still-atoll-20317.herokuapp.com/stock", {
      headers: {
        Link: link,
      },
    });
    return stock;
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

      //FIlter out the NOne URLs and push them to stock data first, then loop through all the URLS?
      for (let holding in holdings) {
        const { weight, linkToStockPage } = holdings[holding];
        if (linkToStockPage !== "None") {
          getStock(linkToStockPage)
            .then((res) => {
              stocks.push({
                weight,
                name: holding,
                change: res.data.change,
              });
            })
            .then(setStockData(stocks))
            .catch((err) => console.group(err));
        } else {
          stocks.push({ weight, name: holding, change: "URL Not present" });
          setStockData(stocks);
        }
      }
    }
    setStockLoading(false);
  }, [openFund]);

  console.log(stockData);
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
                  <ScrollView>
                    {stockLoading ? (
                      <ActivityIndicator size="large" color="#00ff00" />
                    ) : (
                      <Text>{JSON.stringify(stockData)}</Text>
                    )}
                  </ScrollView>
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
