// import { useState, type FormEvent } from "react";
// import { useOutletContext } from "react-router-dom";
// import { useSeo } from "../hooks/useSeo";
// import { useToast } from "../hooks/useToast";
// import type { SiteSettings } from "../types";
// import { PageHero, Section } from "../components/ui";
// import { errMsg, safeUrl } from "../lib/utils";

// export default function Contact() {
//   useSeo("Aloqa", "ITEX IT to‘garagi bilan bog‘laning: manzil, telefon, Telegram va aloqa formasi.");
//   const settings = useOutletContext<SiteSettings | null>();
//   const toast = useToast();
//   const [name, setName] = useState("");
//   const [contact, setContact] = useState("");
//   const [message, setMessage] = useState("");
//   const [trap, setTrap] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const tg = safeUrl(settings?.telegram_url);
//   const map = safeUrl(settings?.map_embed_url);
//   const hasAny = Boolean(settings?.phone || settings?.email || tg);

//   async function onSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     if (trap) return;
//     if (name.trim().length < 2 || contact.trim().length < 5 || message.trim().length < 5) {
//       setError("Ism, aloqa uchun telefon yoki email va xabarni to‘ldiring.");
//       return;
//     }
//     setBusy(true);
//     try {
//       const res = await fetch("/.netlify/functions/contact", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name: name.trim(), contact: contact.trim(), message: message.trim() }),
//       });
//       if (!res.ok) {
//         const j = (await res.json().catch(() => ({}))) as { error?: string };
//         throw new Error(j.error ?? "Xabarni yuborib bo‘lmadi. Keyinroq urinib ko‘ring.");
//       }
//       toast.success("Xabaringiz yuborildi. Rahmat!");
//       setName("");
//       setContact("");
//       setMessage("");
//     } catch (err) {
//       setError(errMsg(err));
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <>
//       <PageHero title="Aloqa" text="7-sonli umumiy o‘rta ta’lim maktabi IT to‘garagi" />
//       <Section>
//         <div className="grid grid-2">
//           <div className="card">
//             <h2>Ma’lumotlar</h2>
//             <dl className="contact-list">
//               <div>
//                 <dt>Manzil</dt>
//                 <dd>{settings?.address ?? "Andijon viloyati, Baliqchi tumani, Barkamol MFY"}</dd>
//               </div>
//               {settings?.phone && (
//                 <div>
//                   <dt>Telefon</dt>
//                   <dd>
//                     <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
//                   </dd>
//                 </div>
//               )}
//               {settings?.email && (
//                 <div>
//                   <dt>Email</dt>
//                   <dd>
//                     <a href={`mailto:${settings.email}`}>{settings.email}</a>
//                   </dd>
//                 </div>
//               )}
//               {tg && (
//                 <div>
//                   <dt>Telegram</dt>
//                   <dd>
//                     <a href={tg} target="_blank" rel="noopener noreferrer">
//                       {tg.replace(/^https?:\/\//, "")}
//                     </a>
//                   </dd>
//                 </div>
//               )}
//             </dl>
//             {!hasAny && <p className="muted small">Telefon, email va Telegram hali kiritilmagan. Administrator ularni sozlamalardan qo‘shadi.</p>}
//           </div>

//           <form className="form card" onSubmit={onSubmit} noValidate>
//             <h2>Xabar yuborish</h2>
//             <div className="field">
//               <label htmlFor="c-name">Ismingiz</label>
//               <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" />
//             </div>
//             <div className="field">
//               <label htmlFor="c-contact">Telefon yoki email</label>
//               <input id="c-contact" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={120} />
//             </div>
//             <div className="field">
//               <label htmlFor="c-msg">Xabar</label>
//               <textarea id="c-msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1500} />
//             </div>
//             <div className="hp" aria-hidden="true">
//               <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
//             </div>
//             {error && (
//               <p className="form-error" role="alert">
//                 {error}
//               </p>
//             )}
//             <button className="btn btn-primary" type="submit" disabled={busy}>
//               {busy ? "Yuborilmoqda..." : "Xabarni yuborish"}
//             </button>
//           </form>
//         </div>

//         {map && (
//           <div className="map">
//             <iframe title="Joylashuv xaritasi" src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin" />
//           </div>
//         )}
//       </Section>
//     </>
//   );
// }
