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
  Picker,
  PickerIOSItem,
} from "react-native";
import { Input, Icon, Overlay, Card, ListItem } from "react-native-elements";
import Constants from "expo-constants";

import axios from "axios";

export default function HomeScreen() {
  async function getIndexData(symbol = "DJI") {
    const index = await axios.get(
      `https://still-atoll-20317.herokuapp.com/marketData/${symbol}`
    );
    // setIsLoading(false);
    return index;
  }
  const [isLoading, setIsLoading] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [symbolList, setSymbolList] = useState([]);
  const [data, setData] = useState({});
  const [openSymbol, setOpenSymbol] = useState("");

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
    setSymbolList(symbol);
  }

  function handleOpenOverlay(symbol) {
    setOpenSymbol(symbol);
  }

  useEffect(() => {
    if (symbol) {
      getIndexData(symbol)
        .then((res) => {
          const liveResult = res.data[0];
          console.log(liveResult);
          const newData = { ...data };
          newData[symbol] = liveResult;
          setData(newData);
        })
        .catch((err) => console.log("didnt get index"));
    }
  }, [symbolList]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {Object.keys(data).map((d) => (
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
                    <Text style={styles.titleStyle}>
                      {JSON.stringify(data[openSymbol])}
                    </Text>
                  </ScrollView>
                </View>
              </Overlay>

              <Card key={d} title={data[d].name} titleStyle={styles.titleStyle}>
                <Text>{data[d].price}</Text>
                <Text>{`${data[d].change} (${data[d].changesPercentage}%)`}</Text>
              </Card>
            </View>
          </TouchableNativeFeedback>
        ))}
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
