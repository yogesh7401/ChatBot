import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Bot from "../Image/bot.png";
import useLLM from "usellm";

export default function Chat() {
  const [chats, setChats] = useState([
    {
      role: "assistant",
      content: "Ask me anything!",
    },
  ]);
  const [tab, setTab] = useState("chat");
  const llm = useLLM();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [waiting, setWaiting] = useState(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scroll({
      top: messagesEndRef.current?.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  async function handleClick(event: any = null) {
    if (inputText === "" || (event?.key !== "Enter" && event !== null)) {
      return;
    }
    setWaiting(true);
    const newChat = [...chats, { role: "user", content: inputText }];
    setInputText("");
    try {
      await llm.chat({
        messages: [{ role: "user", content: inputText }],
        stream: true,
        onStream: ({ message }) => setChats([...newChat, message]),
      });
    } catch (error) {
      console.log(error);
    }
    setWaiting(false);
  }
  return (
    <div>
      <div className="mx-5 h-[calc(100vh-200px)]">
        <div
          ref={messagesEndRef}
          className="border-2 shadow-lg rounded-md h-full p-1 sm:p-3 md:p-5 overflow-scroll overflow-x-hidden"
        >
          <div className="w-full flex flex-col justify-between ">
            <div className="flex flex-col">
              {chats.map((chat, i) => {
                return (
                  <div key={i}>
                    {chat.role === "assistant" ? (
                      <div className="flex">
                        <Image
                          width={Bot.width}
                          height={Bot.height}
                          src={Bot.src}
                          className="object-contain h-12 w-12 mr-4"
                          alt="Bot"
                        />
                        <div className="mb-5">
                          <h3 className="font-bold capitalize">{chat.role}</h3>
                          <h3 className="mt-1 whitespace-pre-wrap">
                            {chat.content}
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-5 flex justify-end">
                        <div>
                          {/* <h3 className="font-bold capitalize float-right">{ chat.role }</h3> <br/> */}
                          <h3 className="mt-1 whitespace-pre-wrap">
                            {chat.content}
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-5 shadow-lg border-x-2 border-b-2 rounded-b-md px-3 flex bg-white gap-3">
        {waiting ? (
          <div className="w-full bg-gray-300 my-2 text-gray-400 p-3 rounded-xl focus:outline-none">
            Wait for response to complete
          </div>
        ) : (
          <input
            className="w-full bg-gray-300 my-2 p-3 rounded-xl focus:outline-none"
            type="text"
            placeholder="type your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => handleClick(e)}
            required
          />
        )}

        <button
          className="bg-blue-600 my-2 p-3 rounded-xl text-white"
          disabled={waiting}
          onClick={() => handleClick()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
