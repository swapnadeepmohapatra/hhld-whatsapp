import React from "react";
import { useUsersStore } from "../zustand/useUsersStore";
import { useChatReceiverStore } from "../zustand/useChatReceiverStore";

const ChatUsers = () => {
  const { users } = useUsersStore();
  const { updateChatReceiver } = useChatReceiverStore();

  const setChatReceiver = (user) => {
    updateChatReceiver(user.username);
  };

  return (
    <div>
      {users.map((user, index) => (
        <div
          key={index}
          onClick={() => setChatReceiver(user)}
          //   className="bg-red-400 rounded-xl m-3 p-5"
          className="bg-red-700 p-3 rounded-lg m-3 p-5 cursor-pointer"
        >
          {user.username}
        </div>
      ))}
    </div>
  );
};

export default ChatUsers;
