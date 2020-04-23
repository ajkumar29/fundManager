import socketIOClient from "socket.io-client";

const socket = socketIOClient("http://192.168.0.20:8080");

export default socket;
