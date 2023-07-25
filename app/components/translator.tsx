import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Bot from "../Image/bot.png";
import useLLM from "usellm";

export default function Translator() {
  const [chats, setChats] = useState(
    [] as {
      role: string;
      content: string;
    }[]
  );
  const [language, setLanguage] = useState("English");
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

  const translatePrompt = (text: string) =>
    `I want you to act as an ${language} translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in ${language}. I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level ${language} words and sentences. Keep the meaning same, but make them more literary. I want you to only reply the correction, the improvements and nothing else, do not write explanations. My first sentence is "${text}"`;

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  async function handleClick(event: any = null) {
    if (inputText === "" || (event?.key !== "Enter" && event !== null)) {
      return;
    }
    const newChat = [...chats, { role: "user", content: inputText }];
    setWaiting(true);
    setInputText("");
    try {
      await llm.chat({
        messages: [{ role: "user", content: translatePrompt(inputText) }],
        stream: true,
        onStream: ({ message }) =>
          setChats([
            ...newChat,
            { role: `Translate - ${language}`, content: message.content },
          ]),
      });
    } catch (error) {
      console.log(error);
    }
    setWaiting(false);
  }
  return (
    <div>
      <div className="mx-5 relative h-[calc(100vh-200px)]">
        <div
          ref={messagesEndRef}
          className="border-2 rounded-md h-full overflow-scroll overflow-x-hidden"
        >
          <div className="border rounded-md top-2 left-2 shadow-lg pb-3 mb-3 absolute p-1 sm:p-3 md:p-5 bg-white">
            <div className="flex gap-x-3 ml-auto">
              <div className="my-auto font-bold">To language</div>
              <input
                className="w-48 rounded-lg py-1 px-2 border focus:outline-none"
                type="text"
                placeholder="Enter language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
              />
            </div>
          </div>
          <div className=" h-full p-1 sm:p-3 md:p-5 ">
            <div className="h-20"></div>
            <div className="w-full flex flex-col justify-between ">
              <div className="flex flex-col w-full">
                {chats.map((chat, i) => {
                  return (
                    <div key={i}>
                      {chat.role === "user" ? (
                        <div className="mb-5 flex justify-end">
                          <div>
                            {/* <h3 className="font-bold capitalize float-right">{ chat.role }</h3> <br/> */}
                            <h3 className="mt-1 whitespace-pre-wrap">
                              {chat.content}
                            </h3>
                          </div>
                        </div>
                      ) : (
                        <div className="flex">
                          <Image
                            width={Bot.width}
                            height={Bot.height}
                            src={Bot.src}
                            className="object-contain h-12 w-12 mr-4"
                            alt="Bot"
                          />
                          <div className="mb-5">
                            <h3 className="font-bold capitalize">
                              {chat.role}
                            </h3>
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
