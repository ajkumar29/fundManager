import * as WebBrowser from "expo-web-browser";
import React, { useState, useEffect } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Input, Icon, ListItem } from "react-native-elements";
import Constants from "expo-constants";

import { MonoText } from "../components/StyledText";
import axios from "axios";

export default function FundScreen() {
  const [fundUrl, setFundUrl] = useState("");
  const [urlList, setUrlList] = useState([]);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function getFund(link) {
    const fund = await axios("https://still-atoll-20317.herokuapp.com/fund", {
      headers: {
        Link: link,
      },
    });
    return fund;
  }

  function handleChange(textValue) {
    setFundUrl(textValue);
  }

  function handleSubmit() {
    if (fundUrl.trim() !== "" && !urlList.includes(fundUrl)) {
      const newList = [...urlList];
      newList.push(fundUrl);
      setUrlList(newList);
      setIsLoading(true);
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
          setFundUrl("");
        })
        .then(setIsLoading(false))
        .catch((err) => console.log("caught"));
    }
  }, [urlList]);

  // useEffect(() => {
  //   let newData = [...data];
  //   for (let url in urlList) {
  //     getFund(url)
  //       .then((res) => {
  //         newData.push(res);
  //       })
  //       .catch((err) => console.log(err));
  //   }
  //   setData(newData);
  // }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
        {data.map((d, i) => (
          <View key={i}>
            <ListItem
              title={d.name}
              subtitle={"Buy price: " + d.buyPrice}
              bottomDivider
            />
          </View>
        ))}
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
});
