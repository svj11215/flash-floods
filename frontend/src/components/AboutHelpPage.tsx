import React, { useState } from 'react';
import { useTranslation } from '../services/LanguageContext';
import {
  Phone,
  PhoneCall,
  AlertTriangle,
  HeartPulse,
  Bandage,
  Activity,
  Zap,
  Flame,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ChevronRight,
  Car,
  Home,
  Waves,
  Droplets,
  CheckSquare,
  Square,
  Navigation,
  FileText
} from 'lucide-react';

interface AboutHelpPageProps {
  onNavigateToFlashFlood?: () => void;
  onNavigateToStreetWaterlogging?: () => void;
  onNavigateToReport?: () => void;
}

interface EmergencyContact {
  number: string;
  name: string;
  role: string;
  desc: string;
  badge: string;
  primary?: boolean;
  category: 'national' | 'disaster' | 'medical' | 'civic';
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    number: '112',
    name: 'National Emergency Response (NERS)',
    role: 'All-in-One Emergency',
    desc: 'Unified dispatch for Police, Fire Brigade, Medical Ambulance, and Disaster Rescue.',
    badge: '24/7 PRIMARY',
    primary: true,
    category: 'national'
  },
  {
    number: '1078',
    name: 'NDRF Control Room',
    role: 'National Disaster Response Force',
    desc: 'Specialized swift-water flood rescue boats, deep-diving personnel, and heavy evacuation units.',
    badge: 'SPECIALIZED RESCUE',
    primary: true,
    category: 'disaster'
  },
  {
    number: '1070',
    name: 'State Disaster Management (SDMA)',
    role: 'State Flood Relief Cell',
    desc: 'Statewide relief operations, high-ground shelter coordination, and disaster command center.',
    badge: 'STATEWIDE',
    category: 'disaster'
  },
  {
    number: '1077',
    name: 'District Disaster Management (DDMA)',
    role: 'District Emergency Operations Centre',
    desc: 'Ward-level emergency response, municipal flood coordination, and local evacuation assistance.',
    badge: 'DISTRICT / WARD',
    category: 'disaster'
  },
  {
    number: '108',
    name: 'Emergency Medical Ambulance',
    role: 'Critical Care & Trauma Ambulance',
    desc: 'Rapid paramedic dispatch, trauma care, and patient transport to nearest functioning hospital.',
    badge: 'AMBULANCE',
    category: 'medical'
  },
  {
    number: '101',
    name: 'Fire & Water Rescue Brigade',
    role: 'Fire & Rescue Services',
    desc: 'Basement dewatering, rapid boat extraction from flooded lowlands, and hazardous tree clearance.',
    badge: 'FIRE & RESCUE',
    category: 'civic'
  },
  {
    number: '100',
    name: 'Police Emergency Control',
    role: 'Police Assistance & Security',
    desc: 'Traffic diversion around submerged roads, danger zone cordons, and emergency law enforcement.',
    badge: 'POLICE',
    category: 'civic'
  },
  {
    number: '1916',
    name: 'Municipal Disaster & Waterlogging Cell',
    role: 'Municipal Corporation (BMC / Local Body)',
    desc: 'De-choking storm drains, operating high-capacity dewatering pumps, and reporting open manholes.',
    badge: 'CIVIC HELPLINE',
    category: 'civic'
  }
];

export const AboutHelpPage: React.FC<AboutHelpPageProps> = () => {
  const { t } = useTranslation();
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'contacts' | 'firstaid' | 'safety' | 'kit'>('all');

  // Go-Bag Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    water: true,
    food: true,
    meds: true,
    torch: false,
    powerbank: false,
    docs: false,
    whistle: false,
    boots: false
  });

  const handleCopy = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const toggleCheckItem = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = Object.keys(checkedItems).length;
  const preparednessPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-3 sm:px-4">
      {/* 1. HEADER SECTION */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/90 text-red-400 border border-red-800/60 text-xs font-black uppercase tracking-widest font-mono shadow-xs">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>HELP & EMERGENCY SAFETY PORTAL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 font-mono tracking-tight uppercase">
          {t.aboutHelpTitle || 'EMERGENCY HELP & SAFETY'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          {t.aboutHelpDesc || 'Immediate guidance, essential first aid, unified flood & waterlogging safety protocols, and 24/7 disaster management contacts.'}
        </p>

        {/* Quick Navigation Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Overview (All)</span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Emergency Contacts</span>
          </button>
          <button
            onClick={() => setActiveTab('firstaid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'firstaid'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>First Aid Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Flood & Waterlogging Safety</span>
          </button>
          <button
            onClick={() => setActiveTab('kit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'kit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Go-Bag Checklist</span>
          </button>
        </div>
      </div>

      {/* 2. EMERGENCY CONTACT NUMBERS (DIRECT DIAL & DISASTER MANAGEMENT) */}
      {(activeTab === 'all' || activeTab === 'contacts') && (
        <section id="contacts" className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  Emergency & Disaster Management Contacts
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  24/7 Verified Toll-Free National & Municipal Hotlines. Tap any number to call directly.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>Toll-Free • 24x7 Active</span>
            </div>
          </div>

          {/* Quick Notice: What to tell the operator */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white uppercase tracking-wider font-mono">When Calling For Rescue:</span>
                <span className="text-slate-300 ml-1.5">
                  State your exact GPS location / landmark, approximate water height, count of trapped individuals, and any medical urgency.
                </span>
              </div>
            </div>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EMERGENCY_CONTACTS.map((contact) => (
              <div
                key={contact.number}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  contact.primary
                    ? 'bg-gradient-to-b from-red-50/90 to-red-100/50 border-red-300 shadow-xs ring-1 ring-red-200'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-md ${
                      contact.primary
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {contact.badge}
                    </span>
                    <button
                      onClick={() => handleCopy(contact.number)}
                      title="Copy phone number"
                      className="text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
                    >
                      {copiedNumber === contact.number ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div>
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
                      {contact.number}
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">
                      {contact.name}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {contact.role}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60">
                    {contact.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60">
                  <a
                    href={`tel:${contact.number}`}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                      contact.primary
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {contact.number}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. EMERGENCY FIRST AID SECTION */}
      {(activeTab === 'all' || activeTab === 'firstaid') && (
        <section id="firstaid" className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  Emergency First Aid Guide
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Critical medical response procedures for flood water inhalation, cold shock, electric hazard, and wounds.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold self-start sm:self-auto">
              <Bandage className="w-3.5 h-3.5" />
              <span>Life-Saving Protocols</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Protocol 1: Drowning & Water Inhalation / CPR */}
            <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sky-800 font-mono font-black text-xs uppercase tracking-wider">
                  <Waves className="w-4 h-4" />
                  <span>1. Drowning & Water Inhalation (CPR Protocol)</span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Unresponsive Victim Retrieved From Floodwater
                </h3>

                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">1</span>
                    <span><strong>Check Response & Breathing:</strong> Place ear near mouth; check if chest rises. If unresponsive and not breathing normally, shout for someone to call <strong>112 / 108</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">2</span>
                    <span><strong>Hands-Only CPR:</strong> Place hands in center of chest. Push hard and fast (100–120 compressions per min, 2 inches deep) until paramedics arrive or AED is applied.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">3</span>
                    <span><strong>Recovery Position:</strong> If victim breathes, turn them onto their side so fluids, silt, and vomit drain freely from the airway without choking.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800">
                <strong>⚠️ Never:</strong> Do NOT perform abdominal thrusts (Heimlich) on drowning victims. It induces regurgitation into the lungs.
              </div>
            </div>

            {/* Protocol 2: Electric Shock & Submerged Cables */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-mono font-black text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>2. Electric Shock & Submerged Wiring Exposure</span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Fallen Street Poles, Transformers & Flooded Meters
                </h3>

                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">1</span>
                    <span><strong>DO NOT Touch Victim Directly:</strong> If they are in standing water or touching wiring, you will be electrocuted instantly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">2</span>
                    <span><strong>Isolate Power:</strong> Turn off main circuit breaker (MCB) immediately. If outdoors, push wires away using dry wooden broom or plastic pole.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">3</span>
                    <span><strong>Cover Burns:</strong> Check breathing and pulse. Cover electrical entry/exit burns with clean, sterile dry cloth. Rush to hospital.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-[11px] text-amber-900">
                <strong>⚠️ Caution:</strong> Assume all downed street cables and flooded sub-stations are live until certified dead by electrical engineers.
              </div>
            </div>

            {/* Protocol 3: Hypothermia & Cold Exposure */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-800 font-mono font-black text-xs uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  <span>3. Hypothermia & Cold Water Exposure</span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Prolonged Soaking in Cold Flood Currents
                </h3>

                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">1</span>
                    <span><strong>Strip Wet Clothes:</strong> Gently remove all wet, clinging clothes immediately in a sheltered dry area.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">2</span>
                    <span><strong>Warm Core First:</strong> Wrap victim in dry woolen blankets, coats, or emergency thermal space blanket. Keep head covered.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">3</span>
                    <span><strong>Warm Fluids:</strong> If alert and able to swallow, offer warm sweetened tea or clear soup. Avoid direct high-heat fire or scalding baths.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-indigo-100/70 border border-indigo-300 rounded-xl text-[11px] text-indigo-900">
                <strong>⚠️ Never:</strong> Do NOT rub frostbitten hands or feet, and NEVER give alcohol, which accelerates hypothermia.
              </div>
            </div>

            {/* Protocol 4: Snakebite & Venomous Creatures */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-mono font-black text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>4. Snakebite & Venomous Creatures (Surge Floods)</span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Displaced Reptiles Seeking Dry High Ground
                </h3>

                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">1</span>
                    <span><strong>Immobilize Limb:</strong> Keep victim calm and still. Slower pulse rate drastically delays venom spread through the lymphatic system.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">2</span>
                    <span><strong>Remove Constrictions:</strong> Take off rings, bangles, watches, or tight socks before swelling occurs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">3</span>
                    <span><strong>Immediate Transport:</strong> Rush to civil hospital with Anti-Snake Venom (ASV). Note snake's color and head shape if safely seen.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800">
                <strong>⚠️ Deadly Myths:</strong> Do NOT cut the puncture, do NOT suck venom, and do NOT apply tight tourniquets or herbal pastes.
              </div>
            </div>

            {/* Protocol 5: Open Wounds, Contaminated Water & Leptospirosis */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 text-slate-800 font-mono font-black text-xs uppercase tracking-wider">
                  <Bandage className="w-4 h-4 text-emerald-600" />
                  <span>5. Open Wounds, Cuts & Infection Prevention (Leptospirosis)</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  Waterborne Pathogen Defense
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                    <span>Flush Immediately</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Wash floodwater-exposed cuts with clean bottled/boiled water and soap or povidone-iodine antiseptic for at least 3 minutes.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                    <span>Sterile Dressing</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Apply firm direct pressure with clean gauze to stop bleeding. Wrap with a waterproof sterile bandage to prevent re-exposure.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                    <span>Tetanus & Medical Rx</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Obtain a Tetanus Toxoid (TT) shot within 24 hours. In flood zones, consult a doctor for preventive Leptospirosis medication (Doxycycline).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. UNIFIED SAFETY DETAILS: FLOOD & WATERLOGGING (SINGLE COMMON SECTION) */}
      {(activeTab === 'all' || activeTab === 'safety') && (
        <section id="safety" className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  Flood & Street Waterlogging Safety Guidelines
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Unified critical safety rules for both river flood surges and urban street water stagnation.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Universal Citizen Protocols</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pillar 1: Pedestrian & Street Safety */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-mono font-bold text-xs uppercase tracking-wider">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Pillar 1: Road & Pedestrian Safety</span>
              </div>
              <h3 className="text-base font-black text-slate-900 font-mono">
                "Turn Around, Don't Drown" Rule
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>6 Inches (15 cm):</strong> Moving floodwater has enough kinetic power to knock a strong adult off their feet.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>12 Inches (30 cm):</strong> Standing or rushing water will float small hatchbacks and sedans, causing steering loss.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Open Manhole Danger:</strong> During heavy waterlogging, municipal drain covers frequently pop open due to water backpressure. Never step into brown water without probing ahead with a solid stick.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Drainage Suction:</strong> Stay clear of roadside culverts, stormwater drains, and canal banks where underwater suction is fatal.</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2: Vehicle Trapped in Rising Water */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-mono font-bold text-xs uppercase tracking-wider">
                <Car className="w-4 h-4 text-amber-600" />
                <span>Pillar 2: Vehicle Escape Protocol</span>
              </div>
              <h3 className="text-base font-black text-slate-900 font-mono">
                If Water Enters Your Car or Stalls Engine
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">1.</span>
                  <span><strong>Unbuckle Immediately:</strong> Release seatbelts for yourself and all passengers, especially children in child seats.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">2.</span>
                  <span><strong>Open Windows Fast:</strong> Roll down windows immediately before water enters the door panel and shorts electrical power motors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">3.</span>
                  <span><strong>Escape Through Window:</strong> External water pressure makes pushing doors open virtually impossible until water equalizes. Climb out via the window.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">4.</span>
                  <span><strong>Roof Refuge:</strong> Climb onto vehicle roof if water is fast-moving. It keeps you above the current and visible to rescue personnel.</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3: Home & Building Protection */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-mono font-bold text-xs uppercase tracking-wider">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Pillar 3: Home & Electrical Hazard Control</span>
              </div>
              <h3 className="text-base font-black text-slate-900 font-mono">
                When Inundation Threatens Your Residence
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Shut Off Main Breaker:</strong> Trip the main MCB power switch and turn off the LPG cylinder regulator valve if water begins entering the building.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Vertical Evacuation:</strong> Move to upper floors or the terrace. <strong>Never</strong> trap yourself in an attic or closed ceiling crawlspace with no external roof exit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Signal For Help:</strong> Tie a bright colored cloth or bedsheet to your balcony, blow a whistle, or flash a flashlight toward rescue boats at night.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Sanitary Precautions:</strong> Plug low-lying ground-floor toilet drains and sink outlets to prevent contaminated sewage backflow.</span>
                </li>
              </ul>
            </div>

            {/* Pillar 4: Post-Flood Health & Water Safety */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-mono font-bold text-xs uppercase tracking-wider">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>Pillar 4: Post-Flood Sanitation & Hygiene</span>
              </div>
              <h3 className="text-base font-black text-slate-900 font-mono">
                Waterborne Disease & Sludge Defense
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">•</span>
                  <span><strong>Boil All Water:</strong> Tap and well lines become cross-contaminated with flood sewage. Boil drinking water for at least 3 minutes, or use chlorine purification tablets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">•</span>
                  <span><strong>Discard Food:</strong> Throw out all open food items, vegetables, dairy, or medicines that came into contact with floodwater.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">•</span>
                  <span><strong>Protective Gear:</strong> Wear thick rubber gumboots and heavy rubber gloves when shoveling mud or debris to prevent leptospirosis, rusty nail punctures, and hidden scorpion/snake bites.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">•</span>
                  <span><strong>Electrical Certification:</strong> Do NOT turn on flooded electrical appliances or wall sockets until certified dry and safe by an electrician.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 5. EMERGENCY SURVIVAL GO-BAG CHECKLIST */}
      {(activeTab === 'all' || activeTab === 'kit') && (
        <section id="kit" className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  Emergency Survival Kit (Go-Bag Checklist)
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Pack these essential items in an easily accessible waterproof backpack before monsoons begin.
                </p>
              </div>
            </div>

            {/* Preparedness Score Badge */}
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Readiness Score</div>
                <div className="text-xs font-black font-mono text-slate-900">
                  {completedCount} / {totalCount} Items ({preparednessPct}%)
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center">
                {preparednessPct}%
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                key: 'water',
                title: 'Clean Drinking Water',
                desc: '3 Liters per person per day (3-day minimum) + ORS rehydration packets.'
              },
              {
                key: 'food',
                title: 'Dry Ready-to-Eat Food',
                desc: 'High-calorie energy bars, roasted chana, dry fruits, and glucose biscuits.'
              },
              {
                key: 'meds',
                title: 'Prescription Meds & First Aid',
                desc: '7-day supply of daily medications, band-aids, antiseptic cream, and pain relievers.'
              },
              {
                key: 'torch',
                title: 'Waterproof LED Torch',
                desc: 'High-lumen flashlight with extra batteries or solar-charging backup.'
              },
              {
                key: 'powerbank',
                title: 'Charged Power Bank',
                desc: '20,000mAh mobile power bank in a sealed waterproof ziplock with cables.'
              },
              {
                key: 'docs',
                title: 'Waterproof Document Pouch',
                desc: 'Aadhaar, IDs, property deeds, insurance policies, and essential cash.'
              },
              {
                key: 'whistle',
                title: 'High-Decibel Whistle',
                desc: 'Whistles penetrate ambient flood rain sound 5x farther than yelling for rescue.'
              },
              {
                key: 'boots',
                title: 'Rain Gear & Rubber Boots',
                desc: 'Sturdy gumboots to shield against broken glass and rain ponchos for warmth.'
              }
            ].map((item) => (
              <div
                key={item.key}
                onClick={() => toggleCheckItem(item.key)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  checkedItems[item.key]
                    ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {checkedItems[item.key] ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className={`text-xs font-bold leading-tight ${checkedItems[item.key] ? 'text-blue-950 font-black' : 'text-slate-800'}`}>
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER NOTICE */}
      <div className="text-center space-y-1 text-xs text-slate-500 pt-4 border-t border-slate-200">
        <p className="font-semibold text-slate-700">
          JalRakshak Disaster Resilience • Official Citizen Emergency & Safety Support System
        </p>
        <p className="text-[11px] text-slate-400">
          In an active high-risk flood event, follow all instructions given over public address systems by local district authorities and police.
        </p>
      </div>
    </div>
  );
};
