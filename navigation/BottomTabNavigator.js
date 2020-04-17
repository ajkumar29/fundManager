import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";

import TabBarIcon from "../components/TabBarIcon";
import HomeScreen from "../screens/HomeScreen";
import LogScreen from "../screens/LogScreen";
import AccountsScreen from "../screens/AccountsScreen";
import FundsScreen from "../screens/FundsScreen";
import NewsScreen from "../screens/NewsScreen";

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = "Starred Indices";

export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Indices"
        component={HomeScreen}
        options={{
          title: "Indices",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="md-trending-up" />
          ),
        }}
      />
      <BottomTab.Screen
        name="Funds"
        component={FundsScreen}
        options={{
          title: "Funds",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="md-wallet" />
          ),
        }}
      />
      <BottomTab.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{
          title: "Accounts",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="md-card" />
          ),
        }}
      />
      <BottomTab.Screen
        name="Log"
        component={LogScreen}
        options={{
          title: "Account log",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="md-navigate" />
          ),
        }}
      />
      <BottomTab.Screen
        name="News"
        component={NewsScreen}
        options={{
          title: "News",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="md-bookmark" />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

function getHeaderTitle(route) {
  const routeName =
    route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case "Indices":
      return "Starred Indices";
    case "Funds":
      return "Your Funds";
    case "Accounts":
      return "Your Accounts";
    case "Log":
      return "Your Account Log ";
    case "News":
      return "Stock News";
  }
}
