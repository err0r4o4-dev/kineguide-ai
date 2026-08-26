import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Plus, Send, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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

  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
          {t('chat.title')}
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">{t('chat.subtitle')}</p>
      </header>

      <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        {t('chat.boundary')}
      </p>

      {conversations.isLoading && <QueryLoading />}
      {conversations.isError && (
        <div className="mt-6">
          <QueryError retry={() => void conversations.refetch()} />
        </div>
      )}

      {conversations.data && (
        <div className="mt-6 grid min-h-[34rem] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="kg-card p-4" aria-label={t('chat.conversations')}>
            <button
              className="kg-button-primary w-full"
              disabled={create.isPending}
              onClick={() => create.mutate()}
              type="button"
            >
              <Plus aria-hidden="true" size={18} />
              {t('chat.new')}
            </button>
            {create.isError && (
              <div className="kg-alert-danger mt-3" role="alert">
                <p>{t('chat.consentRequired')}</p>
                <Link className="mt-2 inline-block underline" to="/consent">
                  {t('chat.manageConsent')}
                </Link>
              </div>
            )}
            <div className="mt-4 space-y-2">
              {conversations.data.map((conversation) => (
                <div className="flex gap-2" key={conversation.id}>
                  <button
                    aria-pressed={selectedID === conversation.id}
                    className={`min-h-11 min-w-0 flex-1 rounded-xl px-3 text-left text-sm ${selectedID === conversation.id ? 'bg-teal-50 font-semibold text-teal-900' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                    onClick={() => setSelectedID(conversation.id)}
                    type="button"
                  >
                    <span className="block truncate">{conversation.title}</span>
                  </button>
                  <button
                    aria-label={t('chat.delete', { title: conversation.title })}
                    className="kg-icon-button"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(t('chat.deleteConfirm'))) {
                        remove.mutate(conversation.id)
                      }
                    }}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={18} />
                  </button>
                </div>
              ))}
            </div>
            {remove.isError && (
              <p className="kg-alert-danger mt-3" role="alert">
                {t('chat.deleteFailed')}
              </p>
            )}
          </aside>

          <section
            className="kg-card flex min-h-[34rem] min-w-0 flex-col overflow-hidden"
            aria-label={t('chat.conversation')}
          >
            {!selectedID && (
              <div className="m-auto max-w-md px-6 text-center text-slate-600">
                <MessageCircle
                  aria-hidden="true"
                  className="mx-auto text-teal-700"
                  size={42}
                />
                <p className="mt-4">{t('chat.empty')}</p>
              </div>
            )}
            {selectedID && messages.isLoading && <QueryLoading />}
            {selectedID && messages.isError && (
              <div className="m-auto p-6">
                <QueryError retry={() => void messages.refetch()} />
              </div>
            )}
            {selectedID && messages.data && (
              <>
                <div
                  className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
                  aria-live="polite"
                >
                  {messages.data.length === 0 && (
                    <p className="m-auto max-w-md py-16 text-center text-slate-500">
                      {t('chat.startPrompt')}
                    </p>
                  )}
                  {messages.data.map((message) => (
                    <article
                      className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${message.role === 'user' ? 'ml-auto bg-teal-700 text-white' : 'mr-auto border border-slate-200 bg-slate-50 text-slate-800'}`}
                      key={message.id}
                    >
                      <span className="sr-only">
                        {message.role === 'user' ? t('chat.you') : t('chat.ai')}
                      </span>
                      {message.content}
                    </article>
                  ))}
                  {send.isPending && (
                    <p className="text-sm text-slate-500" role="status">
                      {t('chat.responding')}
                    </p>
                  )}
                  {send.isError && (
                    <p className="kg-alert-danger" role="alert">
                      {t('chat.sendFailed')}
                    </p>
                  )}
                </div>
                <form
                  className="border-t border-slate-200 p-4"
                  onSubmit={onSubmit}
                >
                  <label className="kg-field" htmlFor="chat-message">
                    {t('chat.messageLabel')}
                    <textarea
                      className="min-h-24 w-full resize-y rounded-xl border border-slate-300 p-3 font-normal text-slate-900"
                      id="chat-message"
                      maxLength={4000}
                      {...form.register('content')}
                    />
                  </label>
                  {form.formState.errors.content && (
                    <p className="kg-error mt-2" role="alert">
                      {t('chat.messageRequired')}
                    </p>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      className="kg-button-primary"
                      disabled={send.isPending}
                      type="submit"
                    >
                      <Send aria-hidden="true" size={18} />
                      {t('chat.send')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
