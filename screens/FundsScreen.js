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
  const [isOpen, setIsOpen] = useState(false);

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
    if (fundUrl !== "") {
      getFund(fundUrl)
        .then((res) => {
          let newData = [...data];
          newData.push(res.data);
          setData(newData);
        })
        .catch((err) => console.log("caught"));
    }
  }, [urlList]);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          data.map((d, i) => (
            <TouchableNativeFeedback onPress={() => setIsOpen(true)} key={i}>
              <View>
                <Overlay
                  isVisible={isOpen}
                  onBackdropPress={() => setIsOpen(false)}
                >
                  <ScrollView>
                    <Text>{JSON.stringify(d.holdings)}</Text>
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
