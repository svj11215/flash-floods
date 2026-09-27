import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  // Common / Brand
  appName: string;
  tagline: string;
  systemSubtitle: string;
  knowRiskActEarly: string;
  
  // Navigation tabs
  navHome: string;
  navFlashFlood: string;
  navStreetWaterlogging: string;
  navReport: string;
  navSimulator: string;
  navAboutHelp: string;
  navAuthority: string;
  
  // Status Bar
  liveDataActive: string;
  demoModeActive: string;
  source: string;
  observed: string;
  controlledParameters: string;
  liveDataBtn: string;
  demoDataBtn: string;
  scenario: string;
  refreshBtn: string;
  syncing: string;
  selectLanguage: string;
  
  // Scenarios
  scenarioBlockedDrain: string;
  scenarioCloudburst: string;
  scenarioNominal: string;
  
  // Landing Page
  portalBadge: string;
  flashFloodCardTitle: string;
  flashFloodCardSubtitle: string;
  regionalWardScale: string;
  monitorLabel: string;
  heavyRainfall: string;
  soilSaturation: string;
  terrainSlope: string;
  riverWaterLevels: string;
  historicalRisk: string;
  viewFlashFloodBtn: string;
  
  streetWaterloggingTitle: string;
  streetWaterloggingSubtitle: string;
  streetWaterloggingCardTitle: string;
  streetWaterloggingCardSubtitle: string;
  roadStreetScale: string;
  drainCapacity: string;
  drainBlockage: string;
  roadWaterDepth: string;
  waterloggingTrend: string;
  citizenReportsLabel: string;
  viewWaterloggingBtn: string;
  
  currentStatusHeading: string;
  selectedWard: string;
  activeWarningBadge: string;
  estimatedTime: string;
  affectedRoadsCount: string;
  reportWaterloggingBtn: string;
  openInteractiveMapBtn: string;
  
  // Flash Flood Warning & Timeline
  flashFloodMonitorTitle: string;
  flashFloodMonitorDesc: string;
  spreadSimulationTitle: string;
  spreadSimulationDesc: string;
  checkLocationSafetyBtn: string;
  startSimulation: string;
  pause: string;
  resume: string;
  replay: string;
  now: string;
  plus30min: string;
  plus1hr: string;
  plus2hr: string;
  waterSpreadRadius: string;
  expectedDepth: string;
  impactedStreets: string;
  recommendedAction: string;
  activeFlashWarningHeadline: string;
  warningStatusNormal: string;
  noActiveFlashWarning: string;
  noActiveFlashWarningDesc: string;
  warningTimelineTitle: string;
  affectedRegionalZone: string;
  whatYouShouldDoNow: string;
  issuedByAuthority: string;
  
  // Street Waterlogging Page & Diagnosis
  streetWaterloggingMonitorTitle: string;
  streetWaterloggingMonitorDesc: string;
  roadStatusFilterAll: string;
  roadStatusFilterCritical: string;
  roadStatusFilterHigh: string;
  roadStatusFilterModerate: string;
  roadStatusFilterClear: string;
  hydraulicDiagnosisTitle: string;
  hydraulicDiagnosisSubtitle: string;
  primaryCause: string;
  cloggingLevel: string;
  citizenReported: string;
  dispatchCrews: string;
  reportIssueBtn: string;
  allRoadsPassable: string;
  noSevereWaterloggingReported: string;
  noSevereWaterloggingDesc: string;
  streetPatrolActive: string;
  
  // Report Form
  reportHazardTitle: string;
  reportHazardSubtitle: string;
  reportTypeStreet: string;
  reportTypeFlood: string;
  selectLocation: string;
  roadOrStreetName: string;
  hazardType: string;
  descriptionPlaceholder: string;
  takeOrUploadPhoto: string;
  useMyLocation: string;
  gpsPinned: string;
  submitReportBtn: string;
  submitting: string;
  reportSubmittedSuccess: string;
  reportDispatchedMsg: string;
  backToHome: string;
  submitAnotherReport: string;
  
  // Hospital & Emergency Capacity
  hospitalPanelTitle: string;
  hospitalPanelDesc: string;
  sortByDistance: string;
  sortByAvailability: string;
  sortByAccessibility: string;
  accessibleOnly: string;
  statusAvailable: string;
  statusLimited: string;
  statusFull: string;
  emergencyBeds: string;
  icuBeds: string;
  ambulanceAvailable: string;
  ambulanceDelayed: string;
  openGoogleMaps: string;
  
  // Authority & Response Center
  authorityCenterTitle: string;
  eocOperations: string;
  eocNotice: string;
  activeAlerts: string;
  operationalChecklist: string;
  dispatchAction1: string;
  dispatchAction2: string;
  dispatchAction3: string;
  dispatchAction4: string;
  
  // Common Risk Levels
  riskLow: string;
  riskModerate: string;
  riskHigh: string;
  riskCritical: string;
  safe: string;
  danger: string;
  warning: string;
  
  // Safety Modal
  locationSafetyTitle: string;
  locationSafetyDesc: string;
  searchCityVillage: string;
  useCurrentGps: string;
  safeStatusTitle: string;
  highRiskStatusTitle: string;
  whatYouShouldDo: string;
  close: string;
  
  // About / Help Page
  aboutHelpTitle: string;
  aboutHelpDesc: string;
  twoSystemsHeading: string;
  twoSystemsDesc: string;
  emergencyHelplines: string;
  nationalDisasterHelpline: string;
  policeAmbulance: string;
  stateDisasterHelpline: string;
  whatToDoIfTrapped: string;
  safetyRule1: string;
  safetyRule2: string;
  safetyRule3: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'JALRAKSHAK',
    tagline: '“Know the risk. Act early.”',
    systemSubtitle: 'Disaster Early Warning System',
    knowRiskActEarly: 'Know the risk. Act early.',
    
    navHome: 'Home',
    navFlashFlood: '🌊 Flash Flood',
    navStreetWaterlogging: '🚧 Street Waterlogging',
    navReport: 'Report',
    navSimulator: 'Simulator',
    navAboutHelp: 'Help',
    navAuthority: 'AUTHORITY',
    
    liveDataActive: '● LIVE DATA ACTIVE',
    demoModeActive: '⚙ DEMO / SIMULATION MODE',
    source: 'Source',
    observed: 'Observed',
    controlledParameters: 'Controlled parameters • Not live data',
    liveDataBtn: 'LIVE DATA',
    demoDataBtn: 'DEMO DATA',
    scenario: 'Scenario',
    refreshBtn: 'Refresh',
    syncing: 'Syncing...',
    selectLanguage: 'Language',
    
    scenarioBlockedDrain: '⚠️ Blocked Drain (Ward 12)',
    scenarioCloudburst: '🌧️ Cloudburst (Ward 04)',
    scenarioNominal: '☀️ Normal Clear Weather',
    
    portalBadge: 'Community Disaster Early Warning Portal',
    flashFloodCardTitle: '🌊 FLASH FLOOD',
    flashFloodCardSubtitle: 'River & Valley Flood Risk',
    regionalWardScale: 'REGIONAL / VALLEY SCALE',
    monitorLabel: 'Monitors:',
    heavyRainfall: 'Heavy rain & cloudburst',
    soilSaturation: 'Wet soil & water buildup',
    terrainSlope: 'Steep hills & slopes',
    riverWaterLevels: 'River water rise & surge',
    historicalRisk: 'Past flood records',
    viewFlashFloodBtn: 'VIEW FLASH FLOOD',
    
    streetWaterloggingTitle: '🚧 STREET WATERLOGGING',
    streetWaterloggingSubtitle: 'Road & Street Water Stagnation',
    streetWaterloggingCardTitle: '🚧 STREET WATERLOGGING',
    streetWaterloggingCardSubtitle: 'Road & Street Water Stagnation',
    roadStreetScale: 'ROAD / STREET SCALE',
    drainCapacity: 'Drain size & water capacity',
    drainBlockage: 'Blocked drains & trash',
    roadWaterDepth: 'Water depth on road',
    waterloggingTrend: 'Water rising or going down',
    citizenReportsLabel: 'People reports & pictures',
    viewWaterloggingBtn: 'VIEW STREET WATERLOGGING',
    
    currentStatusHeading: 'Current Live Status & Warnings',
    selectedWard: 'Selected Area',
    activeWarningBadge: 'ACTIVE WARNING',
    estimatedTime: 'Estimated Time',
    affectedRoadsCount: 'Roads with water problem',
    reportWaterloggingBtn: 'Report Water on Road',
    openInteractiveMapBtn: 'Open Map',
    
    flashFloodMonitorTitle: 'Flash Flood Safety Monitoring',
    flashFloodMonitorDesc: 'Watch river water levels, rainfall, and where flood water may spread.',
    spreadSimulationTitle: 'Flood Water Spread Simulation',
    spreadSimulationDesc: 'See where water could flow step-by-step in the next 1 to 2 hours.',
    checkLocationSafetyBtn: 'Am I Safe Right Now? (Check My Location)',
    startSimulation: 'Play Spread Animation',
    pause: 'Pause',
    resume: 'Resume',
    replay: 'Replay Animation',
    now: 'Now',
    plus30min: '+30 Min',
    plus1hr: '+1 Hour',
    plus2hr: '+2 Hours',
    waterSpreadRadius: 'Estimated Flood Spread Area',
    expectedDepth: 'Water Depth',
    impactedStreets: 'Streets at Risk',
    recommendedAction: 'What You Should Do Now',
    activeFlashWarningHeadline: 'FLASH FLOOD WARNING',
    warningStatusNormal: 'STATUS: NORMAL',
    noActiveFlashWarning: '✓ NO ACTIVE FLASH FLOOD WARNING',
    noActiveFlashWarningDesc: 'Current river flows and rain remain within safe levels across all areas.',
    warningTimelineTitle: 'WARNING TIMELINE & WATER PROGRESSION',
    affectedRegionalZone: 'AFFECTED FLOOD ZONE',
    whatYouShouldDoNow: 'WHAT YOU SHOULD DO NOW:',
    issuedByAuthority: 'Issued by Disaster Management & Early Warning Control Room (Call 112)',
    
    streetWaterloggingMonitorTitle: 'Street Waterlogging & Choked Drains',
    streetWaterloggingMonitorDesc: 'Live road water status, clogged gutters, and drain diagnosis.',
    roadStatusFilterAll: 'All Roads',
    roadStatusFilterCritical: 'Deep Water (High Danger)',
    roadStatusFilterHigh: 'Waterlogged',
    roadStatusFilterModerate: 'Minor Water',
    roadStatusFilterClear: 'Clear & Safe',
    hydraulicDiagnosisTitle: 'Why is this road flooded? (Drain Diagnosis)',
    hydraulicDiagnosisSubtitle: 'Underground drain analysis & waterlogging timing forecast',
    primaryCause: 'Main Reason',
    cloggingLevel: 'Drain Blockage',
    citizenReported: 'Reports from Citizens',
    dispatchCrews: 'Clean / Action Plan',
    reportIssueBtn: 'Report Water / Blocked Drain',
    allRoadsPassable: 'ROAD STATUS: ALL PASSABLE',
    noSevereWaterloggingReported: '✓ NO SEVERE ROAD WATERLOGGING REPORTED',
    noSevereWaterloggingDesc: 'Main city roads and market streets are clear for driving and walking.',
    streetPatrolActive: 'Street Monitoring Active',
    
    reportHazardTitle: 'Report Flood or Waterlogged Road',
    reportHazardSubtitle: 'Help authorities and your neighbors know about dangerous water immediately.',
    reportTypeStreet: 'Road Water / Choked Drain',
    reportTypeFlood: 'River Surge / Flash Flood',
    selectLocation: 'Select Ward / Village',
    roadOrStreetName: 'Road or Landmark Name',
    hazardType: 'What is happening?',
    descriptionPlaceholder: 'Tell us simple details (e.g. water is up to knees, drain is fully blocked with trash)...',
    takeOrUploadPhoto: 'Add a Photo (Optional)',
    useMyLocation: 'Use My GPS Location',
    gpsPinned: 'Location Found',
    submitReportBtn: 'Send Alert Report',
    submitting: 'Sending Report...',
    reportSubmittedSuccess: 'Report Sent Successfully!',
    reportDispatchedMsg: 'Your alert has been sent to the city control room and shown on the live map.',
    backToHome: 'Back to Home',
    submitAnotherReport: 'Report Another Location',
    
    hospitalPanelTitle: 'Nearby Emergency Hospitals & Road Access',
    hospitalPanelDesc: 'Check open hospitals, free emergency beds, and whether roads to them are clear or flooded.',
    sortByDistance: 'Sort: Closest First',
    sortByAvailability: 'Sort: Most Beds Free',
    sortByAccessibility: 'Sort: Clearest Roads',
    accessibleOnly: 'Show Only Accessible Roads',
    statusAvailable: 'OPEN & BEDS AVAILABLE',
    statusLimited: 'BUSY / FEW BEDS',
    statusFull: 'ALMOST FULL',
    emergencyBeds: 'Free Emergency Beds',
    icuBeds: 'Free ICU Beds',
    ambulanceAvailable: 'Ambulance Access: CLEAR',
    ambulanceDelayed: 'Ambulance Access: WATER ON ROAD',
    openGoogleMaps: 'Open Directions in Google Maps',
    
    authorityCenterTitle: 'AUTHORITY DISASTER CONTROL ROOM',
    eocOperations: 'EOC Emergency Operations',
    eocNotice: 'Official responder command console for monitoring pump teams, roadblocks, and warnings.',
    activeAlerts: 'Active Incident Alerts',
    operationalChecklist: 'Standard Action Checklist',
    dispatchAction1: 'Deploy suction machine to clear choked culverts',
    dispatchAction2: 'Place road barriers and divert traffic away from deep water',
    dispatchAction3: 'Send broadcast SMS to residents in low-lying zones',
    dispatchAction4: 'Coordinate ambulance standby with nearest hospital',
    
    riskLow: 'Low Risk',
    riskModerate: 'Moderate Risk',
    riskHigh: 'High Risk',
    riskCritical: 'Critical Danger',
    safe: 'Safe',
    danger: 'Danger',
    warning: 'Warning',
    
    locationSafetyTitle: 'Real-Time Location Safety Check',
    locationSafetyDesc: 'Check instant rain, flood risk, and simple safety steps for any location.',
    searchCityVillage: 'Search city, town, or village...',
    useCurrentGps: 'Use Current Phone / Device GPS',
    safeStatusTitle: 'Currently Safe (Low Flood Risk)',
    highRiskStatusTitle: 'Warning: High Water Risk',
    whatYouShouldDo: 'Important Steps to Stay Safe',
    close: 'Close',
    
    aboutHelpTitle: 'EMERGENCY HELP & SAFETY',
    aboutHelpDesc: 'Immediate guidance, essential first aid, unified flood & waterlogging safety protocols, and 24/7 disaster management contacts.',
    twoSystemsHeading: 'Two Simple Systems for Your Safety',
    twoSystemsDesc: 'Flash floods in rivers need evacuation to higher ground, while street waterlogging requires avoiding flooded roads and clearing gutters.',
    emergencyHelplines: 'Emergency Helplines (24/7 Free)',
    nationalDisasterHelpline: 'Emergency Services (All India)',
    policeAmbulance: 'Disaster Relief Helpline',
    stateDisasterHelpline: 'State Disaster Helpline',
    whatToDoIfTrapped: 'What To Do If Water Rises Rapidly',
    safetyRule1: 'Never walk or drive through moving water. Even 6 inches of water can knock you down.',
    safetyRule2: 'If you live near a river or low area, immediately move to higher ground or upper floors.',
    safetyRule3: 'Turn off your main electricity switch if water begins entering your house.'
  },

  hi: {
    appName: 'जल रक्षक',
    tagline: '“खतरे को जानें, समय रहते सुरक्षित रहें।”',
    systemSubtitle: 'बाढ़ एवं जलभराव चेतावनी प्रणाली',
    knowRiskActEarly: 'खतरे को पहचानें। समय पर कदम उठाएं।',
    
    navHome: 'होम',
    navFlashFlood: '🌊 अचानक बाढ़ (Flash Flood)',
    navStreetWaterlogging: '🚧 सड़कों पर जलभराव',
    navReport: 'समस्या बताएं (Report)',
    navSimulator: 'परीक्षण (Simulator)',
    navAboutHelp: 'मदद',
    navAuthority: 'कंट्रोल रूम (Authority)',
    
    liveDataActive: '● वास्तविक मौसम डेटा सक्रिय',
    demoModeActive: '⚙ अभ्यास / टेस्ट मोड',
    source: 'स्रोत',
    observed: 'समय',
    controlledParameters: 'परीक्षण डेटा • वास्तविक नहीं',
    liveDataBtn: 'लाइव डेटा',
    demoDataBtn: 'टेस्ट मोड',
    scenario: 'स्थिति',
    refreshBtn: 'ताज़ा करें',
    syncing: 'अपडेट हो रहा है...',
    selectLanguage: 'भाषा',
    
    scenarioBlockedDrain: '⚠️ नाला बंद (वार्ड 12)',
    scenarioCloudburst: '🌧️ भारी बारिश / बादल फटना (वार्ड 04)',
    scenarioNominal: '☀️ सामान्य मौसम (साफ़)',
    
    portalBadge: 'नागरिक सुरक्षा एवं बाढ़ चेतावनी पोर्टल',
    flashFloodCardTitle: '🌊 अचानक बाढ़ (Flash Flood)',
    flashFloodCardSubtitle: 'नदी और घाटी में बाढ़ का खतरा',
    regionalWardScale: 'क्षेत्रीय एवं नदी स्तर पर',
    monitorLabel: 'यह प्रणाली देखती है:',
    heavyRainfall: 'बहुत तेज़ बारिश और बादल फटना',
    soilSaturation: 'ज़मीन में भरा पानी और गीली मिट्टी',
    terrainSlope: 'पहाड़ी ढलान और बहाव',
    riverWaterLevels: 'नदी का बढ़ता जलस्तर',
    historicalRisk: 'पिछली बाढ़ का इतिहास',
    viewFlashFloodBtn: 'बाढ़ की स्थिति देखें',
    
    streetWaterloggingTitle: '🚧 सड़कों पर पानी भरना',
    streetWaterloggingSubtitle: 'सड़कों और चौराहों पर जलभराव',
    streetWaterloggingCardTitle: '🚧 सड़कों पर पानी भरना',
    streetWaterloggingCardSubtitle: 'सड़कों और चौराहों पर जलभराव',
    roadStreetScale: 'सड़क एवं गली स्तर पर',
    drainCapacity: 'नालों की चौड़ाई और क्षमता',
    drainBlockage: 'कचरे से बंद पड़े नाले',
    roadWaterDepth: 'सड़क पर पानी की गहराई',
    waterloggingTrend: 'पानी बढ़ रहा है या घट रहा है',
    citizenReportsLabel: 'लोगों की शिकायतें और फ़ोटो',
    viewWaterloggingBtn: 'सड़क का जलभराव देखें',
    
    currentStatusHeading: 'वर्तमान स्थिति और चेतावनियां',
    selectedWard: 'चुना हुआ क्षेत्र',
    activeWarningBadge: 'सक्रिय चेतावनी',
    estimatedTime: 'अनुमानित समय',
    affectedRoadsCount: 'जलभराव वाली सड़कें',
    reportWaterloggingBtn: 'सड़क पर पानी की सूचना दें',
    openInteractiveMapBtn: 'नक्शा देखें',
    
    flashFloodMonitorTitle: 'बाढ़ सुरक्षा एवं निगरानी',
    flashFloodMonitorDesc: 'नदी का जलस्तर, बारिश और अगले कुछ घंटों में पानी कहां फैलेगा, यहां देखें।',
    spreadSimulationTitle: 'पानी फैलने का अनुमान (एनीमेशन)',
    spreadSimulationDesc: 'देखें अगले 1 से 2 घंटे में पानी किन-किन इलाकों में जा सकता है।',
    checkLocationSafetyBtn: 'क्या मेरा इलाका सुरक्षित है? (लोकेशन जांचें)',
    startSimulation: 'एनीमेशन चलाएं',
    pause: 'रोकें',
    resume: 'फिर शुरू करें',
    replay: 'दोबारा देखें',
    now: 'अभी (Now)',
    plus30min: '+30 मिनट बाद',
    plus1hr: '+1 घंटा बाद',
    plus2hr: '+2 घंटे बाद',
    waterSpreadRadius: 'अनुमानित जल फैलाव क्षेत्र',
    expectedDepth: 'पानी की गहराई',
    impactedStreets: 'प्रभावित होने वाली सड़कें',
    recommendedAction: 'आपको अभी क्या करना चाहिए',
    activeFlashWarningHeadline: 'अचानक बाढ़ की चेतावनी',
    warningStatusNormal: 'स्थिति: सामान्य',
    noActiveFlashWarning: '✓ कोई सक्रिय बाढ़ चेतावनी नहीं',
    noActiveFlashWarningDesc: 'सभी नदियों का बहाव और वर्षा का स्तर सुरक्षित सीमा में है।',
    warningTimelineTitle: 'समय अनुसार चेतावनी एवं पानी का फैलाव',
    affectedRegionalZone: 'प्रभावित बाढ़ क्षेत्र',
    whatYouShouldDoNow: 'आपको अभी क्या करना चाहिए:',
    issuedByAuthority: 'आपदा प्रबंधन एवं चेतावनी नियंत्रण कक्ष द्वारा जारी (कॉल 112)',
    
    streetWaterloggingMonitorTitle: 'सड़कों पर पानी और बंद नाले',
    streetWaterloggingMonitorDesc: 'सड़क पर पानी की लाइव स्थिति, बंद नालों की पहचान और राहत कार्य।',
    roadStatusFilterAll: 'सभी सड़कें',
    roadStatusFilterCritical: 'गंभीर जलभराव (खतरा)',
    roadStatusFilterHigh: 'ज्यादा पानी',
    roadStatusFilterModerate: 'हल्का पानी',
    roadStatusFilterClear: 'साफ़ और सुरक्षित',
    hydraulicDiagnosisTitle: 'पानी भरने का असली कारण क्या है?',
    hydraulicDiagnosisSubtitle: 'भूमिगत नाली प्रवाह जांच एवं पानी भरने के समय का अनुमान',
    primaryCause: 'मुख्य कारण',
    cloggingLevel: 'नाले में रुकावट',
    citizenReported: 'नागरिकों की रिपोर्ट',
    dispatchCrews: 'सफाई / सुधार योजना',
    reportIssueBtn: 'सड़क या नाले की शिकायत करें',
    allRoadsPassable: 'सड़क स्थिति: सभी रास्ते खुले हैं',
    noSevereWaterloggingReported: '✓ सड़कों पर गंभीर जलभराव नहीं है',
    noSevereWaterloggingDesc: 'शहर की मुख्य सड़कें और बाज़ार के रास्ते गाड़ियों व पैदल चलने के लिए साफ़ हैं।',
    streetPatrolActive: 'सड़क निगरानी दल सक्रिय',
    
    reportHazardTitle: 'बाढ़ या पानी भरने की सूचना दें',
    reportHazardSubtitle: 'आपकी एक सूचना से प्रशासन और पड़ोसियों को समय पर मदद मिल सकती है।',
    reportTypeStreet: 'सड़क पर पानी / बंद नाला',
    reportTypeFlood: 'नदी का उफान / अचानक बाढ़',
    selectLocation: 'वार्ड या गांव चुनें',
    roadOrStreetName: 'सड़क या मुख्य जगह का नाम',
    hazardType: 'वहां क्या परेशानी है?',
    descriptionPlaceholder: 'सरल शब्दों में बताएं (जैसे: घुटनों तक पानी है, नाले में कचरा फंसा है)...',
    takeOrUploadPhoto: 'फ़ोटो जोड़ें (यदि उपलब्ध हो)',
    useMyLocation: 'मेरी वर्तमान लोकेशन लें (GPS)',
    gpsPinned: 'लोकेशन मिल गई',
    submitReportBtn: 'रिपोर्ट भेजें',
    submitting: 'रिपोर्ट भेजी जा रही है...',
    reportSubmittedSuccess: 'रिपोर्ट सफलतापूर्वक दर्ज हो गई!',
    reportDispatchedMsg: 'आपकी रिपोर्ट कंट्रोल रूम को भेज दी गई है और नक़्शे पर दिखा दी गई है।',
    backToHome: 'होम पेज पर जाएं',
    submitAnotherReport: 'दूसरी जगह की रिपोर्ट दें',
    
    hospitalPanelTitle: 'नजदीकी आपातकालीन अस्पताल एवं सड़क मार्ग',
    hospitalPanelDesc: 'खुले अस्पताल, खाली इमरजेंसी बेड और वहां तक जाने वाले रास्तों की स्थिति देखें।',
    sortByDistance: 'क्रम: सबसे नजदीक',
    sortByAvailability: 'क्रम: ज्यादा बेड खाली',
    sortByAccessibility: 'क्रम: साफ़ रास्ते',
    accessibleOnly: 'केवल साफ़ रास्तों वाले अस्पताल दिखाएं',
    statusAvailable: 'उपलब्ध (बेड खाली हैं)',
    statusLimited: 'सीमित बेड बचे हैं',
    statusFull: 'अस्पताल भरा हुआ है',
    emergencyBeds: 'उपलब्ध इमरजेंसी बेड',
    icuBeds: 'उपलब्ध आईसीयू (ICU) बेड',
    ambulanceAvailable: 'एम्बुलेंस मार्ग: एकदम साफ़',
    ambulanceDelayed: 'एम्बुलेंस मार्ग: रास्ते में पानी भरा है',
    openGoogleMaps: 'गूगल मैप पर रास्ता देखें',
    
    authorityCenterTitle: 'आपदा नियंत्रण एवं कमांड सेंटर (DEOC)',
    eocOperations: 'आपातकालीन राहत एवं संचालन',
    eocNotice: 'प्रशासनिक व नगर निगम दल हेतु जल निकासी पंप और सुरक्षा नियंत्रण व्यवस्था।',
    activeAlerts: 'सक्रिय घटनाएं एवं अलर्ट',
    operationalChecklist: 'जरूरी कदम चेकलिस्ट',
    dispatchAction1: 'बंद नालों को खोलने के लिए सक्शन मशीन टीम भेजें',
    dispatchAction2: 'गहरे पानी वाली सड़कों पर बैरिकेड लगाकर यातायात मोड़ें',
    dispatchAction3: 'निचले इलाकों के नागरिकों को मोबाइल चेतावनी संदेश भेजें',
    dispatchAction4: 'नजदीकी अस्पताल में एम्बुलेंस तैयार रखें',
    
    riskLow: 'कम जोखिम (सुरक्षित)',
    riskModerate: 'मध्यम जोखिम',
    riskHigh: 'अधिक जोखिम',
    riskCritical: 'अत्यधिक खतरा (सतर्क रहें)',
    safe: 'सुरक्षित',
    danger: 'खतरा',
    warning: 'चेतावनी',
    
    locationSafetyTitle: 'मेरी जगह की सुरक्षा जांचें',
    locationSafetyDesc: 'अपने शहर या गांव का नाम डालकर तुरंत पता करें कि वहां बाढ़ का खतरा तो नहीं है।',
    searchCityVillage: 'शहर या गांव का नाम खोजें...',
    useCurrentGps: 'मोबाइल GPS से जगह जांचें',
    safeStatusTitle: 'वर्तमान में सुरक्षित (कोई बड़ा खतरा नहीं)',
    highRiskStatusTitle: 'चेतावनी: पानी भरने का बड़ा खतरा',
    whatYouShouldDo: 'सुरक्षित रहने के लिए जरूरी कदम',
    close: 'बंद करें',
    
    aboutHelpTitle: 'आपत्कालीन सहायता एवं सुरक्षा',
    aboutHelpDesc: 'प्राथमिक उपचार (First Aid), बाढ़ एवं जलभराव सुरक्षा निर्देश और 24/7 आपदा प्रबंधन हेल्पलाइन।',
    twoSystemsHeading: 'आपकी सुरक्षा के लिए दो अलग प्रणालियां',
    twoSystemsDesc: 'नदी की बाढ़ में ऊंचे स्थानों पर जाना जरूरी होता है, जबकि सड़क के जलभराव में बंद नालों की सफाई और सुरक्षित रास्तों का चयन करना होता है।',
    emergencyHelplines: 'आपातकालीन हेल्पलाइन नंबर (24/7 निशुल्क)',
    nationalDisasterHelpline: 'राष्ट्रीय आपातकालीन नंबर (सभी सेवाओं के लिए)',
    policeAmbulance: 'राज्य आपदा नियंत्रण कक्ष',
    stateDisasterHelpline: 'राज्य आपदा राहत कक्ष',
    whatToDoIfTrapped: 'यदि पानी तेजी से बढ़ने लगे तो क्या करें?',
    safetyRule1: 'बहते हुए पानी में कभी न चलें और न ही गाड़ी चलाएं। 6 इंच बहता पानी भी आपको गिरा सकता है।',
    safetyRule2: 'यदि आपका घर नदी के पास या निचले इलाके में है, तो तुरंत ऊपरी मंजिल या ऊंचे स्थान पर जाएं।',
    safetyRule3: 'यदि घर के अंदर पानी आने लगे तो बिजली का मुख्य स्विच तुरंत बंद कर दें।'
  },

  mr: {
    appName: 'जल रक्षक',
    tagline: '“धोका ओळखा, वेळेवर सुरक्षित राहा.”',
    systemSubtitle: 'पूर व पाणी साचण्याची पूर्वसूचना प्रणाली',
    knowRiskActEarly: 'धोका ओळखा. वेळेत पावले उचला.',
    
    navHome: 'मुख्य पृष्ठ',
    navFlashFlood: '🌊 अचानक येणारा पूर (Flash Flood)',
    navStreetWaterlogging: '🚧 रस्त्यांवर साचलेले पाणी',
    navReport: 'समस्या नोंदवा (Report)',
    navSimulator: 'सिम्युलेटर (Simulator)',
    navAboutHelp: 'मदत',
    navAuthority: 'नियंत्रण कक्ष (Authority)',
    
    liveDataActive: '● थेट हवामान माहिती सक्रिय',
    demoModeActive: '⚙ सराव / डेमो मोड',
    source: 'स्रोत',
    observed: 'वेळ',
    controlledParameters: 'सराव माहिती • थेट नाही',
    liveDataBtn: 'थेट डेटा',
    demoDataBtn: 'डेमो डेटा',
    scenario: 'परिस्थिती',
    refreshBtn: 'ताजे करा',
    syncing: 'अपडेट होत आहे...',
    selectLanguage: 'भाषा',
    
    scenarioBlockedDrain: '⚠️ तुंबलेला नाला (वॉर्ड 12)',
    scenarioCloudburst: '🌧️ ढगफुटी / मुसळधार पाऊस (वॉर्ड 04)',
    scenarioNominal: '☀️ नेहमीचे स्वच्छ हवामान',
    
    portalBadge: 'नागरिक सुरक्षा आणि पूर इशारा प्रणाली',
    flashFloodCardTitle: '🌊 अचानक येणारा पूर (Flash Flood)',
    flashFloodCardSubtitle: 'नदी आणि खोऱ्यातील पुराचा धोका',
    regionalWardScale: 'प्रादेशिक व नदी पातळीवर',
    monitorLabel: 'यात काय तपासले जाते:',
    heavyRainfall: 'मुसळधार पाऊस आणि ढगफुटी',
    soilSaturation: 'जमिनीतील ओलावा आणि दलदल',
    terrainSlope: 'डोंगर उतार आणि पाण्याचा वेग',
    riverWaterLevels: 'नदीच्या पाण्याची वाढती पातळी',
    historicalRisk: 'मागील पुराचा इतिहास',
    viewFlashFloodBtn: 'पुराची स्थिती पहा',
    
    streetWaterloggingTitle: '🚧 रस्त्यांवर पाणी साचणे',
    streetWaterloggingSubtitle: 'शहरातील रस्त्यांवर पाणी साचणे',
    streetWaterloggingCardTitle: '🚧 रस्त्यांवर पाणी साचणे',
    streetWaterloggingCardSubtitle: 'शहरातील रस्त्यांवर पाणी साचणे',
    roadStreetScale: 'रस्ते व गल्ली पातळीवर',
    drainCapacity: 'नाल्यांची रुंदी व क्षमता',
    drainBlockage: 'कचऱ्यामुळे तुंबलेले नाले',
    roadWaterDepth: 'रस्त्यावरील पाण्याची पातळी',
    waterloggingTrend: 'पाणी वाढत आहे की कमी होत आहे',
    citizenReportsLabel: 'नागरिकांच्या तक्रारी व फोटो',
    viewWaterloggingBtn: 'साचलेले पाणी पहा',
    
    currentStatusHeading: 'सध्याची स्थिती आणि इशारे',
    selectedWard: 'निवडलेला परिसर',
    activeWarningBadge: 'सक्रिय इशारा',
    estimatedTime: 'अंदाजे वेळ',
    affectedRoadsCount: 'पाणी साचलेले रस्ते',
    reportWaterloggingBtn: 'पाणी साचल्याची माहिती द्या',
    openInteractiveMapBtn: 'नकाशा उघडा',
    
    flashFloodMonitorTitle: 'पूर सुरक्षा आणि निरीक्षण',
    flashFloodMonitorDesc: 'नदीच्या पाण्याची पातळी, पाऊस आणि पुढील काही तासांत पाणी कुठे पसरू शकते ते येथे पहा.',
    spreadSimulationTitle: 'पाणी पसरण्याचा अंदाज (ॲनिमेशन)',
    spreadSimulationDesc: 'पुढील १ ते २ तासांत पाणी कोणत्या भागात जाऊ शकते ते पहा.',
    checkLocationSafetyBtn: 'माझा परिसर सुरक्षित आहे का? (तपासा)',
    startSimulation: 'ॲनिमेशन सुरू करा',
    pause: 'थांबवा',
    resume: 'पुन्हा सुरू करा',
    replay: 'पुन्हा पहा',
    now: 'आता (Now)',
    plus30min: '+३० मिनिटांनंतर',
    plus1hr: '+१ तासानंतर',
    plus2hr: '+२ तासांनंतर',
    waterSpreadRadius: 'पाणी पसरण्याचा अंदाजे भाग',
    expectedDepth: 'पाण्याची खोली',
    impactedStreets: 'धोक्यात असलेले रस्ते',
    recommendedAction: 'तुम्ही आता काय करावे',
    activeFlashWarningHeadline: 'अचानक पुराचा इशारा',
    warningStatusNormal: 'स्थिती: सामान्य',
    noActiveFlashWarning: '✓ कोणताही सक्रिय पुराचा इशारा नाही',
    noActiveFlashWarningDesc: 'नद्यांमधील पाण्याचा प्रवाह आणि पावसाचे प्रमाण सुरक्षित मर्यादेत आहे.',
    warningTimelineTitle: 'वेळेनुसार इशारा व पाणी वाढण्याचा अंदाज',
    affectedRegionalZone: 'बाधित पूर परिसर',
    whatYouShouldDoNow: 'तुम्ही आता काय करावे:',
    issuedByAuthority: 'आपत्ती व्यवस्थापन नियंत्रण कक्षाद्वारे प्रसारित (कॉल ११२)',
    
    streetWaterloggingMonitorTitle: 'रस्त्यांवरील पाणी आणि तुंबलेले नाले',
    streetWaterloggingMonitorDesc: 'रस्त्यांवरील पाणी, तुंबलेली गटारे आणि दुरुस्तीची कामे.',
    roadStatusFilterAll: 'सर्व रस्ते',
    roadStatusFilterCritical: 'खूप जास्त पाणी (धोकादायक)',
    roadStatusFilterHigh: 'पाणी साचलेले रस्ते',
    roadStatusFilterModerate: 'कमी पाणी',
    roadStatusFilterClear: 'सुरक्षित रस्ते',
    hydraulicDiagnosisTitle: 'पाणी साचण्याचे खरे कारण काय?',
    hydraulicDiagnosisSubtitle: 'भूमिगत नाली प्रवाह तपासणी व पाणी तुंबण्याचा अंदाज',
    primaryCause: 'मुख्य कारण',
    cloggingLevel: 'नाल्यात अडकलेला कचरा',
    citizenReported: 'नागरिकांकडून आलेल्या तक्रारी',
    dispatchCrews: 'स्वच्छता / दुरुस्ती आराखडा',
    reportIssueBtn: 'पाणी साचल्याची तक्रार करा',
    allRoadsPassable: 'रस्ता स्थिती: सर्व रस्ते खुले आहेत',
    noSevereWaterloggingReported: '✓ रस्त्यांवर गंभीर पाणी साचलेले नाही',
    noSevereWaterloggingDesc: 'शहरातील मुख्य रस्ते व बाजारातील मार्ग वाहने व पादचाऱ्यांसाठी मोकळे आहेत.',
    streetPatrolActive: 'रस्ते गस्त पथक सक्रिय',
    
    reportHazardTitle: 'पूर किंवा साचलेल्या पाण्याची तक्रार करा',
    reportHazardSubtitle: 'तुमच्या एका माहितीमुळे प्रशासन आणि शेजाऱ्यांना वेळेत मदत मिळू शकते.',
    reportTypeStreet: 'रस्त्यावर पाणी / तुंबलेला नाला',
    reportTypeFlood: 'नदीचा पूर / अचानक आलेले पाणी',
    selectLocation: 'वॉर्ड किंवा गाव निवडा',
    roadOrStreetName: 'रस्ता किंवा परिसराचे नाव',
    hazardType: 'तिथे नेमकी काय अडचण आहे?',
    descriptionPlaceholder: 'सोप्या शब्दांत सांगा (उदा. गुडघाभर पाणी आहे, गटारात कचरा अडकला आहे)...',
    takeOrUploadPhoto: 'फोटो जोडा (उपलब्ध असल्यास)',
    useMyLocation: 'माझे सध्याचे ठिकाण वापरा (GPS)',
    gpsPinned: 'ठिकाण मिळाले',
    submitReportBtn: 'माहिती पाठवा',
    submitting: 'माहिती पाठवत आहे...',
    reportSubmittedSuccess: 'तक्रार यशस्वीरीत्या नोंदवली गेली!',
    reportDispatchedMsg: 'तुमची माहिती नियंत्रण कक्षाकडे पाठवण्यात आली असून नकाशावर दर्शवली आहे.',
    backToHome: 'मुख्य पानावर जा',
    submitAnotherReport: 'दुसऱ्या ठिकाणाची माहिती द्या',
    
    hospitalPanelTitle: 'जवळची रुग्णालये आणि रस्ते स्थिती',
    hospitalPanelDesc: 'उपलब्ध रुग्णालये, रिकामे आपत्कालीन खाटा आणि तिथपर्यंत जाणारे रस्ते तपासा.',
    sortByDistance: 'क्रम: सर्वात जवळचे',
    sortByAvailability: 'क्रम: जास्त खाटा उपलब्ध',
    sortByAccessibility: 'क्रम: मोकळे रस्ते',
    accessibleOnly: 'फक्त सुरक्षित रस्ते असलेले दवाखाने दाखवा',
    statusAvailable: 'उपलब्ध (खाटा रिकाम्या आहेत)',
    statusLimited: 'मर्यादित खाटा उपलब्ध',
    statusFull: 'दवाखाना पूर्ण भरला आहे',
    emergencyBeds: 'उपलब्ध आपत्कालीन खाटा',
    icuBeds: 'उपलब्ध अतिदक्षता (ICU) खाटा',
    ambulanceAvailable: 'रुग्णवाहिका मार्ग: पूर्ण मोकळा',
    ambulanceDelayed: 'रुग्णवाहिका मार्ग: रस्त्यावर पाणी साचले आहे',
    openGoogleMaps: 'गुगल मॅपवर दिशा पहा',
    
    authorityCenterTitle: 'आपत्ती नियंत्रण व कमांड सेंटर (DEOC)',
    eocOperations: 'आपत्कालीन नियंत्रण व व्यवस्थापन',
    eocNotice: 'नगरपालिका आणि मदत पथकांसाठी पाणी उपसा व सुरक्षा नियंत्रण व्यवस्था.',
    activeAlerts: 'सक्रिय इशारे आणि घटना',
    operationalChecklist: 'तात्काळ कारवाई सूची',
    dispatchAction1: 'तुंबलेले नाले मोकळे करण्यासाठी सक्शन मशीन पाठवा',
    dispatchAction2: 'पाणी साचलेल्या रस्त्यांवर बॅरिकेड्स लावून वाहतूक वळवा',
    dispatchAction3: 'सखल भागातील रहिवाशांना मोबाईलवर सतर्कतेचा इशारा पाठवा',
    dispatchAction4: 'जवळच्या रुग्णालयाशी समन्वय साधून रुग्णवाहिका सज्ज ठेवा',
    
    riskLow: 'कमी धोका (सुरक्षित)',
    riskModerate: 'मध्यम धोका',
    riskHigh: 'जास्त धोका',
    riskCritical: 'अतिधोकादायक (सतर्क राहा)',
    safe: 'सुरक्षित',
    danger: 'धोका',
    warning: 'इशारा',
    
    locationSafetyTitle: 'माझ्या परिसराची सुरक्षा तपासा',
    locationSafetyDesc: 'तुमच्या गावाचे किंवा शहराचे नाव शोधून त्वरित जाणून घ्या की तिथे पुराचा धोका आहे का.',
    searchCityVillage: 'शहर किंवा गावाचे नाव शोधा...',
    useCurrentGps: 'मोबाईल GPS द्वारे जागा तपासा',
    safeStatusTitle: 'सध्या सुरक्षित (कोणताही मोठा धोका नाही)',
    highRiskStatusTitle: 'इशारा: पाणी भरण्याचा मोठा धोका',
    whatYouShouldDo: 'सुरक्षित राहण्यासाठी महत्त्वाच्या सूचना',
    close: 'बंद करा',
    
    aboutHelpTitle: 'आपत्कालीन मदत आणि सुरक्षा',
    aboutHelpDesc: 'प्रथमोपचार (First Aid), पूर व पाणी साचणे सुरक्षा मार्गदर्शिका आणि २४/७ आपत्ती व्यवस्थापन हेल्पलाइन.',
    twoSystemsHeading: 'तुमच्या सुरक्षिततेसाठी दोन स्वतंत्र यंत्रणा',
    twoSystemsDesc: 'नदीच्या पुरात त्वरित उंच जागेवर जाणे आवश्यक असते, तर रस्त्यावरील पाण्यात तुंबलेली गटारे स्वच्छ करणे आणि सुरक्षित रस्ते निवडणे गरजेचे असते.',
    emergencyHelplines: 'तातडीचे मदत क्रमांक (२४ तास विनामूल्य)',
    nationalDisasterHelpline: 'सर्व प्रकारच्या मदतीसाठी राष्ट्रीय क्रमांक',
    policeAmbulance: 'राज्य आपत्कालीन नियंत्रण कक्ष',
    stateDisasterHelpline: 'राज्य आपत्ती निवारण कक्ष',
    whatToDoIfTrapped: 'पाणी वेगाने वाढू लागल्यास काय करावे?',
    safetyRule1: 'वाहत्या पाण्यात कधीही चालत किंवा गाडी घेऊन जाऊ नका. अवघे ६ इंच वाहते पाणीही व्यक्तीला वाहून नेऊ शकते.',
    safetyRule2: 'तुमचे घर नदीकाठी किंवा सखल भागात असल्यास लगेचच इमारतीच्या वरच्या मजल्यावर किंवा उंच ठिकाणी जा.',
    safetyRule3: 'घरात पाणी शिरू लागल्यास विजेचे मुख्य बटण (Main Switch) त्वरित बंद करा.'
  }
};

// Global statement and alert dictionary to dynamically translate any raw alert strings from backend or simulation
const STATEMENT_DICTIONARY: Record<Language, Record<string, string>> = {
  en: {},
  hi: {
    'FLASH FLOOD WARNING': 'अचानक बाढ़ की चेतावनी',
    'FLOOD WARNING': 'बाढ़ की चेतावनी',
    'FLOOD WATCH': 'बाढ़ निगरानी अलर्ट',
    'CRITICAL': 'गंभीर खतरा',
    'HIGH': 'अधिक खतरा',
    'MODERATE': 'मध्यम खतरा',
    'LOW': 'कम खतरा',
    'NEXT 1–3 HOURS': 'अगले 1–3 घंटे में',
    'NEXT 3–6 HOURS': 'अगले 3–6 घंटे में',
    'No Imminent Risk': 'अभी कोई बड़ा खतरा नहीं',
    'NOW': 'अभी (Now)',
    'Rainfall increasing': 'बारिश लगातार तेज हो रही है',
    'Soil moisture rising': 'मिट्टी में पानी पूरी तरह भर चुका है',
    'Drainage stress detected': 'नाले भर गए हैं और पानी वापस आ रहा है',
    '⚠️ HIGH FLOOD RISK': '⚠️ बाढ़ का अत्यधिक खतरा',
    '⚠️ CRITICAL FLOOD RISK': '⚠️ बाढ़ का गंभीर खतरा',
    'Moderate rainfall combined with blocked drainage is creating localized waterlogging': 'मध्यम बारिश और बंद नालों के कारण सड़कों पर पानी भर रहा है।',
    'Heavy rainfall overload exceeding local drainage capacity': 'भारी बारिश का पानी नालों की क्षमता से अधिक हो गया है।',
    'Avoid Main Market Road': 'मेन मार्केट रोड पर जाने से बचें',
    'Move away from low-lying areas and ground level shops': 'निचले इलाकों और सड़क किनारे दुकानों से ऊपर हटें',
    'Allow municipal suction crews to inspect and clear culvert': 'नगर निगम की टीम को नाला खोलने का काम करने दें',
    'Follow local authority instructions (Call 112)': 'प्रशासन और पुलिस के निर्देशों का पालन करें (कॉल 112)',
    'Avoid Valley Riverside Road and low-lying river ghats': 'नदी किनारे वाली सड़क और निचले घाटों पर न जाएं',
    'Move to designated highland emergency shelters': 'ऊंचे स्थानों या सुरक्षित राहत शिविरों में जाएं',
    'Do not walk or drive through flowing water': 'बहते हुए पानी में पैदल या वाहन से न निकलें',
    'Follow instructions from municipal emergency personnel (Call 112)': 'आपातकालीन राहत कर्मियों के निर्देशों का पालन करें (कॉल 112)',
    'Surface runoff rate escalating': 'सड़क पर पानी का बहाव तेजी से बढ़ रहा है',
    '42.0 mm/h inflow recorded': '42 मिमी/घंटा की बारिश दर्ज की गई',
    'Ground saturation at 82%': 'ज़मीन में 82% तक पानी भर चुका है',
    'Culvert efficiency down to 18% (Choked)': 'नाले में कचरा फंसने से क्षमता केवल 18% बची है',
    'Cloudburst precipitation at 110 mm/h': 'बादल फटने जैसी 110 मिमी/घंटा की बारिश',
    'Runoff velocity surging': 'पानी का बहाव बहुत तेज़ हो गया है',
    'Pore pressure saturation at 96%': 'मिट्टी में 96% पानी भर चुका है',
    'Channel capacity overwhelmed': 'नहर और नाले की क्षमता पूरी भर चुकी है',
    'Main Market Road': 'मेन मार्केट रोड',
    'Low-Lying Market Zone': 'निचला बाज़ार इलाका',
    'Station Road Culvert Ingress': 'स्टेशन रोड नाला प्रवेश द्वार',
    'Valley Riverside Road': 'वैली रिवरसाइड रोड',
    'Lower Ghat Terraces': 'निचले नदी घाट',
    'Bridge Ingress Approach': 'पुल का पहुंच मार्ग',
    'Routine Telemetry Active': 'मौसम निगरानी सक्रिय',
    'SDMA Monitoring Active': 'राज्य आपदा निगरानी सक्रिय',
    
    // Statuses & Hazard Types
    'ALL CLEAR': 'सब सुरक्षित',
    '1 ACTIVE': '1 सक्रिय अलर्ट',
    'ROAD CONDITION: ALL PASSABLE': 'सड़क स्थिति: सभी रास्ते खुले हैं',
    'NO SEVERE ROAD WATERLOGGING REPORTED': 'सड़कों पर भारी जलभराव नहीं है',
    'Municipal arterial roads and key commercial corridors are currently clear for vehicle and pedestrian transit.': 'प्रमुख सड़कें और बाज़ार के रास्ते वाहनों और पैदल चलने वालों के लिए खुले हैं।',
    'Street Patrol Active': 'सड़क निगरानी सक्रिय',
    'SEVERE WATERLOGGING': 'सड़क पर भारी जलभराव',
    'MODERATE WATERLOGGING': 'मध्यम जलभराव',
    'MINOR WATERLOGGING': 'हल्का जलभराव',
    'PASSABLE': 'रास्ता खुला है',
    'Road impassable for two-wheelers and compact vehicles. Avoid route.': 'दोपहिया और छोटी गाड़ियों के लिए रास्ता बंद है। इस रास्ते से न जाएं।',
    'Water accumulating in curb lanes. Drive with extreme caution.': 'सड़क किनारे पानी भर रहा है। गाड़ी बहुत संभलकर चलाएं।',
    'Puddle accumulation near storm drain inlets.': 'नालों के पास पानी जमा हो रहा है।',
    'Normal road conditions.': 'सड़क की स्थिति सामान्य है।',
    'ROAD HAZARD ALERT': 'सड़क खतरा चेतावनी',
    'Affected Roadway': 'प्रभावित सड़क',
    'Observed Cause': 'देखा गया कारण',
    'Recommended Action': 'सलाह व निर्देश',
    'Water Depth': 'पानी का स्तर',
    'Alternate Route': 'वैकल्पिक रास्ता',
    'VIEW STREET MAP': 'सड़क का नक्शा देखें',
    'UPDATE / REPORT THIS ROAD': 'इस सड़क की रिपोर्ट भेजें',
    'Inspect road →': 'सड़क देखें →',
    'AI Verified': 'सत्यापित (Verified)',
    'CROWDSOURCED VERIFICATIONS': 'नागरिकों की रिपोर्ट',
    'RECENT CITIZEN WATERLOGGING REPORTS': 'नागरिकों द्वारा भेजी गई ताज़ा रिपोर्ट',
    'Photographic evidence and water depth logs submitted by drivers, shopkeepers and residents': 'चालकों, दुकानदारों और निवासियों द्वारा भेजे गए फोटो व जलभराव की जानकारी',
    'SUBMIT PHOTO REPORT': 'फोटो रिपोर्ट भेजें',
    'SIMULATE DRAINAGE BLOCKAGE': 'नाला बंद होने का सिम्युलेटर',
    'Test how choked stormwater drains and local rainfall produce street-level waterlogging.': 'देखें कि बंद नालों और बारिश से सड़कों पर पानी कैसे भरता है।',
    'OPEN STREET WATERLOGGING SIMULATOR': 'जलभराव सिम्युलेटर खोलें',
    
    // Hospital & Capacity
    'EMERGENCY HEALTHCARE CAPACITY': 'आपातकालीन अस्पताल व स्वास्थ्य सेवाएं',
    'Nearby hospitals and current emergency access information': 'आसपास के अस्पताल और वहां तक पहुंचने के रास्ते',
    'DEMO CAPACITY DATA': 'डेमो अस्पताल डेटा',
    'VERIFIED REGISTRY': 'सत्यापित अस्पताल सूची',
    'Distance (Nearest first)': 'दूरी (सबसे पास पहले)',
    'Availability (Available beds)': 'उपलब्ध बिस्तर (खाली बेड)',
    'Accessibility (Best road access)': 'पहुंच (साफ रास्ता)',
    'Accessible routes only': 'केवल खुले रास्ते वाले अस्पताल',
    'nearby facilities': 'अस्पताल उपलब्ध',
    'accessible': 'पहुंच योग्य',
    'limited access': 'रास्ता बाधित',
    'No facilities match current filter criteria.': 'इस फिल्टर में कोई अस्पताल नहीं मिला।',
    'Emergency Capacity': 'इमरजेंसी बेड क्षमता',
    'beds available': 'बिस्तर उपलब्ध हैं',
    'open': 'खाली',
    'beds occupied': 'बिस्तर भरे हुए हैं',
    'Capacity data unavailable': 'बिस्तर डेटा उपलब्ध नहीं',
    'Road access normal': 'रास्ता पूरी तरह चालू है',
    'Some route restrictions': 'कुछ रास्तों पर पानी भरा है',
    'Flooded / restricted approach': 'रास्ते में पानी भरा है',
    'Corridor clear': 'रास्ता खुला है',
    'Constrained route': 'रास्ता बाधित है',
    'Status pending': 'जांच जारी है',
    'Inspect Map →': 'नक्शे पर देखें →',
    'Emergency Care + Trauma': 'इमरजेंसी केयर एवं ट्रॉमा',
    
    // Command Center & Operations
    'AUTHORITY / RESPONSE CENTER': 'आपदा नियंत्रण एवं कमांड सेंटर',
    'EOC Operations': 'आपत्कालीन कंट्रोल रूम',
    'Operational decision support, real-time sensor network, and live scenario simulation': 'आपदा प्रबंधन निर्णय, लाइव सेंसर नेटवर्क और सिमुलेशन',
    'Response Center': 'कंट्रोल रूम (EOC)',
    'Scenario Simulator': 'सिम्युलेटर (Scenario)',
    'JUDGING DEMO': 'डेमो मोड',
    'Target Inspection Ward:': 'निरीक्षण वार्ड चुनें:',
    'Real-Time Sensor Telemetry Status': 'सेंसर लाइव डेटा स्थिति',
    'Rainfall Rate': 'बारिश की रफ्तार',
    'Drain Efficiency': 'नाले की निकासी क्षमता',
    'River Gauge': 'नदी का जलस्तर',
    'Citizen Logs': 'नागरिक रिपोर्ट',
    'CRITICAL INFLOW': 'अत्यधिक बारिश',
    'MODERATE RAIN': 'मध्यम बारिश',
    'NORMAL': 'सामान्य',
    'CHOKED DRAIN': 'बंद नाला (जाम)',
    'FLOWING NORMALLY': 'सुचारु प्रवाह',
    'WARNING THRESHOLD': 'चेतावनी स्तर',
    'Verified Local Hazard': 'सत्यापित स्थानीय खतरा',
    'AREA UNDER REVIEW': 'निरीक्षण क्षेत्र',
    'CAUSE:': 'कारण:',
    'WHY IS THE RISK': 'खतरा क्यों है:',
    'Rainfall:': 'बारिश:',
    'Soil moisture:': 'मिट्टी में नमी:',
    'Drainage:': 'नालों की स्थिति:',
    'High': 'अधिक',
    'Moderate': 'मध्यम',
    'Low': 'कम',
    'High (Saturated)': 'अधिक (पानी से भरी ज़मीन)',
    'Poor / Choked': 'खराब / बंद नाला',
    'Good': 'अच्छी',
    'These conditions are increasing local flood risk.': 'इन परिस्थितियों से स्थानीय बाढ़ का खतरा बढ़ रहा है।',
    'REPORTS:': 'नागरिक रिपोर्ट:',
    'AFFECTED ROADS:': 'प्रभावित सड़कें:',
    'CRITICAL INFRASTRUCTURE:': 'महत्वपूर्ण बुनियादी ढांचा:',
    'District Hospital': 'जिला अस्पताल',
    'Power Substation #2': 'बिजली सबस्टेशन 2',
    'Municipal High School': 'नगर निगम स्कूल',
    'RECOMMENDED ACTION:': 'प्रशासन के लिए जरूरी कदम:',
    'Inspect drainage channel and deploy de-silting crew': 'नाले की जांच करें और सफाई दल को तुरंत तैनात करें',
    'Close affected road if water rises further; position police barricades': 'पानी और बढ़ने पर सड़क बंद करें और पुलिस बैरिकेड लगाएं',
    'Broadcast municipal SMS flood warning to residents in Ward 12': 'वार्ड 12 के नागरिकों को मोबाइल पर सतर्कता संदेश भेजें',
    'Citizen Hazard Reports': 'नागरिकों की समस्या रिपोर्ट',
    'Total Logs': 'कुल दर्ज रिपोर्ट',
    'VERIFIED': 'सत्यापित',
    'TECHNICAL DETAILS & MODEL DIAGNOSTICS': 'तकनीकी विवरण एवं मॉडल विश्लेषण',
    
    // Flood Spread & Timeline
    'TIME PROGRESSION:': 'समय की प्रगति:',
    'PAUSE ANIMATION': 'एनीमेशन रोकें',
    'PLAY ANIMATION': 'एनीमेशन चलाएं',
    'Predicted Inundation Area': 'बाढ़ का अनुमानित फैलाव',
    'Hectares covered': 'हेक्टेयर इलाका जलमग्न',
    'Surface Water Depth': 'सड़क पर पानी की गहराई',
    'Above river baseline datum': 'नदी के सामान्य स्तर से ऊपर',
    'Estimated Wave Velocity': 'बाढ़ के पानी की रफ्तार',
    'Valley downhill surge speed': 'ढलान से पानी बहने की गति',
    'Hazard Severity': 'खतरे की गंभीरता',
    'SURGE': 'बहाव',
    'PREDICTED INUNDATION REACHES AT': 'इस समय बाढ़ का पानी पहुंचेगा:',
    'vulnerable corridors mapped': 'संवेदनशील रास्ते पहचाने गए',
    'Hydrological Dynamics:': 'जल प्रवाह का विवरण: ',
    
    // Citizen Report Hazards
    'Water on road': 'सड़क पर पानी भरा है',
    'Water entering shops/homes': 'दुकानों या घरों में पानी घुस रहा है',
    'Blocked drain': 'नाला या गटर बंद है',
    'Rising water level': 'पानी का स्तर तेजी से बढ़ रहा है',
    'Other': 'अन्य समस्या',
    
    // Simulator & Presets
    'NORMAL CLEAR WEATHER': 'सामान्य साफ मौसम',
    'CLOUDBURST OVERLOAD': 'बादल फटने की स्थिति',
    'BLOCKED DRAIN CRISIS': 'नाला जाम होने की स्थिति',
    'SIMULATE SCENARIO': 'सिमुलेशन चलाएं',
    'RESET SIMULATION': 'रीसेट करें',
    'APPLY WARNING TO DASHBOARD': 'डैशबोर्ड पर चेतावनी जारी करें',
    'FLASH FLOOD SIMULATION RESULT': 'बाढ़ सिमुलेशन परिणाम',
    'STREET WATERLOGGING SIMULATION RESULT': 'सड़क जलभराव सिमुलेशन परिणाम',
    'Municipal Disaster Management Cell': 'नगर निगम आपदा प्रबंधन कक्ष',
    'Authority Center (EOC / Simulator)': 'आपदा नियंत्रण कक्ष (EOC)',
    'Emergency Helpline: 112': 'आपातकालीन हेल्पलाइन: 112',
    'Know the risk. Act early.': 'जोखिम पहचानें। समय रहते सुरक्षित रहें।',
    'Syncing Local Flood Risk & Sensor Network...': 'स्थानीय बाढ़ जोखिम और सेंसर नेटवर्क से संपर्क हो रहा है...',
    
    // Map Translations
    'India Streets': 'सड़कें (OSM)',
    'Satellite': 'उपग्रह दृश्य',
    'Terrain': 'पर्वत व ढलान',
    'Clean Street': 'साफ नक्शा',
    'Flood Risk': 'बाढ़ का खतरा',
    'Rainfall': 'बारिश',
    'Drainage': 'जल निकासी नाले',
    'Sensors': 'सेंसर',
    'Historical Events': 'पिछली घटनाएं',
    'Hospitals & Trauma': 'अस्पताल व ट्रॉमा',
    'LAYERS': 'लेयर्स',
    'Base Map': 'मुख्य नक्शा',
    'Display Layers': 'प्रदर्शित लेयर्स',
    'India View': 'पूरा भारत',
    'Basin': 'घाटी क्षेत्र',
    'ACTIVE WARNING ZONE': '🔴 सक्रिय चेतावनी क्षेत्र',
    'SELECTED AREA': 'चुना गया क्षेत्र',
    'RISK:': 'जोखिम:',
    'WARNING WINDOW:': 'चेतावनी समय:',
    'ACTION:': 'सलाह व निर्देश:',
    'Risk:': 'जोखिम:',
    
    // Simulator Extra
    'DECISION-SUPPORT STRESS TESTING': 'निर्णय समर्थन तनाव परीक्षण',
    'FLOOD SCENARIO SIMULATOR': 'बाढ़ स्थिति सिम्युलेटर',
    'Test independent emergency conditions. Choose a disaster scenario below.': 'अलग-अलग आपातकालीन स्थितियों का परीक्षण करें। नीचे एक परिदृश्य चुनें।',
    'Reset Baseline': 'डिफ़ॉल्ट स्थिति',
    'Choose Scenario:': 'परिदृश्य चुनें:',
    '🌊 FLASH FLOOD': '🌊 अचानक बाढ़',
    '🚧 STREET WATERLOGGING': '🚧 सड़क पर जलभराव',
    'REGIONAL SIMULATION CONTROLS': 'क्षेत्रीय बाढ़ नियंत्रण',
    'FLASH FLOOD SIMULATOR': 'अचानक बाढ़ सिम्युलेटर',
    'Target Ward:': 'लक्षित वार्ड:',
    'Rainfall Intensity': 'बारिश की रफ्तार',
    'Soil Moisture Saturation': 'मिट्टी में पानी की मात्रा',
    'Slope & Terrain Gradient': 'जमीन का ढलान',
    'River Water Level Condition': 'नदी का जलस्तर',
    'Historical Catchment Flood Vulnerability': 'पिछली बाढ़ का इतिहास',
    'MEDIUM': 'मध्यम',
    'RISING': 'बढ़ रहा है',
    'SIMULATED OUTPUT: FLASH FLOOD RISK': 'सिमुलेशन परिणाम: अचानक बाढ़ का खतरा',
    'GENERATE FLASH FLOOD WARNING': 'बाढ़ चेतावनी जारी करें',
    'Warning dispatched to Flash Flood Dashboard & Risk Map': 'चेतावनी डैशबोर्ड और नक्शे पर भेज दी गई है',
    'ROAD-LEVEL SIMULATION CONTROLS': 'सड़क स्तरीय नियंत्रण',
    'STREET WATERLOGGING SIMULATOR': 'सड़क जलभराव सिम्युलेटर',
    'Target Road:': 'लक्षित सड़क:',
    'HYDRAULIC DIAGNOSIS DEMONSTRATION PRESETS:': 'जल निकासी स्थिति के आसान नमूने:',
    '1-Click Scenarios': 'एक-क्लिक में परीक्षण',
    'NORMAL RAINFALL': 'सामान्य बारिश',
    '10 mm/h · Balanced Flow (Nominal)': '10 मिमी/घंटा · सामान्य बहाव',
    'HEAVY RAINFALL': 'भारी बारिश',
    '85 mm/h · Surface Inundation (No Blockage)': '85 मिमी/घंटा · सड़क पर पानी (नाला खुला)',
    'MODERATE RAIN + BLOCKED DRAIN': 'मध्यम बारिश + बंद नाला',
    '18 mm/h · Triggers Hidden Blockage (MH-07)': '18 मिमी/घंटा · नाले में कचरे से रुकावट',
    'Impervious Area / Runoff Coeff (C)': 'कंक्रीट क्षेत्र / बहाव गुणांक',
    'Observed Water Accumulation': 'सड़क पर भरा पानी',
    'Drainage Condition': 'नाले की स्थिति',
    'Citizen Reports Received': 'नागरिकों की रिपोर्ट',
    'Drainage Network Response': 'नालों से पानी निकासी',
    'GOOD': 'साफ नाला',
    'STRESSED': 'दबाव में',
    'CHOKED': 'बंद / जाम',
    'ANKLE': 'टखने तक (कम)',
    'KNEE': 'घुटने तक (मध्यम)',
    'WAIST': 'कमर तक (गंभीर)',
    'SUBMERGED': 'पूरी सड़क डूबी',
    'SLUGGISH': 'धीमी निकासी',
    'RESTRICTED': 'रुकावट भरा',
    'SIMULATED OUTPUT: STREET WATERLOGGING RISK': 'सिमुलेशन परिणाम: सड़क पर जलभराव का खतरा',
    'GENERATE WATERLOGGING ALERT': 'सड़क चेतावनी जारी करें',
    'Road Alert logged for': 'सड़क अलर्ट दर्ज किया गया:',
    
    // Feeds & modal extra
    'Citizen Waterlogging Intelligence Feed': 'नागरिक जलभराव सूचना फीड',
    'Crowd-verified photo reports powering drainage choke and localized inundation diagnostics': 'नागरिकों द्वारा भेजे गए फोटो और जलभराव की स्थिति',
    '+ Submit Field Report': '+ नई रिपोर्ट भेजें',
    'Vision Detections:': 'फोटो विश्लेषण:',
    'GPS pinned': 'GPS लोकेशन मिल गई',
    'GPS approximated to current ward': 'GPS से वर्तमान वार्ड चुना गया'
  },
  mr: {
    'FLASH FLOOD WARNING': 'अचानक पुराचा इशारा',
    'FLOOD WARNING': 'पुराचा इशारा',
    'FLOOD WATCH': 'पूर पूर्वसूचना',
    'CRITICAL': 'अतिधोकादायक',
    'HIGH': 'जास्त धोका',
    'MODERATE': 'मध्यम धोका',
    'LOW': 'कमी धोका',
    'NEXT 1–3 HOURS': 'पुढील १–३ तासांत',
    'NEXT 3–6 HOURS': 'पुढील ३–६ तासांत',
    'No Imminent Risk': 'सध्या कोणताही तात्काळ धोका नाही',
    'NOW': 'आता (Now)',
    'Rainfall increasing': 'पाऊस वेगाने वाढत आहे',
    'Soil moisture rising': 'जमिनीतील पाणी शोषण्याची क्षमता संपली आहे',
    'Drainage stress detected': 'नाले तुंबले असून पाणी उलटे फिरत आहे',
    '⚠️ HIGH FLOOD RISK': '⚠️ पुराचा मोठा धोका',
    '⚠️ CRITICAL FLOOD RISK': '⚠️ पुराचा अतिगंभीर धोका',
    'Moderate rainfall combined with blocked drainage is creating localized waterlogging': 'मध्यम पाऊस आणि तुंबलेल्या गटारांमुळे रस्त्यांवर पाणी साचले आहे.',
    'Heavy rainfall overload exceeding local drainage capacity': 'मुसळधार पावसामुळे पाणी नाल्यांच्या क्षमतेपेक्षा जास्त झाले आहे.',
    'Avoid Main Market Road': 'मुख्य बाजार रस्त्यावर जाणे टाळा',
    'Move away from low-lying areas and ground level shops': 'सखल भाग व रस्त्यावरील दुकानांमधून वरच्या जागेवर जा',
    'Allow municipal suction crews to inspect and clear culvert': 'महापालिकेच्या स्वच्छता पथकाला नाला मोकळा करू द्या',
    'Follow local authority instructions (Call 112)': 'प्रशासनाच्या सूचनांचे पालन करा (कॉल ११२)',
    'Avoid Valley Riverside Road and low-lying river ghats': 'नदीकाठचा रस्ता आणि सखल घाटांवर जाणे टाळा',
    'Move to designated highland emergency shelters': 'उंच सुरक्षित ठिकाणी किंवा मदत छावणीत जा',
    'Do not walk or drive through flowing water': 'वाहत्या पाण्यात कधीही चालत किंवा गाडी घेऊन जाऊ नका',
    'Follow instructions from municipal emergency personnel (Call 112)': 'आपत्कालीन मदत पथकाच्या सूचनांचे पालन करा (कॉल ११२)',
    'Surface runoff rate escalating': 'रस्त्यावरील पाण्याचा वेग वेगाने वाढत आहे',
    '42.0 mm/h inflow recorded': 'ताशी ४२ मिमी पावसाची नोंद',
    'Ground saturation at 82%': 'जमिनीत ८२% ओलावा भरला आहे',
    'Culvert efficiency down to 18% (Choked)': 'नाला कचऱ्याने तुंबल्यामुळे क्षमता फक्त १८% उरली आहे',
    'Cloudburst precipitation at 110 mm/h': 'ढगफुटीसारखा ताशी ११० मिमी पाऊस',
    'Runoff velocity surging': 'पाण्याचा वेग अत्यंत वाढला आहे',
    'Pore pressure saturation at 96%': 'जमिनीत ९६% पाणी साचले आहे',
    'Channel capacity overwhelmed': 'नाले पूर्ण क्षमतेने भरून वाहत आहेत',
    'Main Market Road': 'मुख्य बाजार रस्ता',
    'Low-Lying Market Zone': 'सखल बाजार परिसर',
    'Station Road Culvert Ingress': 'स्टेशन रोड नाला प्रवेशद्वार',
    'Valley Riverside Road': 'खोऱ्यातील नदीकाठचा रस्ता',
    'Lower Ghat Terraces': 'सखल नदी घाट',
    'Bridge Ingress Approach': 'पुलाचा मार्ग',
    'Routine Telemetry Active': 'हवामान निरीक्षण सक्रिय',
    'SDMA Monitoring Active': 'राज्य आपत्ती नियंत्रण सक्रिय',
    
    // Statuses & Hazard Types
    'ALL CLEAR': 'सर्व सुरक्षित',
    '1 ACTIVE': '१ सक्रिय इशारा',
    'ROAD CONDITION: ALL PASSABLE': 'रस्त्याची स्थिती: सर्व मार्ग सुरू आहेत',
    'NO SEVERE ROAD WATERLOGGING REPORTED': 'रस्त्यांवर मोठे पाणी साचलेले नाही',
    'Municipal arterial roads and key commercial corridors are currently clear for vehicle and pedestrian transit.': 'शहरातील मुख्य रस्ते आणि बाजारपेठा वाहनांसाठी व पायी जाण्यासाठी मोकळे आहेत.',
    'Street Patrol Active': 'रस्त्यांची पाहणी सुरू',
    'SEVERE WATERLOGGING': 'रस्त्यावर जास्त पाणी साचले आहे',
    'MODERATE WATERLOGGING': 'मध्यम पाणी साचले आहे',
    'MINOR WATERLOGGING': 'किरकोळ पाणी साचले आहे',
    'PASSABLE': 'रस्ता सुरू आहे',
    'Road impassable for two-wheelers and compact vehicles. Avoid route.': 'दुचाकी आणि लहान वाहनांसाठी रस्ता बंद आहे. हा मार्ग टाळा.',
    'Water accumulating in curb lanes. Drive with extreme caution.': 'रस्त्याच्या कडेला पाणी साचत आहे. वाहने सावकाश चालवा.',
    'Puddle accumulation near storm drain inlets.': 'गटाराजवळ पाणी साचत आहे.',
    'Normal road conditions.': 'रस्त्याची स्थिती सामान्य आहे.',
    'ROAD HAZARD ALERT': 'रस्ता धोका इशारा',
    'Affected Roadway': 'प्रभावित रस्ता',
    'Observed Cause': 'कारण',
    'Recommended Action': 'मार्गदर्शक सूचना',
    'Water Depth': 'पाण्याची पातळी',
    'Alternate Route': 'पर्यायी सुरक्षित रस्ता',
    'VIEW STREET MAP': 'रस्त्याचा नकाशा पहा',
    'UPDATE / REPORT THIS ROAD': 'या रस्त्याचा अहवाल पाठवा',
    'Inspect road →': 'रस्ता तपासा →',
    'AI Verified': 'तपासलेले (Verified)',
    'CROWDSOURCED VERIFICATIONS': 'नागरिकांकडून मिळालेली माहिती',
    'RECENT CITIZEN WATERLOGGING REPORTS': 'नागरिकांनी नोंदवलेले ताजे अहवाल',
    'Photographic evidence and water depth logs submitted by drivers, shopkeepers and residents': 'वाहनचालक, दुकानदार आणि नागरिकांनी पाठवलेले फोटो व माहिती',
    'SUBMIT PHOTO REPORT': 'फोटो व अहवाल पाठवा',
    'SIMULATE DRAINAGE BLOCKAGE': 'तुंबलेल्या नाल्यांचे सिम्युलेटर',
    'Test how choked stormwater drains and local rainfall produce street-level waterlogging.': 'पाहा की तुंबलेले नाले आणि पावसामुळे रस्त्यावर कसे पाणी साचते.',
    'OPEN STREET WATERLOGGING SIMULATOR': 'पाणी साचण्याचे सिम्युलेटर उघडा',
    
    // Hospital & Capacity
    'EMERGENCY HEALTHCARE CAPACITY': 'आपत्कालीन आरोग्य सेवा व रुग्णालये',
    'Nearby hospitals and current emergency access information': 'जवळची रुग्णालये आणि तेथील रस्त्यांची स्थिती',
    'DEMO CAPACITY DATA': 'डेमो रुग्णालय डेटा',
    'VERIFIED REGISTRY': 'नोंदणीकृत रुग्णालये',
    'Distance (Nearest first)': 'अंतर (सर्वात जवळचे आधी)',
    'Availability (Available beds)': 'उपलब्ध खाटा (खाली बेड्स)',
    'Accessibility (Best road access)': 'रस्त्याची स्थिती (चांगला मार्ग)',
    'Accessible routes only': 'फक्त खुले मार्ग असलेली रुग्णालये',
    'nearby facilities': 'रुग्णालये जवळ आहेत',
    'accessible': 'मार्ग खुला आहे',
    'limited access': 'मार्ग बाधित आहे',
    'No facilities match current filter criteria.': 'या निकषात कोणतेही रुग्णालय आढळले नाही.',
    'Emergency Capacity': 'आपत्कालीन खाटांची क्षमता',
    'beds available': 'खाटा उपलब्ध आहेत',
    'open': 'रिक्त',
    'beds occupied': 'खाटा भरलेल्या आहेत',
    'Capacity data unavailable': 'खाटांची माहिती उपलब्ध नाही',
    'Road access normal': 'रस्ता सुरळीत सुरू आहे',
    'Some route restrictions': 'काही मार्गांवर पाणी आहे',
    'Flooded / restricted approach': 'रस्त्यात पाणी साचले आहे',
    'Corridor clear': 'मार्ग मोकळा आहे',
    'Constrained route': 'मार्ग बाधित आहे',
    'Status pending': 'माहिती घेतली जात आहे',
    'Inspect Map →': 'नकाशावर पहा →',
    'Emergency Care + Trauma': 'इमरजन्सी केअर व ट्रॉमा',
    
    // Command Center & Operations
    'AUTHORITY / RESPONSE CENTER': 'आपत्ती नियंत्रण व कमांड सेंटर',
    'EOC Operations': 'आपत्कालीन नियंत्रण कक्ष',
    'Operational decision support, real-time sensor network, and live scenario simulation': 'आपत्ती व्यवस्थापन निर्णय, थेट सेन्सर व सिम्युलेशन',
    'Response Center': 'कंट्रोल रूम (EOC)',
    'Scenario Simulator': 'सिम्युलेटर (Scenario)',
    'JUDGING DEMO': 'डेमो मोड',
    'Target Inspection Ward:': 'तपासणीसाठी प्रभाग निवडा:',
    'Real-Time Sensor Telemetry Status': 'सेन्सर थेट माहिती स्थिती',
    'Rainfall Rate': 'पावसाचा वेग',
    'Drain Efficiency': 'नाल्याची क्षमता',
    'River Gauge': 'नदीची पातळी',
    'Citizen Logs': 'नागरिक अहवाल',
    'CRITICAL INFLOW': 'मुसळधार पाऊस',
    'MODERATE RAIN': 'मध्यम पाऊस',
    'NORMAL': 'सामान्य',
    'CHOKED DRAIN': 'तुंबलेला नाला',
    'FLOWING NORMALLY': 'सुरळीत प्रवाह',
    'WARNING THRESHOLD': 'इशारा पातळी',
    'Verified Local Hazard': 'स्थानिक धोका तपासला',
    'AREA UNDER REVIEW': 'तपासणी परिसर',
    'CAUSE:': 'कारण:',
    'WHY IS THE RISK': 'हा धोका का आहे:',
    'Rainfall:': 'पाऊस:',
    'Soil moisture:': 'जमिनीतील ओलावा:',
    'Drainage:': 'नाल्यांची स्थिती:',
    'High': 'जास्त',
    'Moderate': 'मध्यम',
    'Low': 'कमी',
    'High (Saturated)': 'जास्त (पाण्याने भरलेली जमीन)',
    'Poor / Choked': 'खराब / तुंबलेला नाला',
    'Good': 'चांगली',
    'These conditions are increasing local flood risk.': 'या कारणांमुळे स्थानिक भागात पुराचा धोका वाढत आहे.',
    'REPORTS:': 'नागरिक अहवाल:',
    'AFFECTED ROADS:': 'प्रभावित रस्ते:',
    'CRITICAL INFRASTRUCTURE:': 'महत्त्वाच्या सुविधा:',
    'District Hospital': 'जिल्हा रुग्णालय',
    'Power Substation #2': 'वीज उपकेंद्र २',
    'Municipal High School': 'महापालिका शाळा',
    'RECOMMENDED ACTION:': 'प्रशासनाने तातडीने करावयाची कृती:',
    'Inspect drainage channel and deploy de-silting crew': 'नाल्याची तपासणी करून गाळ काढणारे पथक पाठवा',
    'Close affected road if water rises further; position police barricades': 'पाणी वाढल्यास रस्ता बंद करून पोलीस बॅरिकेड्स लावा',
    'Broadcast municipal SMS flood warning to residents in Ward 12': 'प्रभाग १२ मधील नागरिकांना सतर्कतेचा मेसेज पाठवा',
    'Citizen Hazard Reports': 'नागरिकांचे धोका अहवाल',
    'Total Logs': 'एकूण अहवाल',
    'VERIFIED': 'तपासलेले',
    'TECHNICAL DETAILS & MODEL DIAGNOSTICS': 'तांत्रिक तपशील व मॉडेल विश्लेषण',
    
    // Flood Spread & Timeline
    'TIME PROGRESSION:': 'वेळेची प्रगती:',
    'PAUSE ANIMATION': 'अ‍ॅनिमेशन थांबवा',
    'PLAY ANIMATION': 'अ‍ॅनिमेशन सुरू करा',
    'Predicted Inundation Area': 'पूर पसरण्याचे संभाव्य क्षेत्र',
    'Hectares covered': 'हेक्टर क्षेत्र पाण्याखाली',
    'Surface Water Depth': 'रस्त्यावरील पाण्याची खोली',
    'Above river baseline datum': 'नदीच्या सामान्य पातळीपेक्षा जास्त',
    'Estimated Wave Velocity': 'पाण्याच्या प्रवाहाचा वेग',
    'Valley downhill surge speed': 'उतारावरून वाहणाऱ्या पाण्याचा वेग',
    'Hazard Severity': 'धोक्याची तीव्रता',
    'SURGE': 'पूर लाट',
    'PREDICTED INUNDATION REACHES AT': 'या वेळेस पाणी पोहोचेल:',
    'vulnerable corridors mapped': 'संवेदनशील मार्ग निश्चित केले',
    'Hydrological Dynamics:': 'पाण्याच्या प्रवाहाचे विश्लेषण: ',
    
    // Citizen Report Hazards
    'Water on road': 'रस्त्यावर पाणी साचले आहे',
    'Water entering shops/homes': 'दुकान किंवा घरात पाणी शिरत आहे',
    'Blocked drain': 'नाला किंवा गटार तुंबले आहे',
    'Rising water level': 'पाण्याची पातळी वेगाने वाढत आहे',
    'Other': 'इतर अडचण',
    
    // Simulator & Presets
    'NORMAL CLEAR WEATHER': 'सामान्य स्वच्छ हवामान',
    'CLOUDBURST OVERLOAD': 'ढगफुटीची स्थिती',
    'BLOCKED DRAIN CRISIS': 'नाला तुंबल्याची स्थिती',
    'SIMULATE SCENARIO': 'सिम्युलेशन सुरू करा',
    'RESET SIMULATION': 'पूर्ववत करा (Reset)',
    'APPLY WARNING TO DASHBOARD': 'डॅशबोर्डवर इशारा जारी करा',
    'FLASH FLOOD SIMULATION RESULT': 'पूर सिम्युलेशन निष्कर्ष',
    'STREET WATERLOGGING SIMULATION RESULT': 'रस्ता पाणी साचणे सिम्युलेशन निष्कर्ष',
    'Municipal Disaster Management Cell': 'महापालिका आपत्ती व्यवस्थापन कक्ष',
    'Authority Center (EOC / Simulator)': 'आपत्ती नियंत्रण कक्ष (EOC)',
    'Emergency Helpline: 112': 'आपत्कालीन मदत क्रमांक: ११२',
    'Know the risk. Act early.': 'धोका ओळखा. वेळेत सुरक्षित राहा.',
    'Syncing Local Flood Risk & Sensor Network...': 'स्थानिक पूर धोका आणि सेन्सर नेटवर्क तपासले जात आहे...',
    
    // Map Translations
    'India Streets': 'रस्ते (OSM)',
    'Satellite': 'उपग्रह दृश्य',
    'Terrain': 'डोंगर व उतार',
    'Clean Street': 'स्वच्छ रस्ते नकाशा',
    'Flood Risk': 'पुराचा धोका',
    'Rainfall': 'पाऊस',
    'Drainage': 'पाण्याचा निचरा (नाले)',
    'Sensors': 'सेन्सर्स',
    'Historical Events': 'मागील घटना',
    'Hospitals & Trauma': 'रुग्णालये व ट्रॉमा',
    'LAYERS': 'लेअर्स',
    'Base Map': 'मुख्य नकाशा',
    'Display Layers': 'दाखवायचे लेअर्स',
    'India View': 'संपूर्ण भारत',
    'Basin': 'खोरे परिसर',
    'ACTIVE WARNING ZONE': '🔴 सक्रिय इशारा क्षेत्र',
    'SELECTED AREA': 'निवडलेला परिसर',
    'RISK:': 'धोका:',
    'WARNING WINDOW:': 'इशारा वेळ:',
    'ACTION:': 'सूचना / उपाय:',
    'Risk:': 'धोका:',
    
    // Simulator Extra
    'DECISION-SUPPORT STRESS TESTING': 'निर्णय समर्थन चाचणी',
    'FLOOD SCENARIO SIMULATOR': 'पूर परिस्थिती सिम्युलेटर',
    'Test independent emergency conditions. Choose a disaster scenario below.': 'वेगवेगळ्या आपत्कालीन परिस्थितींची चाचणी घ्या. खालील पर्याय निवडा.',
    'Reset Baseline': 'मूळ स्थिती (Reset)',
    'Choose Scenario:': 'पर्याय निवडा:',
    '🌊 FLASH FLOOD': '🌊 अचानक पूर',
    '🚧 STREET WATERLOGGING': '🚧 रस्त्यावर पाणी साचणे',
    'REGIONAL SIMULATION CONTROLS': 'प्रादेशिक पूर नियंत्रक',
    'FLASH FLOOD SIMULATOR': 'अचानक पूर सिम्युलेटर',
    'Target Ward:': 'निवडलेला प्रभाग:',
    'Rainfall Intensity': 'पावसाचा वेग',
    'Soil Moisture Saturation': 'जमिनीतील ओलावा',
    'Slope & Terrain Gradient': 'उतार व डोंगर',
    'River Water Level Condition': 'नदीची पाण्याची पातळी',
    'Historical Catchment Flood Vulnerability': 'मागील पुराचा इतिहास',
    'MEDIUM': 'मध्यम',
    'RISING': 'वाढत आहे',
    'SIMULATED OUTPUT: FLASH FLOOD RISK': 'सिम्युलेशन निष्कर्ष: पुराचा धोका',
    'GENERATE FLASH FLOOD WARNING': 'पुराचा इशारा जारी करा',
    'Warning dispatched to Flash Flood Dashboard & Risk Map': 'इशारा डॅशबोर्ड व नकाशावर पाठवला आहे',
    'ROAD-LEVEL SIMULATION CONTROLS': 'रस्ता पातळीवरील नियंत्रक',
    'STREET WATERLOGGING SIMULATOR': 'रस्ता पाणी साचणे सिम्युलेटर',
    'Target Road:': 'प्रभावित रस्ता:',
    'HYDRAULIC DIAGNOSIS DEMONSTRATION PRESETS:': 'पाणी निचरा परिस्थितीचे नमुने:',
    '1-Click Scenarios': 'एका क्लिकवर चाचणी',
    'NORMAL RAINFALL': 'नेहमीचा पाऊस',
    '10 mm/h · Balanced Flow (Nominal)': '१० मिमी/तास · सुरळीत निचरा',
    'HEAVY RAINFALL': 'मुसळधार पाऊस',
    '85 mm/h · Surface Inundation (No Blockage)': '८५ मिमी/तास · रस्त्यावर पाणी (नाला सुरू)',
    'MODERATE RAIN + BLOCKED DRAIN': 'मध्यम पाऊस + तुंबलेला नाला',
    '18 mm/h · Triggers Hidden Blockage (MH-07)': '१८ मिमी/तास · कचऱ्यामुळे तुंबलेला नाला',
    'Impervious Area / Runoff Coeff (C)': 'काँक्रीट भाग / पाण्याचा वेग',
    'Observed Water Accumulation': 'रस्त्यावर साचलेले पाणी',
    'Drainage Condition': 'नाल्याची स्थिती',
    'Citizen Reports Received': 'नागरिकांचे अहवाल',
    'Drainage Network Response': 'नाल्यांतून पाण्याचा निचरा',
    'GOOD': 'स्वच्छ नाला',
    'STRESSED': 'क्षमतेपेक्षा जास्त',
    'CHOKED': 'तुंबलेला नाला',
    'ANKLE': 'घोट्याइतके (कमी)',
    'KNEE': 'गुडघ्याइतके (मध्यम)',
    'WAIST': 'कमरेइतके (गंभीर)',
    'SUBMERGED': 'संपूर्ण रस्ता पाण्याखाली',
    'SLUGGISH': 'हळू निचरा',
    'RESTRICTED': 'पाणी तुंबलेले',
    'SIMULATED OUTPUT: STREET WATERLOGGING RISK': 'सिम्युलेशन निष्कर्ष: रस्त्यावर पाणी साचणे',
    'GENERATE WATERLOGGING ALERT': 'रस्ता इशारा जारी करा',
    'Road Alert logged for': 'रस्ता इशारा नोंदवला:',
    
    // Feeds & modal extra
    'Citizen Waterlogging Intelligence Feed': 'नागरिक पाणी साचणे माहिती',
    'Crowd-verified photo reports powering drainage choke and localized inundation diagnostics': 'नागरिकांनी पाठवलेले फोटो व साचलेल्या पाण्याची माहिती',
    '+ Submit Field Report': '+ नवीन माहिती द्या',
    'Vision Detections:': 'फोटो विश्लेषण:',
    'GPS pinned': 'GPS स्थान मिळाले',
    'GPS approximated to current ward': 'GPS द्वारे सध्याचा प्रभाग निवडला'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  tr: (text: string | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('jalrakshak_language') as Language;
    return saved && ['en', 'hi', 'mr'].includes(saved) ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('jalrakshak_language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const tr = (text: string | undefined | null): string => {
    if (!text) return '';
    if (language === 'en') return text;
    const dict = STATEMENT_DICTIONARY[language];
    if (dict[text]) return dict[text];
    const trimmed = text.trim();
    if (dict[trimmed]) return dict[trimmed];

    // Pattern replacements
    if (text.startsWith('Avoid ') && text.endsWith('.')) {
      const road = text.slice(6, -1);
      const translatedRoad = dict[road] || road;
      return language === 'hi' ? `${translatedRoad} पर जाने से बचें।` : `${translatedRoad} वर जाणे टाळा.`;
    }
    if (text.includes('km away')) {
      const num = text.replace('km away', '').trim();
      return language === 'hi' ? `${num} किमी दूर` : `${num} किमी दूर`;
    }
    if (text.includes('min est.')) {
      const num = text.replace(/~|min est\.|\s/g, '').trim();
      return language === 'hi' ? `~${num} मिनट अनुमानित` : `~${num} मिनिटे अंदाजे`;
    }
    if (text.includes('citizen reports')) {
      const num = text.replace('citizen reports', '').trim();
      return language === 'hi' ? `${num} नागरिक रिपोर्ट` : `${num} नागरिक अहवाल`;
    }
    if (text.includes('beds available')) {
      const count = text.replace('beds available', '').trim();
      return language === 'hi' ? `${count} बिस्तर खाली हैं` : `${count} खाटा रिकाम्या आहेत`;
    }
    if (text.includes('beds occupied')) {
      const count = text.replace('beds occupied', '').trim();
      return language === 'hi' ? `${count} बिस्तर भरे हैं` : `${count} खाटा भरल्या आहेत`;
    }
    if (text.includes('Updated ')) {
      const time = text.replace('Updated ', '').trim();
      return language === 'hi' ? `अपडेट: ${time}` : `अपडेट: ${time}`;
    }

    return text;
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
    tr
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
