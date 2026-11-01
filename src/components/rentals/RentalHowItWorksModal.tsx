import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Upload, Calculator, HelpCircle, Ticket } from 'lucide-react';
import { subscribeRentalPlatformFee, subscribeConvenioConfig, DEFAULT_CONVENIO, ConvenioConfig } from '../../lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: Tab;
  onOpenPublish?: () => void;
}

type Tab = 'alquilar' | 'publicar' | 'precios' | 'preguntas';

const money = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;

const Step: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <li className="flex gap-3">
    <span className="w-7 h-7 shrink-0 rounded-full bg-orange-600 text-white text-sm font-black flex items-center justify-center">{n}</span>
    <div className="pt-0.5">
      <p className="font-black text-slate-900 text-sm">{title}</p>
      <div className="text-[13px] text-slate-600 leading-relaxed mt-0.5">{children}</div>
    </div>
  </li>
);

export const RentalHowItWorksModal: React.FC<Props> = ({ isOpen, onClose, initialTab = 'alquilar', onOpenPublish }) => {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [fee, setFee] = useState(0.05);
  const [convenio, setConvenio] = useState<ConvenioConfig>(DEFAULT_CONVENIO);
  const [daily, setDaily] = useState(10000);
  const [days, setDays] = useState(3);

  useEffect(() => subscribeRentalPlatformFee(setFee), []);
  useEffect(() => subscribeConvenioConfig(setConvenio), []);
  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const feePct = Math.round(fee * 100);
  const subtotal = daily * days;
  const feeAmount = Math.round(subtotal * fee);
  const ownerNet = subtotal - feeAmount;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'alquilar', label: 'Quiero alquilar', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'publicar', label: 'Quiero publicar', icon: <Upload className="w-4 h-4" /> },
    { id: 'precios', label: 'Precios y comisión', icon: <Calculator className="w-4 h-4" /> },
    { id: 'preguntas', label: 'Preguntas', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black text-orange-600 uppercase tracking-wider">Guía de ServiGo Alquiler</p>
            <h2 className="text-xl font-black text-slate-900">¿Cómo funciona?</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 pt-3 flex gap-1 overflow-x-auto border-b border-slate-100">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3 py-2 rounded-t-xl text-xs font-black flex items-center gap-1.5 border-b-2 ${
                tab === t.id ? 'border-orange-600 text-orange-700 bg-orange-50' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {tab === 'alquilar' && (
            <ol className="space-y-4">
              <Step n={1} title="Creá tu cuenta gratis">
                Tocá <b>Ingresar</b> arriba a la derecha y entrá con tu cuenta de Google o con tu email y una contraseña. Mirar el catálogo no requiere cuenta; reservar sí.
              </Step>
              <Step n={2} title="Buscá lo que necesitás">
                Filtrá por categoría y localidad. En cada publicación ves el precio por día, la garantía, qué incluye y si el dueño ofrece envío.
              </Step>
              <Step n={3} title="Reservá">
                Elegí las fechas, completá nombre, teléfono y DNI, y aceptá el contrato de alquiler. Antes de pagar ves el total exacto.
              </Step>
              <Step n={4} title="Pagá con Mercado Pago">
                Se hacen dos pagos: el <b>alquiler</b> y la <b>garantía</b>. La reserva queda confirmada sola cuando Mercado Pago aprueba el pago.
              </Step>
              <Step n={5} title="Retirá el producto">
                Coordiná por WhatsApp el retiro con el dueño, o pedí un cadete si ofrece envío. El dueño completa el <b>acta de entrega</b> con fotos y vos la revisás y firmás desde <b>Mis alquileres</b>. Si algo no coincide, anotalo antes de firmar.
              </Step>
              <Step n={6} title="Devolvelo y recuperá tu garantía">
                Devolvelo en la fecha acordada y registrá el <b>acta de devolución</b> con fotos. Cuando el dueño la firma conforme, la garantía se reintegra a tu medio de pago
                y recibís un <b>cupón de {convenio.percent}% OFF en Ferretería Bruzzone</b>.
              </Step>
            </ol>
          )}

          {tab === 'publicar' && (
            <div className="space-y-5">
              <ol className="space-y-4">
                <Step n={1} title="Ingresá con tu cuenta">
                  Publicar es gratis. Solo necesitás una cuenta de Google o email.
                </Step>
                <Step n={2} title="Tocá «Publicar Producto»">
                  Completá tus datos (nombre, DNI y WhatsApp) y después los del producto: título claro, categoría, descripción, estado y qué accesorios incluye.
                </Step>
                <Step n={3} title="Subí hasta 3 fotos reales">
                  Fotos propias, con buena luz, que muestren el producto completo y funcionando. Son lo primero que mira quien alquila.
                </Step>
                <Step n={4} title="Poné precio y garantía">
                  Precio por día, precio semanal opcional y la garantía. Como referencia, una garantía de entre el 30% y el 50% de lo que te costaría reponerlo.
                </Step>
                <Step n={5} title="Elegí cómo cobrar">
                  En <b>Mi Billetera</b> vinculá tu cuenta de Mercado Pago y cobrás cada alquiler directo, con la comisión ya descontada. Si no la vinculás,
                  lo cobrado se acumula en tu billetera de ServiGo y pedís la transferencia a tu CBU o alias.
                </Step>
                <Step n={6} title="Entregá y recibí de vuelta">
                  Al entregar, completá el <b>acta de entrega</b> (checklist y fotos) y el inquilino la firma. Al devolverlo, revisá el <b>acta de devolución</b>:
                  firmá conforme para cerrar, o <b>Reportar daño</b> si volvió roto o incompleto. La garantía cubre el arreglo hasta su monto.
                </Step>
              </ol>
              {onOpenPublish && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPublish();
                  }}
                  className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm"
                >
                  Publicar mi producto
                </button>
              )}
            </div>
          )}

          {tab === 'precios' && (
            <div className="space-y-5">
              <ul className="space-y-2 text-[13px] text-slate-700">
                <li>✅ <b>Publicar es gratis.</b> No hay abono mensual.</li>
                <li>✅ <b>Comisión de ServiGo: {feePct}% del alquiler</b>, solo cuando se concreta. Nunca se cobra sobre la garantía.</li>
                <li>✅ <b>Garantía:</b> la paga quien alquila y se devuelve completa si el producto vuelve bien.</li>
                <li>ℹ️ <b>Mercado Pago</b> cobra su propio costo por procesar el pago, según el plazo de acreditación que tenga el dueño en su cuenta. Ese costo no lo fija ServiGo.</li>
                <li>⏰ <b>Atrasos:</b> cada día de demora se cobra el 150% del precio diario, descontado de la garantía.</li>
                <li>
                  🎟️ <b>Beneficio Ferretería Bruzzone:</b> cada alquiler que termina bien le da al inquilino y al dueño un cupón de {convenio.percent}% OFF,
                  válido por {convenio.validDays} días.
                </li>
              </ul>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="font-black text-slate-900 text-sm">Calculá cuánto cobrás</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[11px] font-bold text-slate-500">
                    Precio por día
                    <input
                      type="number"
                      min={0}
                      value={daily}
                      onChange={(e) => setDaily(Math.max(0, Number(e.target.value)))}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm"
                    />
                  </label>
                  <label className="text-[11px] font-bold text-slate-500">
                    Días
                    <input
                      type="number"
                      min={1}
                      value={days}
                      onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm"
                    />
                  </label>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-slate-600">Paga quien alquila</span><b>{money(subtotal)}</b></div>
                  <div className="flex justify-between"><span className="text-slate-600">Comisión ServiGo ({feePct}%)</span><span>− {money(feeAmount)}</span></div>
                  <div className="flex justify-between pt-1 border-t border-slate-200"><span className="font-black text-emerald-700">Recibís vos</span><b className="text-emerald-700">{money(ownerNet)}</b></div>
                  <p className="text-[11px] text-slate-500">Antes del costo de Mercado Pago. La garantía no entra en la cuenta: se devuelve.</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'preguntas' && (
            <div className="space-y-4 text-[13px]">
              {[
                ['¿Qué pasa si se rompe?', 'El dueño reporta el daño al recibirlo y la garantía cubre la reparación o la pieza faltante, hasta su monto. Si el daño es mayor, la diferencia queda a cargo de quien alquiló según el contrato aceptado.'],
                ['¿Qué pasa si no lo devuelven?', 'Desde el día siguiente al vencimiento corre la mora del 150% diario. A los 5 días sin devolución se retiene la garantía completa, la cuenta queda bloqueada y el dueño cuenta con los datos del contrato para hacer la denuncia.'],
                ['¿Cuándo me devuelven la garantía?', 'Cuando el dueño confirma que el producto volvió bien. El reintegro lo hace Mercado Pago al mismo medio con el que pagaste; los plazos dependen de ese medio.'],
                ['¿ServiGo es dueño de los productos?', 'No. ServiGo conecta a vecinos y comercios que alquilan sus cosas, cobra el pago de forma segura y guarda la garantía mientras dura el alquiler.'],
                ['¿Cómo uso el cupón de Ferretería Bruzzone?', 'Lo ves en «Mis cupones». Mostrá el código en el mostrador de Ferretería Bruzzone antes de pagar. Es de un solo uso y vence a los ' + convenio.validDays + ' días.'],
              ].map(([q, a]) => (
                <details key={q} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <summary className="font-black text-slate-900 cursor-pointer">{q}</summary>
                  <p className="text-slate-600 mt-2 leading-relaxed">{a}</p>
                </details>
              ))}
              <p className="text-[12px] text-slate-500 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-orange-600" /> ¿Otra duda? Escribinos por WhatsApp a Ferretería Bruzzone.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
