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

export default function HomeScreen() {
  async function getIndexData(symbol = "DJI") {
    setSymbol("");
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

  function handleSubmit() {
    // setIsLoading(true);
    setSymbolList(symbol);
  }

  useEffect(() => {
    if (symbol) {
      getIndexData(symbol)
        .then((res) => {
          const newData = { ...data };
          newData[symbol] = res.data;
          setData(newData);
        })
        .catch((err) => console.log("didnt get index"));
    }
  }, [symbolList]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TouchableNativeFeedback
          useForeground
          onPress={() => setIsLoading(true)}
          key={"1"}
        >
          <View>
            <Overlay
              isVisible={isLoading}
              onBackdropPress={() => setIsLoading(false)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.titleStyle}>{JSON.stringify(data)}</Text>
                <ScrollView>
                  <ActivityIndicator size="large" color="#00ff00" />
                </ScrollView>
              </View>
            </Overlay>
            <Card title="index name" titleStyle={styles.titleStyle}></Card>
          </View>
        </TouchableNativeFeedback>
      </ScrollView>

      <View style={{ backgroundColor: "#fff", flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Input
            value={symbol}
            onChangeText={(textValue) => setSymbol(textValue)}
            placeholder="Index Symbol"
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
