import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronDown,
  HeartPulse,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  Trash2
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { z } from 'zod'

import { QueryError, QueryLoading } from '@/components/QueryState'
import {
  createConversation,
  deleteConversation,
  getConversationMessages,
  getConversations,
  sendConversationMessage,
  type Conversation,
  type ConversationMessage
} from '@/services/product'

const messageSchema = z.object({
  content: z.string().trim().min(1).max(4000)
})

type MessageForm = z.infer<typeof messageSchema>

export function ChatPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedID, setSelectedID] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversations = useQuery({
    queryKey: ['conversations'],
    queryFn: ({ signal }) => getConversations(signal)
  })

  useEffect(() => {
    if (!selectedID && conversations.data?.[0]) {
      setSelectedID(conversations.data[0].id)
    }
  }, [conversations.data, selectedID])

  const messages = useQuery({
    queryKey: ['conversation-messages', selectedID],
    queryFn: ({ signal }) => getConversationMessages(selectedID, signal),
    enabled: selectedID !== ''
  })
  const form = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' }
  })

  const create = useMutation({
    mutationFn: () =>
      createConversation({
        locale: i18n.resolvedLanguage === 'en' ? 'en' : 'th'
      }),
    onSuccess: (conversation) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (current) => [
        conversation,
        ...(current ?? [])
      ])
      queryClient.setQueryData<ConversationMessage[]>(
        ['conversation-messages', conversation.id],
        []
      )
      setSelectedID(conversation.id)
    }
  })

  const remove = useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_, removedID) => {
      queryClient.setQueryData<Conversation[]>(
        ['conversations'],
        (current) => current?.filter(({ id }) => id !== removedID) ?? []
      )
      queryClient.removeQueries({
        queryKey: ['conversation-messages', removedID]
      })
      setSelectedID('')
    }
  })

  const send = useMutation({
    mutationFn: (input: MessageForm) =>
      sendConversationMessage(selectedID, input),
    onSuccess: (exchange) => {
      queryClient.setQueryData<ConversationMessage[]>(
        ['conversation-messages', selectedID],
        (current) => [...(current ?? []), ...exchange]
      )
      form.reset()
    }
  })

  const onSubmit = form.handleSubmit((input) => send.mutate(input))
  const locale = i18n.resolvedLanguage === 'en' ? 'en' : 'th'
  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value))

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [messages.data?.length, send.isPending])

  const conversationList = conversations.data && (
    <div className="space-y-2">
      {conversations.data.length === 0 && (
        <p className="px-3 py-5 text-sm leading-6 text-kg-muted">
          {t('chat.empty')}
        </p>
      )}
      {conversations.data.map((conversation) => (
        <div
          className={`group relative flex items-stretch overflow-hidden rounded-xl transition-colors ${
            selectedID === conversation.id
              ? 'bg-kg-soft text-kg-ink'
              : 'text-slate-600 hover:bg-slate-50 hover:text-kg-ink'
          }`}
          key={conversation.id}
        >
          <button
            aria-pressed={selectedID === conversation.id}
            className="relative min-h-16 min-w-0 flex-1 bg-transparent py-2.5 pl-4 pr-14 text-left"
            onClick={() => setSelectedID(conversation.id)}
            type="button"
          >
            {selectedID === conversation.id && (
              <span
                aria-hidden="true"
                className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-kg-primary"
              />
            )}
            <span className="block truncate text-sm font-semibold">
              {conversation.title}
            </span>
            <span className="mt-1 block text-xs tabular-nums text-kg-muted">
              {formatTime(conversation.updated_at)}
            </span>
          </button>
          <button
            aria-label={t('chat.delete', { title: conversation.title })}
            className="absolute right-1.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg border-0 bg-transparent text-slate-500 transition-colors hover:bg-white/80 hover:text-red-700 disabled:opacity-50"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm(t('chat.deleteConfirm'))) {
                remove.mutate(conversation.id)
              }
            }}
            type="button"
          >
            <Trash2 aria-hidden="true" size={17} />
          </button>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex min-h-[calc(100dvh-7.5rem)] flex-col overflow-hidden rounded-[1.5rem] border border-kg-border bg-white shadow-sm lg:h-[calc(100dvh-5rem)] lg:min-h-[44rem]">
      <header className="flex flex-col gap-4 border-b border-kg-border px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-7">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-kg-ink sm:text-3xl">
            {t('chat.title')}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-kg-muted">
            {t('chat.subtitle')}
          </p>
        </div>
        <button
          className="kg-button-secondary shrink-0 self-start sm:self-auto"
          disabled={create.isPending}
          onClick={() => create.mutate()}
          type="button"
        >
          <Plus aria-hidden="true" size={18} />
          {t('chat.new')}
        </button>
      </header>

      {create.isError && (
        <div className="m-4 kg-alert-danger sm:mx-6" role="alert">
          <p>{t('chat.consentRequired')}</p>
          <Link className="mt-2 inline-block underline" to="/consent">
            {t('chat.manageConsent')}
          </Link>
        </div>
      )}

      {conversations.isLoading && <QueryLoading />}
      {conversations.isError && (
        <div className="p-6">
          <QueryError retry={() => void conversations.refetch()} />
        </div>
      )}

      {conversations.data && (
        <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
          <details className="border-b border-kg-border bg-white lg:hidden">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 font-semibold text-kg-ink marker:content-none">
              {t('chat.conversations')}
              <ChevronDown aria-hidden="true" size={19} />
            </summary>
            <div className="max-h-72 overflow-y-auto border-t border-kg-border p-3">
              {conversationList}
            </div>
          </details>

          <aside
            aria-label={t('chat.conversations')}
            className="hidden border-r border-kg-border bg-slate-50/45 p-4 lg:block"
          >
            <h2 className="mb-3 px-3 text-sm font-bold text-kg-ink">
              {t('chat.conversations')}
            </h2>
            {conversationList}
            {remove.isError && (
              <p className="kg-alert-danger mt-3" role="alert">
                {t('chat.deleteFailed')}
              </p>
            )}
          </aside>

          <section
            aria-label={t('chat.conversation')}
            className="flex min-h-[34rem] min-w-0 flex-col bg-white lg:min-h-0"
          >
            <div
              aria-live="polite"
              className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
            >
              {!selectedID && (
                <div className="m-auto max-w-md py-12 text-center text-kg-muted">
                  <MessageCircle
                    aria-hidden="true"
                    className="mx-auto text-kg-primary"
                    size={42}
                  />
                  <p className="mt-4 leading-7">{t('chat.empty')}</p>
                </div>
              )}
              {selectedID && messages.isLoading && <QueryLoading />}
              {selectedID && messages.isError && (
                <div className="m-auto">
                  <QueryError retry={() => void messages.refetch()} />
                </div>
              )}
              {selectedID && messages.data && (
                <>
                  {messages.data.length === 0 && (
                    <div className="m-auto max-w-md py-12 text-center text-kg-muted">
                      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-kg-primary text-white">
                        <HeartPulse aria-hidden="true" size={21} />
                      </div>
                      <p className="mt-4 leading-7">{t('chat.startPrompt')}</p>
                    </div>
                  )}
                  {messages.data.map((message) => (
                    <article
                      className={`flex max-w-[94%] items-start gap-3 sm:max-w-[82%] ${
                        message.role === 'user'
                          ? 'ml-auto flex-row-reverse'
                          : 'mr-auto'
                      }`}
                      key={message.id}
                    >
                      {message.role === 'assistant' && (
                        <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-kg-primary text-white">
                          <HeartPulse aria-hidden="true" size={17} />
                        </div>
                      )}
                      <div
                        className={`min-w-0 rounded-2xl px-4 py-3 text-sm leading-7 ${
                          message.role === 'user'
                            ? 'rounded-tr-md bg-kg-primary text-white'
                            : 'rounded-tl-md bg-kg-soft text-kg-ink'
                        }`}
                      >
                        <span className="sr-only">
                          {message.role === 'user'
                            ? t('chat.you')
                            : t('chat.ai')}
                        </span>
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <time
                          className={`mt-1 block text-right text-[0.7rem] tabular-nums ${
                            message.role === 'user'
                              ? 'text-teal-100'
                              : 'text-kg-muted'
                          }`}
                          dateTime={message.created_at}
                        >
                          {formatTime(message.created_at)}
                        </time>
                      </div>
                    </article>
                  ))}
                  {send.isPending && (
                    <p
                      className="flex items-center gap-2 text-sm text-kg-muted"
                      role="status"
                    >
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-kg-primary"
                      />
                      {t('chat.responding')}
                    </p>
                  )}
                  {send.isError && (
                    <p className="kg-alert-danger" role="alert">
                      {t('chat.sendFailed')}
                    </p>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {selectedID && messages.data && (
              <div className="border-t border-kg-border px-4 py-4 sm:px-6">
                <form onSubmit={onSubmit}>
                  <label className="sr-only" htmlFor="chat-message">
                    {t('chat.messageLabel')}
                  </label>
                  <div className="flex items-end gap-2 rounded-2xl border border-kg-border bg-white p-2 shadow-sm focus-within:border-kg-primary focus-within:ring-4 focus-within:ring-teal-100">
                    <textarea
                      aria-describedby="chat-composer-hint"
                      className="max-h-36 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-kg-ink outline-none placeholder:text-slate-400"
                      id="chat-message"
                      maxLength={4000}
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          !event.shiftKey &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault()
                          void onSubmit()
                        }
                      }}
                      placeholder={t('chat.placeholder')}
                      rows={1}
                      {...form.register('content')}
                    />
                    <button
                      aria-label={t('chat.send')}
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-kg-primary text-white transition-colors hover:bg-kg-primary-strong disabled:opacity-50"
                      disabled={send.isPending}
                      type="submit"
                    >
                      <Send aria-hidden="true" size={19} />
                    </button>
                  </div>
                  <p className="sr-only" id="chat-composer-hint">
                    {t('chat.composerHint')}
                  </p>
                  {form.formState.errors.content && (
                    <p className="kg-error mt-2" role="alert">
                      {t('chat.messageRequired')}
                    </p>
                  )}
                </form>

                <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-amber-700"
                    size={18}
                  />
                  <p>{t('chat.boundary')}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
