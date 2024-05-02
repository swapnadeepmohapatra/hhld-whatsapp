"use client";
import { useAuthStore } from "@/zustand/useAuthStore";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useUsersStore } from "@/zustand/useUsersStore";
import ChatUsers from "@/_components/chatUsers";
import { useChatReceiverStore } from "@/zustand/useChatReceiverStore";

const Chat = () => {
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState("");
  const [socket, setSocket] = useState(null);
  const { authName } = useAuthStore();
  const { updateUsers } = useUsersStore();
  const chatReceiver = useChatReceiverStore((state) => state.chatReceiver);

  useEffect(() => {
    // Establish WebSocket connection
    const newSocket = io("http://localhost:8081", {
      query: {
        username: authName,
      },
    });
    setSocket(newSocket);

    // Listen for incoming msgs
    newSocket.on("chat msg", (msgrecv) => {
      console.log("received msg on client " + msgrecv);
      setMsgs((prevMsgs) => [
        ...prevMsgs,
        { text: msgrecv, sentByCurrUser: false },
      ]);
    });

    getUserData();

    // Clean up function
    return () => newSocket.close();
  }, []);

  const sendMsg = (e) => {
    e.preventDefault();

    const msgToBeSent = {
      text: msg,
      sender: authName,
      receiver: chatReceiver,
    };

    if (socket) {
      socket.emit("chat msg", msgToBeSent);
      setMsgs((prevMsgs) => [...prevMsgs, { text: msg, sentByCurrUser: true }]);
      setMsg("");
    }
  };

  const getUserData = async () => {
    const res = await axios.get("http://localhost:8080/users", {
      withCredentials: true,
    });
    updateUsers(res.data);
  };

  return (
    <div className="h-screen w-screen flex flex-row divide-x-4 bg-black">
      <div className="w-1/5">
        <ChatUsers />
      </div>
      <div className="h-screen flex flex-col w-4/5">
        <div className="msgs-container h-4/5 overflow-scroll w-1/2 justify-self-center self-center">
          <h1>
            {authName} Chatting with {chatReceiver}
          </h1>
          {msgs.map((msg, index) => (
            <div
              key={index}
              className={` m-3 my-8 ${
                msg.sentByCurrUser ? "text-right" : "text-left"
              } text-black`}
            >
              <span
                className={`${
                  msg.sentByCurrUser ? "bg-red-200" : "bg-green-200"
                } p-3 rounded-lg`}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1/5 flex items-center justify-center">
          <form onSubmit={sendMsg} class="w-1/2">
            <div class="relative">
              <input
                type="text"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Type your text here"
                required
                class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500"
              />
              <button
                type="submit"
                class="text-white absolute end-2.5 bottom-2.5 bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
