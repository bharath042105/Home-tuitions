"use client";

import { Client } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Button, Input, Spinner } from "@/components/ui";
import { getAccessToken, getCurrentUserId } from "@/lib/api/client";
import { chatApi, type ChatMessageDto } from "@/lib/api/chat";
import { cn } from "@/lib/utils/cn";

/**
 * Connects to the STOMP endpoint per docs/phase2/02-high-level-design.md  2.7:
 * REST history on mount, then a live subscription for anything sent after.
 * One client per open panel - closed on unmount so a user with many booking
 * cards open doesn't accumulate dangling sockets.
 */
export function ChatPanel({ bookingId }: { bookingId: string }) {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    let cancelled = false;

    chatApi.listMessages(bookingId).then((history) => {
      if (!cancelled) {
        setMessages(history);
        setLoading(false);
      }
    });

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/ws`),
      connectHeaders: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/chat/${bookingId}`, (frame) => {
          const message = JSON.parse(frame.body) as ChatMessageDto;
          setMessages((prev) => [...prev, message]);
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      cancelled = true;
      client.deactivate();
    };
  }, [bookingId]);

  function send() {
    if (!draft.trim() || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/chat/${bookingId}`,
      body: JSON.stringify({ body: draft }),
    });
    setDraft("");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size={20} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-400">No messages yet - say hello.</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[80%] rounded-md px-3 py-1.5 text-sm",
              message.senderId === currentUserId
                ? "self-end bg-brand-500 text-white"
                : "self-start bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
            )}
          >
            {message.body}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={connected ? "Message..." : "Connecting..."}
          disabled={!connected}
        />
        <Button size="sm" onClick={send} disabled={!connected || !draft.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
