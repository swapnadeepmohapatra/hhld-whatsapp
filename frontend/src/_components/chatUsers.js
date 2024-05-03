import React, { useEffect } from "react";
import { useUsersStore } from "@/zustand/useUsersStore";
import { useChatReceiverStore } from "@/zustand/useChatReceiverStore";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useChatMsgsStore } from "@/zustand/useChatMsgsStore";
import axios from "axios";

const ChatUsers = () => {
  const { users } = useUsersStore();
  const { authName } = useAuthStore();
  const { chatReceiver, updateChatReceiver } = useChatReceiverStore();
  const { updateChatMsgs } = useChatMsgsStore();

  const setChatReceiver = (user) => {
    updateChatReceiver(user.username);
  };

  useEffect(() => {
    const getMsgs = async () => {
      const res = await axios.get(
        "http://localhost:8081/msgs",
        {
          params: {
            sender: authName,
            receiver: chatReceiver,
          },
        },
        {
          withCredentials: true,
        }
      );
      if (res.data.length !== 0) {
        updateChatMsgs(res.data);
      } else {
        updateChatMsgs([]);
      }
    };
    if (chatReceiver) {
      getMsgs();
    }
  }, [chatReceiver]);

  return (
    <div>
      {users.map((user, index) =>
        user.username !== authName ? (
          <div
            key={index}
            onClick={() => {
              console.log(user.username, chatReceiver);
              setChatReceiver(user);
            }}
            //   className="bg-red-400 rounded-xl m-3 p-5"
            className={`p-3 rounded-lg m-3 p-5 cursor-pointer`}
            style={{
              backgroundColor:
                user.username === chatReceiver ? "#881337" : "#be123c",
            }}
          >
            {user.username}
          </div>
        ) : null
      )}
    </div>
  );
};

export default ChatUsers;
