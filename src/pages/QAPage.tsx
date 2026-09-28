import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';

interface FAQItem {
  id: string;
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
  category: 'general' | 'cooler' | 'match';
}

export const QAPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [openId, setOpenId] = useState<string | null>('q1');
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'cooler' | 'match'>('all');

  const faqs: FAQItem[] = [
    {
      id: 'q1',
      category: 'general',
      questionBn: 'এটা কি সবার জন্যই সম্পূর্ণ ফ্রি?',
      questionEn: 'Is registration 100% Free for all teams?',
      answerBn: 'হ্যাঁ, MEMO X Free Fire Championship টুর্নামেন্টে অংশগ্রহণ ও স্লট বুকিং সম্পূর্ণ ১০০% ফ্রি! বাংলাদেশের যেকোনো ফ্রি ফায়ার স্কোয়াড কোনো প্রকার এন্ট্রি ফি ছাড়াই এতে অংশ নিতে পারবে। কোনো হিডেন চার্জ নেই।',
      answerEn: 'Yes! Tournament entry and slot booking is 100% completely free for all Free Fire squads in Bangladesh. There are zero entry fees or hidden charges.',
    },
    {
      id: 'q2',
      category: 'cooler',
      questionBn: 'MEMO গেমিং ফোন কুলার কি সবাই ফ্রিতে নিতে পারবে?',
      questionEn: 'Can anyone get the Free MEMO Semiconductor Phone Cooler?',
      answerBn: 'হ্যাঁ, বাংলাদেশের যে কেউ এই রেফারেল রিওয়ার্ড ক্যাম্পেইনে অংশ নিয়ে সম্পূর্ণ ফ্রিতে MEMO DL05 সেমিকন্ডাক্টর ফোন কুলার রিওয়ার্ড আনলক করতে পারবেন। কোনো টাকা দিতে হবে না।',
      answerEn: 'Yes, anyone can participate in the milestone reward campaign and unlock the MEMO DL05 Semiconductor Phone Cooler entirely free of charge.',
    },
    {
      id: 'q3',
      category: 'cooler',
      questionBn: 'কীভাবে ফ্রি গেমিং কুলার পাওয়া যাবে ও কীভাবে বন্ধুদের রেফার করবেন?',
      questionEn: 'How to get the Free Phone Cooler & how does referral work?',
      answerBn: 'Cooler পেজে গিয়ে আপনার নিজস্ব রেফারেল / শেয়ার লিংকটি কপি করুন। সেই লিংকটি আপনার বন্ধুদের টিম, ফেসবুক গ্রুপ, ইউটিউব, হোয়াটসঅ্যাপ বা টেলিগ্রাম গ্রুপে শেয়ার করুন। আপনার লিংকের মাধ্যমে ২০ জন বন্ধু বা টিম ভিজিট ও রেজিস্ট্রেশন সম্পন্ন করলেই ফ্রি কুলার ক্লেইম করার বাটন আনলক হবে। এরপর আপনার ডেলিভারি ঠিকানা দিলে সারাদেশে সম্পূর্ণ ফ্রি কুরিয়ার হোম ডেলিভারিতে কুলারটি পৌঁছে যাবে।',
      answerEn: 'Go to the Cooler tab and copy your personal invite link. Share it on Facebook, YouTube, WhatsApp, or Telegram. Once 20 teams visit and register through your link, the claim button unlocks. Submit your shipping address to receive free doorstep courier delivery anywhere in Bangladesh.',
    },
    {
      id: 'q4',
      category: 'match',
      questionBn: 'টুর্নামেন্টের কাস্টম রুম আইডি ও পাসওয়ার্ড (Room ID & Password) কোথায় দেওয়া হবে?',
      questionEn: 'Where will tournament Custom Room ID & Password be shared?',
      answerBn: 'রেজিস্ট্রেশন সফল হওয়ার পর অবশ্যই আমাদের অফিসিয়াল হোয়াটসঅ্যাপ ও টেলিগ্রাম গ্রুপে জয়েন থাকতে হবে। ম্যাচের নির্দিষ্ট সময়ের পূর্বে গ্রুপেই কাস্টম রুম আইডি এবং পাসওয়ার্ড জানিয়ে দেওয়া হবে। গ্রুপে যুক্ত না থাকলে টুর্নামেন্টে অংশ নেওয়া সম্ভব হবে না।',
      answerEn: 'Room IDs and passwords are exclusively broadcast inside the official WhatsApp and Telegram community groups before match kickoffs. Being a group member is strictly mandatory.',
    },
    {
      id: 'q5',
      category: 'general',
      questionBn: 'একটি ডিভাইস বা অ্যাকাউন্ট থেকে কয়টি টিম রেজিস্ট্রেশন করা যাবে?',
      questionEn: 'How many teams can register per device or Google account?',
      answerBn: 'টুর্নামেন্টের ফেয়ার প্লে এবং সকল দলের সমান সুযোগ নিশ্চিত করার জন্য প্রতি ডিভাইস ও অ্যাকাউন্টে ১টি মাত্র টিম স্লট রেজিস্টার করা যায়।',
      answerEn: 'To ensure strict competitive integrity and fair play, exactly 1 squad registration is permitted per hardware device and Google account.',
    },
    {
      id: 'q6',
      category: 'general',
      questionBn: 'প্রাইজপুল ৳১,৪২,০০০ কীভাবে ও কখন দেওয়া হবে?',
      questionEn: 'How and when will the ৳1,42,000 prize pool be paid out?',
      answerBn: 'গ্র্যান্ড ফাইনাল শেষ হওয়ার সাথে সাথে বিজয়ী দলগুলোকে ব্যাংক ট্রান্সফার, বিকাশ (bKash) অথবা নগদ (Nagad)-এর মাধ্যমে সরাসরি নগদ প্রাইজমানি প্রদান করা হবে।',
      answerEn: 'Prize funds are disbursed immediately after the Grand Finals directly to winning captains via Bank Transfer, bKash, or Nagad.',
    },
    {
      id: 'q7',
      category: 'match',
      questionBn: 'কোনো সমস্যা বা সাহায্যের জন্য কার সাথে যোগাযোগ করব?',
      questionEn: 'How do I contact tournament support or admins?',
      answerBn: 'যেকোনো জিজ্ঞাসা, সাহায্য বা রুলবুকের জন্য আমাদের অফিসিয়াল হোয়াটসঅ্যাপ এবং টেলিগ্রাম গ্রুপে অ্যাডমিনদের সাথে সরাসরি কথা বলতে পারেন।',
      answerEn: 'For live support, rule inquiries, or squad verification assistance, chat directly with tournament coordinators in our official WhatsApp and Telegram channels.',
    },
  ];

  const filteredFaqs = activeCategory === 'all' ? faqs : faqs.filter((f) => f.category === activeCategory);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 pb-32">
      {/* Page Title & Intro */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0D130E] border border-[#00FF66]/40 text-xs font-bold text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.15)]">
          <i className="fa-solid fa-circle-question"></i>
          <span>প্রশ্ন ও উত্তর • Q&A Hub</span>
        </div>
        <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white">
          সাধারণ প্রশ্ন ও উত্তর (Q&A)
        </h1>
        <p className="text-xs text-neutral-400 leading-relaxed">
          MEMO X Free Fire Championship টুর্নামেন্ট, ফ্রি স্লট রেজিস্ট্রেশন এবং ফ্রি গেমিং কুলার ক্যাম্পেইন সম্পর্কিত সকল সাধারণ প্রশ্নের স্পষ্ট উত্তর নিচে দেওয়া হলো।
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeCategory === 'all'
              ? 'bg-[#00FF66] text-black shadow-[0_0_12px_rgba(0,255,102,0.3)]'
              : 'bg-[#0A0A0A] border border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          সকল প্রশ্ন (All)
        </button>
        <button
          onClick={() => setActiveCategory('general')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeCategory === 'general'
              ? 'bg-[#00FF66] text-black shadow-[0_0_12px_rgba(0,255,102,0.3)]'
              : 'bg-[#0A0A0A] border border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          টুর্নামেন্ট ও স্লট (Tournament)
        </button>
        <button
          onClick={() => setActiveCategory('cooler')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeCategory === 'cooler'
              ? 'bg-[#00FF66] text-black shadow-[0_0_12px_rgba(0,255,102,0.3)]'
              : 'bg-[#0A0A0A] border border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          ফ্রি কুলার ক্যাম্পেইন (Cooler)
        </button>
        <button
          onClick={() => setActiveCategory('match')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeCategory === 'match'
              ? 'bg-[#00FF66] text-black shadow-[0_0_12px_rgba(0,255,102,0.3)]'
              : 'bg-[#0A0A0A] border border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          রুম আইডি ও গ্রুপ (Room & Group)
        </button>
      </div>

      {/* Interactive Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-[#0A0A0A] border-[#00FF66]/50 shadow-[0_4px_20px_rgba(0,255,102,0.12)]'
                  : 'bg-[#0A0A0A]/70 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              {/* Question Click Header */}
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full p-4 sm:p-5 flex items-start justify-between text-left cursor-pointer gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 ${
                      isOpen
                        ? 'bg-[#00FF66] text-black font-mono-nums'
                        : 'bg-[#0D130E] border border-neutral-800 text-neutral-400 font-mono-nums'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-white">
                      {faq.questionBn}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-inter mt-0.5">
                      {faq.questionEn}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs transition-transform duration-300 ${
                    isOpen
                      ? 'bg-[#00FF66]/20 text-[#00FF66] rotate-180'
                      : 'bg-neutral-800/60 text-neutral-400'
                  }`}
                >
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
              </button>

              {/* Expandable Answer Body */}
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs border-t border-neutral-800/80 space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-[#0D130E] border border-[#00FF66]/20 text-neutral-200 leading-relaxed font-sans">
                    <div className="flex items-center gap-1.5 text-[#00FF66] font-bold text-[11px] mb-1">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>উত্তর (Answer):</span>
                    </div>
                    {faq.answerBn}
                  </div>

                  <div className="text-[11px] text-neutral-400 leading-relaxed px-1">
                    <strong className="text-neutral-300">In English: </strong>
                    {faq.answerEn}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Official Community Quick Connect Box */}
      <div className="rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/30 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-bullhorn text-[#00FF66]"></i>
          <h3 className="font-orbitron text-sm font-bold text-white">
            অন্য কোনো প্রশ্ন আছে? আমাদের সাথে যুক্ত হন
          </h3>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          টুর্নামেন্টের যেকোনো তথ্য, লাইভ সাপোর্ট অথবা কাস্টম রুম আইডির জন্য সরাসরি আমাদের অফিসিয়াল হোয়াটসঅ্যাপ ও টেলিগ্রাম গ্রুপে যুক্ত থাকুন:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <a
            href="https://chat.whatsapp.com/IVxjtQyvceuAq8W9cTbSPW"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(37,211,102,0.25)]"
          >
            <i className="fa-brands fa-whatsapp text-base"></i>
            <span>অফিসিয়াল WhatsApp গ্রুপ</span>
          </a>

          <a
            href="https://t.me/+gKwVsvRKXrc0NjI1"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3.5 rounded-xl bg-[#0D130E] hover:bg-[#142319] border border-[#00FF66]/50 text-[#00FF66] font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-brands fa-telegram text-base"></i>
            <span>অফিসিয়াল Telegram গ্রুপ</span>
          </a>
        </div>
      </div>

      {/* Action Quick Links */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-[#00FF66] hover:bg-[#00e65c] text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.25)]"
        >
          হোম পেজ (Home)
        </button>
        <button
          onClick={() => navigate('/cooler')}
          className="px-5 py-2.5 rounded-xl bg-[#0D130E] hover:bg-[#142319] text-[#00FF66] border border-[#00FF66]/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          ফ্রি কুলার ক্যাম্পেইন (Cooler)
        </button>
      </div>
    </div>
  );
};
