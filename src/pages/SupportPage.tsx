import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  ShieldAlert,
  Send,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bot,
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  // Live Agent Simulation
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Akwaaba! I am Akosua from the Rich Money Accra support desk. How can I assist you with your Ghana account, deposits, or demo growth simulator today?',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const faqs = [
    {
      q: 'Why is the 30% daily growth rate strictly labeled as DEMO MODE?',
      a: 'In financial markets, a 30% compounding daily return would represent an impossible geometric explosion (turning GH₵500 into millions in weeks). Real financial instruments licensed by the Securities and Exchange Commission (SEC Ghana) and Bank of Ghana (BoG) typically yield 15%-25% per annum. Rich Money provides the 30% simulator strictly for educational demonstration. Simulated demo profits can never be withdrawn as real money.',
    },
    {
      q: 'What is the minimum withdrawal threshold and how does it work?',
      a: 'The minimum withdrawal threshold is GH₵100.00. For demo accounts, the portal evaluates whether your simulated balance is under or over GH₵100 and shows the corresponding regulatory notice. For real accounts, withdrawals require verified legitimate funds of at least GH₵100.00.',
    },
    {
      q: 'How do Mobile Money (MoMo) sandbox deposits work?',
      a: 'Our sandbox payment gateway simulates standard USSD approval prompts (*170# for MTN MoMo, *110# for Telecel Cash). In compliance with anti-fraud rules, balances are never credited based solely on user screenshots or claims; every transaction is authenticated through the server settlement endpoint.',
    },
    {
      q: 'Why is Ghana Card (GHA) verification required for large payouts?',
      a: 'Under the Anti-Money Laundering Act, 2020 (Act 1044) and Bank of Ghana directives, financial platforms operating in Ghana must identify customers using the National Identification Authority (NIA) Ghana Card before disbursing substantial funds.',
    },
    {
      q: 'How are real funds segregated from demo simulator funds?',
      a: 'Rich Money maintains completely isolated ledgers. Your Real Balance reflects verified external deposits and legitimate withdrawals, while your Demo Balance holds simulated training credits that never mix with real fiat.',
    },
  ];

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketMessage('');
      setTicketSent(false);
    }, 4000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMsgs = [
      ...chatMessages,
      { sender: 'user' as const, text: userText, time: 'Just now' },
    ];
    setChatMessages(newMsgs);
    setChatInput('');

    // Simulated Smart Support Agent Response
    setTimeout(() => {
      let reply = 'Thank you for reaching out! Our team in Airport City, Accra is reviewing your query.';
      const lower = userText.toLowerCase();

      if (lower.includes('withdraw') || lower.includes('payout')) {
        reply = 'Remember that the minimum withdrawal threshold is GH₵100.00. Demo withdrawals demonstrate the system and do not move real money, whereas real withdrawals are sent to your verified MoMo wallet.';
      } else if (lower.includes('deposit') || lower.includes('momo') || lower.includes('mtn')) {
        reply = 'You can deposit starting from GH₵10 via MTN Mobile Money (*170#), Telecel Cash (*110#), or Card. In test mode, authorize the prompt in the sandbox window!';
      } else if (lower.includes('30%') || lower.includes('rate') || lower.includes('profit')) {
        reply = 'The 30% daily rate is purely an educational growth simulation (New = Previous × 1.30). It is not a guaranteed real investment return, and demo profits cannot be withdrawn.';
      } else if (lower.includes('kyc') || lower.includes('ghana card')) {
        reply = 'You can verify your Ghana Card in your Profile tab using your GHA-XXXXXXXXX-X number to unlock higher withdrawal limits.';
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'agent' as const, text: reply, time: 'Just now' },
      ]);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Support & Compliance Center</h1>
        <p className="text-sm text-slate-300">
          Investor assistance, regulatory disclosures, and Ghanaian customer care
        </p>
      </div>

      {/* QUICK CONTACT CHANNELS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0b1528] border border-slate-800 space-y-2">
          <Phone className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Telephone Support</h3>
          <p className="text-xs text-slate-400 font-mono">+233 (0) 30 200 4880</p>
          <p className="text-[11px] text-slate-500">Mon - Fri: 8:00 AM - 5:00 PM GMT</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0b1528] border border-slate-800 space-y-2">
          <Mail className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Email Inquiries</h3>
          <p className="text-xs text-slate-400 font-mono">support@richmoney.gh</p>
          <p className="text-[11px] text-slate-500">24/7 Ticket response team</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0b1528] border border-slate-800 space-y-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Accra Headquarters</h3>
          <p className="text-xs text-slate-400">Airport City, Accra, Ghana</p>
          <p className="text-[11px] text-slate-500">Compliance & Operations Unit</p>
        </div>
      </div>

      {/* CHAT AGENT & TICKET SUBMISSION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Live Chat Assistant (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0b1528] border border-slate-700/80 shadow-xl overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 bg-[#070e1b] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  AK
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-slate-950" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Akosua · Rich Money Support Desk</h4>
                <p className="text-[10px] text-emerald-400">Accra Support Team · Online</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">GH Live Chat</span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#050b14]/50">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-500 px-1 mt-0.5">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSendChatMessage} className="p-3 bg-[#070e1b] border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about deposits, withdrawals, or 30% demo..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Ticket Submission (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0b1528] border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Submit Official Ticket
            </h3>
          </div>

          {ticketSent ? (
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Ticket Submitted!</h4>
              <p className="text-xs text-slate-400">
                Ticket #TK-{Math.floor(100000 + Math.random() * 900000)} has been queued. Our Accra compliance desk will respond via your registered email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendTicket} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Deposit confirmation inquiry"
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Detail your request or inquiry..."
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Send Support Ticket
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0b1528] border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
