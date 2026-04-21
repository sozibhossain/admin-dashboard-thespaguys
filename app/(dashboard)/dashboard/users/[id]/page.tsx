"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function UserChatPage() {
  const params = useParams<{ id: string }>();
  const [page] = useState(1);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const userQuery = useQuery({
    queryKey: ["user-detail", params.id],
    queryFn: () => api.getUserDetail(params.id),
  });

  const chatsQuery = useQuery({
    queryKey: ["user-chat-history", params.id, page],
    queryFn: () => api.getUserChatHistory(params.id, { page, limit: 20 }),
  });

  const selectedConversation =
    chatsQuery.data?.conversations.find((conversation) => conversation._id === selectedConversationId) ??
    chatsQuery.data?.conversations[0];

  const otherParticipant = useMemo(
    () =>
      selectedConversation?.participants.find((participant) => participant._id !== params.id),
    [params.id, selectedConversation],
  );

  const messagesQuery = useQuery({
    queryKey: ["messages", selectedConversation?._id],
    queryFn: () => api.getMessages(selectedConversation!._id, { page: 1, limit: 50 }),
    enabled: !!selectedConversation?._id,
  });

  return (
    <div>
      <PageHeader
        title="User Management"
        breadcrumb="Dashboard  >  User Management"
        actions={
          <div className="flex items-center gap-4">
            {userQuery.isLoading ? (
              <Skeleton className="h-16 w-56 rounded-full" />
            ) : (
              <div className="flex items-center gap-4">
                <Avatar
                  className="size-16"
                  name={userQuery.data?.user.name}
                  src={userQuery.data?.user.avatar}
                />
                <div>
                  <p className="text-[18px] font-semibold">{userQuery.data?.user.name}</p>
                  <p className="flex items-center gap-2 text-[#9d9d9d]">
                    {userQuery.data?.user.email}
                    <ChevronRight className="size-4" />
                  </p>
                </div>
              </div>
            )}
          </div>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[24px] border border-[#343434] bg-black p-5">
          <div className="mb-4">
            <Select defaultValue="">
              <option value="">All conversations</option>
            </Select>
          </div>
          <div className="space-y-3">
            {chatsQuery.isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-2xl" />
                ))
              : chatsQuery.data?.conversations.map((conversation) => {
                  const participant = conversation.participants.find(
                    (entry) => entry._id !== params.id,
                  );
                  return (
                    <button
                      className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left ${
                        selectedConversation?._id === conversation._id ? "bg-[#181818]" : ""
                      }`}
                      key={conversation._id}
                      onClick={() => setSelectedConversationId(conversation._id)}
                      type="button"
                    >
                      <Avatar
                        className="size-15"
                        name={participant?.name}
                        src={participant?.avatar}
                      />
                      <div className="flex-1">
                        <p className="text-[18px] font-medium">{participant?.name}</p>
                        <p className="text-sm text-[#8f8f8f]">
                          {participant?.serviceName || participant?.specialization || "Conversation"}
                        </p>
                      </div>
                      <div className="text-sm text-[#c8c8c8]">
                        {formatDate(conversation.updatedAt, "hh:mm a")}
                      </div>
                    </button>
                  );
                })}
          </div>
        </div>

        <div className="rounded-[24px] border border-[#343434] bg-black p-5">
          {otherParticipant ? (
            <div className="mb-6 flex items-center gap-4 rounded-full bg-[#1f1f1f] px-5 py-4">
              <Avatar
                className="size-12"
                name={otherParticipant.name}
                src={otherParticipant.avatar}
              />
              <div>
                <p className="text-[18px]">{otherParticipant.name}</p>
                <p className="text-sm text-[#8f8f8f]">Available now</p>
              </div>
            </div>
          ) : null}

          <div className="space-y-6">
            {messagesQuery.isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-2xl" />
                ))
              : messagesQuery.data?.messages.map((message) => {
                  const isUser = message.sender._id === params.id;
                  return (
                    <div
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      key={message._id}
                    >
                      <div
                        className={`max-w-[70%] rounded-[20px] px-5 py-4 ${
                          isUser ? "gold-gradient text-white" : "bg-[#474747] text-white"
                        }`}
                      >
                        <p className="text-[16px] leading-[1.25]">{message.content || message.type}</p>
                        <p className="mt-3 text-right text-xs opacity-70">
                          {formatDate(message.createdAt, "hh:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>
    </div>
  );
}
