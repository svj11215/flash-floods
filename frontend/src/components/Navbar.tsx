import React, { useState } from 'react';
import {
  ShieldAlert,
  Home,
  Camera,
  Bell,
  Radio,
  RefreshCw,
  Menu,
  X,
  Waves,
  Construction,
  Sliders,
  HelpCircle,
  Globe
} from 'lucide-react';
import { useTranslation, type Language } from '../services/LanguageContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  activeScenario: string;
  onScenarioChange: (scenario: string) => void;
  activeAlertsCount: number;
  lastUpdated: string;
  lastObservedTime?: string;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onOpenReportModal: () => void;
  onOpenAlertRegistration?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isDemoMode,
  setIsDemoMode,
  activeScenario,
  onScenarioChange,
  activeAlertsCount,
  lastUpdated,
  lastObservedTime,
  isRefreshing = false,
  onRefresh,
  onOpenReportModal,
  onOpenAlertRegistration
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  const navTabs = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'flash-flood', label: t.navFlashFlood, icon: Waves, isFlash: true },
    { id: 'street-waterlogging', label: t.navStreetWaterlogging, icon: Construction, isStreet: true },
    { id: 'report', label: t.navReport, icon: Camera, isReport: true },
    { id: 'simulator', label: t.navSimulator, icon: Sliders },
    { id: 'about', label: t.navAboutHelp, icon: HelpCircle }
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Utility Status Bar */}
      <div className={`px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-medium transition-colors ${
        !isDemoMode ? 'bg-slate-950 text-slate-200 border-b border-emerald-950/40' : 'bg-slate-900 text-slate-300'
      }`}>
        <div className="flex items-center gap-3">
          {!isDemoMode ? (
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/50" />
              <span className="text-emerald-400 font-black uppercase tracking-wider text-[11px] font-mono">
                {t.liveDataActive}
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-300 text-[11px] hidden md:inline">
                {t.source}: <b className="text-white">IMD CAP</b> + <b className="text-white">Open-Meteo</b>
              </span>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                {t.observed}: <span className="text-emerald-300 font-mono font-bold">{lastObservedTime || lastUpdated}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 font-black uppercase tracking-wider text-[11px] font-mono">
                {t.demoModeActive}
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                {t.controlledParameters}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Selector (English, Hindi, Marathi) */}
          <div className="flex items-center bg-slate-800 rounded-lg px-2 py-0.5 border border-slate-700 text-[11px]">
            <Globe className="w-3.5 h-3.5 text-sky-400 mr-1.5 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-hidden text-[11px]"
              aria-label={t.selectLanguage}
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
            </select>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 shadow-xs">
            <button
              onClick={() => setIsDemoMode(false)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                !isDemoMode
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Real External Weather & Government Observations"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${!isDemoMode ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              <span>{t.liveDataBtn}</span>
            </button>
            <button
              onClick={() => setIsDemoMode(true)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                isDemoMode
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Demonstration Scenario Testing Mode"
            >
              <span>⚙</span>
              <span>{t.demoDataBtn}</span>
            </button>
          </div>

          {/* Quick Scenario Selector (Visible in Demo Mode) */}
          {isDemoMode && (
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md border border-slate-700 text-[11px]">
              <span className="text-amber-400 font-bold">{t.scenario}:</span>
              <select
                value={activeScenario}
                onChange={(e) => onScenarioChange(e.target.value)}
                className="bg-transparent text-amber-200 font-semibold focus:outline-hidden cursor-pointer text-[11px]"
              >
                <option value="scenario_2_drainage_blockage" className="bg-slate-900 text-amber-300">
                  {t.scenarioBlockedDrain}
                </option>
                <option value="scenario_1_heavy_rainfall" className="bg-slate-900 text-red-300">
                  {t.scenarioCloudburst}
                </option>
                <option value="baseline" className="bg-slate-900 text-slate-200">
                  {t.scenarioNominal}
                </option>
              </select>
            </div>
          )}

          <button
            onClick={onRefresh}
            title="Refresh external data sources"
            disabled={isRefreshing}
            className={`p-1.5 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden xl:inline">{isRefreshing ? t.syncing : t.refreshBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-700 to-sky-600 flex items-center justify-center text-white shadow-md group-hover:shadow-indigo-500/25 transition">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none font-mono">
              {t.appName}
            </h1>
            <p className="text-[11px] font-bold text-sky-700 tracking-normal mt-0.5">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs: Structured 7 Core Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
          {navTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            // Dynamic styling based on system
            let activeClass = 'bg-white text-slate-900 shadow-xs border border-slate-200';
            if (isActive) {
              if (item.isFlash) activeClass = 'bg-blue-600 text-white shadow-xs font-black';
              else if (item.isStreet) activeClass = 'bg-amber-600 text-white shadow-xs font-black';
              else if (item.isReport) activeClass = 'bg-red-700 text-white shadow-xs font-black';
            }

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? activeClass
                    : item.isReport
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${
                  isActive ? 'text-white' : item.isReport ? 'text-white' : 'text-slate-500'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dedicated Authority Access Button & Emergency Alert Registration */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {onOpenAlertRegistration && (
            <button
              onClick={onOpenAlertRegistration}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer font-mono"
              title="Register for RESQ Emergency Flash Flood Alerts"
            >
              <Bell className="w-3.5 h-3.5 animate-pulse" />
              <span>🚨 Alert Registration</span>
            </button>
          )}

          <button
            onClick={() => setCurrentTab('response-center')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              currentTab === 'response-center'
                ? 'bg-slate-900 text-sky-300 border-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="Municipal Responders & DEOC Authority Dashboard"
          >
            <Radio className={`w-3.5 h-3.5 ${currentTab === 'response-center' ? 'text-sky-400' : 'text-slate-500'}`} />
            <span>{t.navAuthority}</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle & Quick Report */}
        <div className="flex items-center gap-2 lg:hidden">
          {onOpenAlertRegistration && (
            <button
              onClick={onOpenAlertRegistration}
              className="p-1.5 bg-red-600 text-white rounded-lg shadow-xs cursor-pointer"
              title="Register for Emergency Alerts"
            >
              <Bell className="w-4 h-4 animate-pulse" />
            </button>
          )}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t.navReport}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown (Section 13 Strict Requirements) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          {onOpenAlertRegistration && (
            <button
              onClick={() => {
                onOpenAlertRegistration();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Bell className="w-4 h-4 animate-pulse" />
              <span>🚨 REGISTER FOR EMERGENCY ALERTS</span>
            </button>
          )}
          {/* Two Large Stacked Cards for Mobile */}
          <div className="space-y-2.5 pb-3 border-b border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
              TWO MONITORING ENGINES
            </div>

            {/* 1. FLASH FLOOD MOBILE CARD */}
            <div
              onClick={() => handleTabClick('flash-flood')}
              className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                currentTab === 'flash-flood'
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300/40'
                  : 'bg-slate-50 border-slate-200 hover:bg-blue-50/50'
              }`}
            >
              <div>
                <h3 className="text-sm font-black text-slate-900 font-mono flex items-center gap-1.5">
                  <span>🌊 FLASH FLOOD</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Monitor flood risk and early warnings.
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-black font-mono shadow-xs">
                OPEN
              </span>
            </div>

            {/* 2. STREET WATERLOGGING MOBILE CARD */}
            <div
              onClick={() => handleTabClick('street-waterlogging')}
              className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                currentTab === 'street-waterlogging'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300/40'
                  : 'bg-slate-50 border-slate-200 hover:bg-amber-50/50'
              }`}
            >
              <div>
                <h3 className="text-sm font-black text-slate-900 font-mono flex items-center gap-1.5">
                  <span>🚧 STREET WATERLOGGING</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Check flooded roads and blocked drains.
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-600 text-white rounded-xl text-xs font-black font-mono shadow-xs">
                OPEN
              </span>
            </div>
          </div>

          {/* Standard Navigation Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
            <button
              onClick={() => handleTabClick('home')}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                currentTab === 'home' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.navHome}</span>
            </button>

            <button
              onClick={() => handleTabClick('report')}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                currentTab === 'report' ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.navReport}</span>
            </button>

            <button
              onClick={() => handleTabClick('simulator')}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                currentTab === 'simulator' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.navSimulator}</span>
            </button>

            <button
              onClick={() => handleTabClick('about')}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 col-span-2 ${
                currentTab === 'about' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.navAboutHelp}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setCurrentTab('response-center');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                <span>{t.navAuthority}</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded font-bold">
                EOC
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
