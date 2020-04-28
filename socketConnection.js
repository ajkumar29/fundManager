import socketIOClient from "socket.io-client";

// const url = "https://still-atoll-20317.herokuapp.com";
const url = "http://192.168.0.22:8080";
const socket = socketIOClient(url);

export default socket;
