import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Sparkles,
  User,
  Store,
  Clock,
  CheckCheck,
  X,
  Smile
} from 'lucide-react';
import { Order, OrderMessage } from '../../types';
import { sendOrderMessage } from '../../lib/deliveryService';

interface OrderInternalMessengerProps {
  order: Order;
  senderRole: 'merchant' | 'client';
  senderName: string;
  onClose?: () => void;
  showToast?: (msg: string) => void;
}

export const OrderInternalMessenger: React.FC<OrderInternalMessengerProps> = ({
  order,
  senderRole,
  senderName,
  onClose,
  showToast,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const messages: OrderMessage[] = order.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setIsSending(true);
    try {
      await sendOrderMessage(order.id, {
        sender: senderRole,
        senderName,
        text,
      });
      setInputText('');
      if (showToast) {
        showToast('💬 Mensaje enviado con éxito');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Canned quick replies for merchants
  const merchantQuickReplies = [
    '🍳 ¡Tu pedido ya está en preparación en cocina!',
    '🛵 El cadete ya salió en camino hacia tu domicilio.',
    '⏱️ Demora estimada: unos 15 a 20 minutos.',
    '❓ ¿Podrías confirmarnos timbre o número de casa?',
    '✅ ¡Pedido listo y empaquetado para despacho!',
    '🙏 ¡Gracias por tu compra! Buen provecho.',
  ];

  // Canned quick replies for clients
  const clientQuickReplies = [
    '👋 Hola, ¿cuánto tiempo aproximado de demora tienen?',
    '📍 Estoy en el timbre 2do B, aviso por las dudas.',
    '🥤 ¿Tienen aderezos extra (mayonesa / kétchup)?',
    '💳 Pago con billete de $10.000 / $20.000 si tienen cambio.',
  ];

  const quickReplies = senderRole === 'merchant' ? merchantQuickReplies : clientQuickReplies;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[420px] max-h-[75vh] overflow-hidden animate-fadeIn">
      {/* Messenger Header */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-white">
                Mensajería Interna • Pedido #{order.orderNumber || order.id.slice(-5)}
              </h4>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                En Vivo
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {senderRole === 'merchant' ? (
                <>Chat directo con el cliente <strong>{order.clientName}</strong></>
              ) : (
                <>Chat directo con el comercio <strong>{order.merchantName}</strong></>
              )}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 stroke-1" />
            <p className="text-xs font-bold text-slate-600">
              No hay mensajes aún en este pedido.
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              {senderRole === 'merchant'
                ? 'Puedes responder consultas o avisarle al cliente el estado de su preparación o despacho.'
                : 'Puedes consultar demoras o dar indicaciones de entrega al comercio.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === senderRole;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400 font-bold px-1">
                  {msg.sender === 'merchant' ? (
                    <span className="text-orange-600 flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      {msg.senderName}
                    </span>
                  ) : (
                    <span className="text-blue-600 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {msg.senderName}
                    </span>
                  )}
                  <span>•</span>
                  <span>
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs font-medium leading-relaxed break-words shadow-2xs ${
                    isMe
                      ? 'bg-orange-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Canned Quick Replies Strip */}
      <div className="p-2 bg-slate-100/90 border-t border-slate-200/80 shrink-0">
        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 mb-1 px-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Respuestas Rápidas (1 clic):</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              disabled={isSending}
              onClick={() => handleSendMessage(reply)}
              className="text-[11px] font-bold text-slate-700 bg-white hover:bg-orange-50 hover:text-orange-700 border border-slate-200 px-2.5 py-1 rounded-xl whitespace-nowrap shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            senderRole === 'merchant'
              ? 'Escribe una respuesta para el cliente...'
              : 'Escribe tu consulta para el local...'
          }
          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-md shadow-orange-600/30 active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
