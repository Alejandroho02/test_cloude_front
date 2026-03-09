import { useEffect } from "react";
import { Button } from "../../Components/Button/Button";
import "./chat.scss";

import { ActionCard } from "../../Components/ActionCard/ActionCard";
import { WelcomeCard } from "../../Components/WelcomeCard/WelcomeCard";
import { Sidebar } from "../../Components/Sidebar/Sidebar";
import { useChat } from "../../Hooks/useChat";
import { icon_send } from "../../data/icon-data";
import { ia_icon } from "../../data/img-data";

export const Chat = () => {
    const {
        handleCardAction,
        handleSend,
        handleSendMessage,
        setInput,
        textareaRef,
        isStreaming,
        cardRegex,
        scrollRef,
        sideCards,
        messages,
        input,
        cardStatuses,
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

    // mockActionCards.ts


    return (
        <section className="section-chat">
            <header className="chat-header">
                <h2>ChatBot</h2>
            </header>

            <div className="container-section-chat">
                <Sidebar />
                <div className="container-chat">

                    <div className="chat-messages" ref={scrollRef}>
                        {messages.map((message, index) => {
                            const isWelcome = index === 0 && message.role === "assistant" && messages.filter(m => m.role === "user").length === 0;

                            if (isWelcome) {
                                return (
                                    <WelcomeCard
                                        key={index}
                                        disabled={isStreaming}
                                        onAction={(msg) => { handleSendMessage(msg); }}
                                    />
                                );
                            }

                            const textContent = (message.content || "").replace(cardRegex, "").trim();

                            const cards = [...(message.content || "").matchAll(cardRegex)].map((match) => {
                                try { return JSON.parse(match[1]); }
                                catch { return null; }
                            }).filter(Boolean);

                            const time = message.createdAt
                                ? new Date(message.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                                : null;

                            return (
                                <div key={index}>
                                    <div className={`bubble ${message.role}`}>
                                        <div className="container-header-message">
                                            {message.role === "assistant" && (
                                                <>
                                                    <img className="icon-message" src={ia_icon.url} alt={ia_icon.alt} />
                                                    <p>Asistente</p>
                                                </>
                                            )}
                                        </div>
                                        <div className="bubble-text">
                                            {textContent || (message.role === "assistant" && isStreaming ? "Claude esta escribiendo" : "")}
                                        </div>
                                        {time && <span className="bubble-time">{time}</span>}
                                    </div>
                                    <div className="container-cards-message">
                                        {cards
                                // build a key that survives new messages with identical content
                                .map((card) => ({
                                    card,
                                    key: JSON.stringify(card),
                                }))
                                .map(({ card, key }) => {
                                    return (
                                        <ActionCard
                                            key={key}
                                            {...card}
                                            cardId={key}
                                            status={cardStatuses[key]}
                                            onAction={handleCardAction}
                                        />
                                    );
                                })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    <div className="container-chatbox-text-area">
                        <div className="container-chatbox">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pregunta lo que quieras"
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
                            <button
                                onClick={handleSend}
                                disabled={isStreaming || !input.trim()}
                                className="chatbox-button-send">
                                <img src={icon_send.url} alt={icon_send.alt} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};