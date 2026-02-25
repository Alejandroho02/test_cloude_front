import { useEffect } from "react";
import { Button } from "../../Components/Button/Button";
import "./chat.scss";

import { ActionCard } from "../../Components/ActionCard/ActionCard";
import { useChat } from "../../Hooks/useChat";

export const Chat = () => {
    const {
        handleCardAction,
        handleSend,
        setInput,
        textareaRef,
        isStreaming,
        scrollRef,
        cardRegex, 
        sideCards,
        messages,
        input,
    } = useChat();

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, isStreaming]);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [input]);



    return (
        <section className="section-chat">
            <header className="chat-header">
                <h2>Assistant Chatbot</h2>
            </header>

            <div className="container-section-chat">
   
                <div className="container-chat">

                    <div className="chat-messages" ref={scrollRef}>
                        {messages.map((message, index) => {
                            const textContent = (message.content || "").replace(cardRegex, "").trim();
                            return (
                                <div key={index} className={`bubble ${message.role}`}>
                                    <div className="bubble-text">
                                        {textContent || (message.role === "assistant" && isStreaming ? "Generando respuesta..." : "")}
                                    </div>
                                </div>
                            );
                        })}

                        {isStreaming && (
                            <div className="streaming-indicator">
                                <span className="dot" />
                                <span className="dot" />
                                <span className="dot" />
                                <p>Claude está escribiendo…</p>
                            </div>
                        )}
                    </div>

                    <div className="container-chatbox-text-area">

                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe lo que te interese..."
                            className="chat-text-area"
                            disabled={isStreaming}
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />

                        <Button onClick={handleSend} disabled={isStreaming || !input.trim()}>
                            {isStreaming ? "..." : "Enviar"}
                        </Button>
                    </div>
                </div>

                <div className="container-cards">
                    <p>Comienza a editar</p>
                    {sideCards.map((card, index) => (
                        <ActionCard key={index} {...card} onAction={handleCardAction} />
                    ))}
                </div>
            </div>
        </section>
    );
};