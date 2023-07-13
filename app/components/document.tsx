import { useEffect, useRef, useState } from "react";
import useLLM from "usellm";

export default function Document() {
  const [documentText, setDocumentText] = useState("");
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [documentEmbeddings, setDocumentEmbeddings] = useState([]);
  const [question, setQuestion] = useState("");
  const [matchedParagraphs, setMatchedParagraphs] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");
  const [answerStatus, setAnswerStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const llm = useLLM();

  const scrollToBottom = () => {
    messagesEndRef.current?.scroll({
      top: messagesEndRef.current?.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [documentEmbeddings, answer]);

  async function handleEmbedClick() {
    if (!documentText) {
      window.alert("Please enter some text for the document!");
      return;
    }
    setStatus("Embedding...");
    setDocumentEmbeddings([]);
    setMatchedParagraphs([]);
    setAnswer("");
    const paragraphs = documentText
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .slice(0, 100)
      .map((p) => p.trim().substring(0, 1000));
    setParagraphs(paragraphs);
    const { embeddings } = await llm.embed({ input: paragraphs });
    setDocumentEmbeddings(embeddings);
    setStatus("");
    console.log(documentEmbeddings);
  }

  const createPrompt = (paragraphs: string[], question: string) => `
        Read the following paragraphs from a longer document and answer the question below.

        --DOCUMENT BEGINS--

        ${paragraphs.join("\n\n")}

        --DOCUMENT ENDS--

        Question: ${question}
        `;

  async function handleSubmitClick(event: any = null) {
    if (question === "" || (event?.key !== "Enter" && event !== null)) {
      return;
    }
    setAnswerStatus("Answering...");
    setMatchedParagraphs([]);
    setAnswerStatus("");
    if (!documentEmbeddings.length) {
      window.alert("Please embed the document first!");
      return;
    }

    if (!question) {
      window.alert("Please enter a question!");
      return;
    }

    const { embeddings } = await llm.embed({ input: question });
    const matchingParagraphs = llm
      .scoreEmbeddings({
        embeddings: documentEmbeddings,
        query: embeddings[0],
        top: 3,
      })
      .map(({ index }) => paragraphs[index]);
    setMatchedParagraphs(matchingParagraphs);

    const initialMessage = {
      role: "user",
      content: createPrompt(matchingParagraphs, question),
    };
    const { message } = await llm.chat({
      messages: [initialMessage],
      stream: true,
      onStream: ({ message }) => setAnswer(message.content),
    });
    setAnswer(message.content);
    setStatus("");
  }

  return (
    <div className="mx-5 h-[calc(100vh-150px)]">
      <div
        ref={messagesEndRef}
        className="border-2 shadow-lg rounded-md h-full p-1 sm:p-3 md:p-5 overflow-scroll overflow-x-hidden"
      >
        <div className="w-full flex flex-col justify-between ">
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold">Document Q&A</h3>
            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              name="documentText"
              id="documentText"
              placeholder="Paste your document here"
              className="p-3 rounded-lg focus:outline-none border my-2"
              rows={10}
            ></textarea>
            <button
              onClick={() => handleEmbedClick()}
              className="bg-blue-600 my-2 w-20 p-3 rounded-lg text-white"
            >
              Embed
            </button>
            {status && <div>{status}</div>}
            {documentEmbeddings.length > 0 && (
              <div className="ml-2">
                {documentEmbeddings.length} paragraphs embedded
              </div>
            )}
            <input
              className="w-full border my-2 p-3 rounded-lg focus:outline-none"
              type="text"
              placeholder="Enter the question about the document"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => handleSubmitClick(e)}
              required
            />
            <button
              className="bg-blue-600 my-2 p-3 w-20 rounded-md text-white"
              onClick={() => handleSubmitClick()}
            >
              Send
            </button>
            {matchedParagraphs.length > 0 && (
              <div className="my-4">
                <div className="text-lg font-medium">Matched Paragraphs</div>

                {matchedParagraphs.map((paragraph, idx) => (
                  <p
                    className="my-2 text-sm"
                    key={`${idx}-${paragraph.substring(0, 10)}`}
                  >
                    {paragraph.substring(0, 100) + "..."}
                  </p>
                ))}
              </div>
            )}
            {answer && (
              <div className="my-4">
                <div className="text-lg font-medium">Answer</div>
                <div>{answer}</div>
              </div>
            )}

            {answerStatus && <div>{answerStatus}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
