import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ScreenType = 
  | 'HOME' 
  | 'SCAN' 
  | 'STATS' 
  | 'PROFILE' 
  | 'FAQ' 
  | 'HISTORY' 
  | 'REWARD_QR' 
  | 'SETTINGS'
  | 'SUPPORT_CHAT'
  | 'POOLS'
  | 'WALLET'
  | 'VULNERABILITY'
  | 'WASTE_GALLERY';

interface RecycledItem {
  id: string;
  name: string;
  category: string;
  weightKg: number;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  points: number;
  level: string;
  ecoScore: string;
  suburb: string;
  co2SavedKg: number;
}

interface ChatMessage {
  sender: 'user' | 'support';
  text: string;
}

const INITIAL_PROFILE: UserProfile = {
  name: 'John Kundai',
  email: 'kundai@sanova.org.zw',
  phone: '+263 77 123 4567',
  points: 120,
  level: 'Community Climate Champion',
  ecoScore: '96%',
  suburb: 'Mbare, Harare',
  co2SavedKg: 412,
};

const INITIAL_ITEMS: RecycledItem[] = [
  { id: 'SAN-901', name: 'PET Beverage Bottles', category: 'Plastic', weightKg: 12.5, date: '2026-10-30', status: 'Approved' },
  { id: 'SAN-902', name: 'Scrap Iron & Roof Sheets', category: 'Metal', weightKg: 24.0, date: '2026-10-28', status: 'Approved' },
  { id: 'SAN-903', name: 'Cardboard & Cartons', category: 'Paper', weightKg: 8.5, date: '2026-10-25', status: 'Pending' },
  { id: 'SAN-904', name: 'Computer Motherboards', category: 'Electronics', weightKg: 3.2, date: '2026-10-21', status: 'Approved' },
];

const COLOR_PRIMARY = '#059669'; // Eco Emerald
const COLOR_SECONDARY = '#0284C7'; // Water / Action Blue
const COLOR_DARK = '#0F172A'; // Midnight slate
const COLOR_MUTED = '#64748B';
const COLOR_DANGER = '#EF4444';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [items, setItems] = useState<RecycledItem[]>(INITIAL_ITEMS);
  const [activeTabFilter, setActiveTabFilter] = useState<'All' | 'Approved' | 'Pending'>('All');
  const [selectedSuburb, setSelectedSuburb] = useState<'Mbare' | 'Mufakose' | 'Dzivarasekwa'>('Mbare');

  // Scan State
  const [scannedItemName, setScannedItemName] = useState('Sorted PET Plastic Bottles');
  const [scannedCategory, setScannedCategory] = useState('Plastic');
  const [scannedWeight, setScannedWeight] = useState('10.0');

  // Wallet State
  const [ecoCashPhone, setEcoCashPhone] = useState('+263 77 123 4567');

  // Vulnerability Alert State
  const [hazardLocation, setHazardLocation] = useState('Near Mbare Musika Bus Terminus');

  // AI Support Chat State & 10-Option Engine
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'support', text: '🤖 S.A.N.O.V.A. AI Assistant online! Ask me anything about our app, climate impact, or how to win the $20k green grant program.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // 10 Comprehensive AI Question & Response Options
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : chatInput).trim();
    if (!query) return;

    const userMsg: ChatMessage = { sender: 'user', text: query };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    if (textToSend === undefined) setChatInput('');

    setTimeout(() => {
      let aiReply = "Thanks for your query! S.A.N.O.V.A. turns high-density waste into money while tackling climate change in Harare.";
      const lower = query.toLowerCase();

      if (lower.includes('hie') || lower.includes('hello') || lower.includes('hi')) {
        aiReply = "Hello Kundai! How can I assist you with S.A.N.O.V.A. today?";
      } 
      else if (lower.includes('what') && (lower.includes('app') || lower.includes('does') || lower.includes('do'))) {
        aiReply = "🌍 S.A.N.O.V.A. (Sanitation Alert Network and Overland Vulnerability Action) is a mobile platform built for Harare high-density suburbs (Mbare, Mufakose, DZ). We tackle waste management challenges and let residents exchange sorted waste for instant EcoCash USD.";
      } 
      else if (lower.includes('program') || lower.includes('join') || lower.includes('grant') || lower.includes('sign up')) {
        aiReply = "🚀 Getting into the S.A.N.O.V.A. program is simple: 1) Download the app and register your profile. 2) Log your household waste with photos. 3) Join your local suburb pool to help hit the 5,000kg truck dispatch target!";
      } 
      else if (lower.includes('ecocash') || lower.includes('money') || lower.includes('cash') || lower.includes('payout')) {
        aiReply = "💵 Every 1.5 kg of sorted waste = 1 Point = $2.50 USD. You can cash out instantly from your wallet directly to your registered EcoCash mobile number.";
      } 
      else if (lower.includes('climate') || lower.includes('burn') || lower.includes('smoke') || lower.includes('warming')) {
        aiReply = "🔥 One of S.A.N.O.V.A.’s core missions is stopping toxic open waste burning in townships. By incentivizing recycling instead of burning plastics, we drastically reduce greenhouse gas emissions and protect community health.";
      } 
      else if (lower.includes('pool') || lower.includes('truck') || lower.includes('mbare') || lower.includes('mufakose') || lower.includes('target')) {
        aiReply = "🚛 Suburb Waste Pools aggregate community tonnage (e.g., Mbare aiming for 5,000kg). Once a suburb hits its target, recycling partner trucks automatically dispatch for bulk doorstep collection!";
      } 
      else if (lower.includes('hazard') || lower.includes('dump') || lower.includes('drain') || lower.includes('vulnerability') || lower.includes('report')) {
        aiReply = "⚠️ The Overland Vulnerability Hotline lets residents geo-tag illegal roadside dump sites and blocked stormwater drains before heavy rains cause floods. Verified reporters receive +5 bonus reward points!";
      } 
      else if (lower.includes('category') || lower.includes('plastic') || lower.includes('metal') || lower.includes('paper') || lower.includes(' elektronik') || lower.includes('waste types')) {
        aiReply = "📦 S.A.N.O.V.A. accepts sorted plastics (PET bottles), heavy metals/scrap iron, cardboard/paper, glass, and electronic waste (e-waste). Rinsing items increases your reward validation speed!";
      } 
      else if (lower.includes('win') || lower.includes('20000') || lower.includes('competition') || lower.includes('judge')) {
        aiReply = "🏆 To win the $20,000 grant, S.A.N.O.V.A. combines stellar UI/UX design with real local logistics solve-cases for Harare. Our unique focus on high-density economic empowerment and climate mitigation makes this a winning pitch!";
      } 
      else if (lower.includes('utility') || lower.includes('zetdc') || lower.includes('electricity') || lower.includes('water') || lower.includes('bill')) {
        aiReply = "💡 Beyond EcoCash cashouts, you can convert your recycling points directly into ZETDC prepaid electricity tokens, City of Harare water bill offsets, or Econet/NetOne airtime bundles!";
      } 
      else if (lower.includes('support') || lower.includes('admin') || lower.includes('human') || lower.includes('contact') || lower.includes('help')) {
        aiReply = "📞 Need human assistance? Our Harare field operations team is reachable at +263 78 166 5064 or via email at support@sanova.org.zw. We operate Monday to Saturday from 08:00 to 17:00.";
      }

      setChatMessages([...updatedMessages, { sender: 'support', text: aiReply }]);
    }, 600);
  };

  // Universal Header
  const renderHeader = (title: string, showBack = true) => (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={() => setCurrentScreen('HOME')} style={styles.headerBackBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerAvatarContainer}>
          <Text style={styles.headerAvatarText}>JK</Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>S.A.N.O.V.A. Harare Network</Text>
      </View>
      <TouchableOpacity onPress={() => setCurrentScreen('WALLET')} style={styles.headerPointsBadge}>
        <Ionicons name="wallet" size={14} color="#F59E0B" />
        <Text style={styles.headerPointsText}>${(profile.points * 2.5).toFixed(0)} USD</Text>
      </TouchableOpacity>
    </View>
  );

  // Bottom Navigation Bar
  const renderNavBar = () => (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('HOME')}>
        <Ionicons name={currentScreen === 'HOME' ? 'home' : 'home-outline'} size={22} color={currentScreen === 'HOME' ? COLOR_PRIMARY : COLOR_MUTED} />
        <Text style={[styles.navText, currentScreen === 'HOME' && styles.navTextActive]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('WASTE_GALLERY')}>
        <Ionicons name={currentScreen === 'WASTE_GALLERY' ? 'images' : 'images-outline'} size={22} color={currentScreen === 'WASTE_GALLERY' ? COLOR_PRIMARY : COLOR_MUTED} />
        <Text style={[styles.navText, currentScreen === 'WASTE_GALLERY' && styles.navTextActive]}>Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('SCAN')}>
        <View style={styles.navScanButton}>
          <Ionicons name="add" size={28} color="#FFF" />
        </View>
        <Text style={[styles.navText, { marginTop: 1, fontWeight: 'bold' }]}>Log Waste</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('WALLET')}>
        <Ionicons name={currentScreen === 'WALLET' ? 'cash' : 'cash-outline'} size={22} color={currentScreen === 'WALLET' ? COLOR_PRIMARY : COLOR_MUTED} />
        <Text style={[styles.navText, currentScreen === 'WALLET' && styles.navTextActive]}>Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('SUPPORT_CHAT')}>
        <Ionicons name={currentScreen === 'SUPPORT_CHAT' ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={currentScreen === 'SUPPORT_CHAT' ? COLOR_PRIMARY : COLOR_MUTED} />
        <Text style={[styles.navText, currentScreen === 'SUPPORT_CHAT' && styles.navTextActive]}>AI Chat</Text>
      </TouchableOpacity>
    </View>
  );

  // ==========================================
  // MAIN DASHBOARD & MISSION STATEMENT
  // ==========================================
  const renderHomeScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.homeTopBanner}>
        <View style={styles.homeTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatarMini}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>JK</Text></View>
            <View style={{ marginLeft: 10 }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Welcome,</Text>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>{profile.name}</Text>
            </View>
          </View>
          <View style={styles.locationTag}>
            <Ionicons name="location" size={12} color="#FFF" />
            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold', marginLeft: 3 }}>{profile.suburb}</Text>
          </View>
        </View>

        {/* Mission Statement Hero Card */}
        <View style={styles.missionCard}>
          <View style={styles.missionBadgeRow}>
            <View style={styles.missionPill}>
              <Ionicons name="shield-checkmark" size={12} color={COLOR_PRIMARY} />
              <Text style={styles.missionPillText}>S.A.N.O.V.A. Grant Pitch</Text>
            </View>
            <Text style={{ color: COLOR_MUTED, fontSize: 11 }}>Harare Suburbs</Text>
          </View>
          <Text style={styles.missionHeader}>Exchange Waste for Money & Save Our Environment</Text>
          <Text style={styles.missionBody}>
            Eliminating illegal open dumping & toxic plastic burning across Mbare, Mufakose, and DZ while creating sustainable green incomes.
          </Text>

          <TouchableOpacity style={styles.mainActionBtn} onPress={() => setCurrentScreen('WASTE_GALLERY')}>
            <Ionicons name="images-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.mainActionBtnText}>View Real Waste Gallery & Dumpsites</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>High-Density Action Hub</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.gridCard, { borderColor: '#E2E8F0' }]} onPress={() => setCurrentScreen('WASTE_GALLERY')}>
            <View style={[styles.gridIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="images" size={22} color={COLOR_PRIMARY} />
            </View>
            <Text style={styles.gridTitle}>Real Waste Gallery</Text>
            <Text style={styles.gridSub}>Rust scrap, plastics & dumps</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.gridCard, { borderColor: '#E2E8F0' }]} onPress={() => setCurrentScreen('POOLS')}>
            <View style={[styles.gridIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="people" size={22} color={COLOR_SECONDARY} />
            </View>
            <Text style={styles.gridTitle}>Suburb Pools</Text>
            <Text style={styles.gridSub}>Mbare & Mufakose targets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.gridCard, { borderColor: '#E2E8F0' }]} onPress={() => setCurrentScreen('WALLET')}>
            <View style={[styles.gridIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="cash" size={22} color="#F59E0B" />
            </View>
            <Text style={styles.gridTitle}>EcoCash Cashout</Text>
            <Text style={styles.gridSub}>1.5 kg = $2.50 USD</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.gridCard, { borderColor: '#E2E8F0' }]} onPress={() => setCurrentScreen('SUPPORT_CHAT')}>
            <View style={[styles.gridIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="sparkles" size={22} color={COLOR_DANGER} />
            </View>
            <Text style={styles.gridTitle}>AI Grant Assistant</Text>
            <Text style={styles.gridSub}>10+ interactive options</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );

  // ==========================================
  // SCREEN: REAL WASTE GALLERY & DUMPSITES CATALOG
  // ==========================================
  const renderWasteGalleryScreen = () => {
    const rawWasteStreams = [
      {
        title: 'Weathered Plastic Bottles & Litter Heaps',
        category: 'Plastic Waste',
        weightRate: '1.5 kg = 1 Pt ($2.50 USD)',
        suburbGen: 'Found near Mbare Musika markets and roadside trenches',
        imgUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80',
        desc: 'Uncollected plastic beverage containers, soiled PET bottles, and mixed packaging washed into street corners during rains.',
      },
      {
        title: 'Rusted Iron Sheets & Scrap Metal',
        category: 'Metal Scrap',
        weightRate: '1.5 kg = 1 Pt ($2.50 USD)',
        suburbGen: 'Old roofing sheets, broken frames, and corroded drums',
        imgUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
        desc: 'Corroded iron sheets, old bicycle frames, weathered metal debris, and rusty steel wires collected during yard clearances.',
      },
      {
        title: 'Roadside Dumpsite Waste Overflow',
        category: 'Mixed Dumpsite Refuse',
        weightRate: '1.5 kg = 1 Pt ($2.50 USD)',
        suburbGen: 'Uncollected neighborhood dumping spots in Mufakose & DZ',
        imgUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        desc: 'Mixed refuse heaps containing discarded cartons, broken plastics, and organic waste vulnerable to open burning.',
      },
      {
        title: 'Discarded Obsolete Electronic Waste',
        category: 'E-Waste',
        weightRate: '1.5 kg = 1 Pt ($2.50 USD)',
        suburbGen: 'Broken CRTs, old television parts, and computer scrap',
        imgUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
        desc: 'Discarded electronic equipment casings, damaged circuit boards, and old copper wiring prone to toxic burning.',
      },
      {
        title: 'Discarded Glass Bottles & Broken Shards',
        category: 'Glass Containers',
        weightRate: '1.5 kg = 1 Pt ($2.50 USD)',
        suburbGen: 'Discarded beverage bottles around township shopping centers',
        imgUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
        desc: 'Scattered glass bottles and mixed container fragments retrieved from public pathways to prevent pedestrian injuries.',
      },
    ];

    return (
      <View style={styles.screenContainer}>
        {renderHeader("Real Waste & Dumpsite Gallery")}
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          
          <View style={styles.galleryIntroBanner}>
            <Ionicons name="warning-outline" size={24} color={COLOR_DANGER} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 13, color: COLOR_DARK }}>Actual High-Density Waste Streams</Text>
              <Text style={{ fontSize: 11, color: COLOR_MUTED, marginTop: 2 }}>
                Real photos of uncollected trash, rusted scrap, and dumpsites targeted by S.A.N.O.V.A. for collection and cash payout.
              </Text>
            </View>
          </View>

          {rawWasteStreams.map((item, index) => (
            <View key={index} style={styles.wasteCard}>
              <Image source={{ uri: item.imgUrl }} style={styles.wasteCardImage} />
              <View style={styles.wasteCardContent}>
                <View style={styles.wasteCategoryBadge}>
                  <Text style={styles.wasteCategoryBadgeText}>{item.category}</Text>
                </View>
                <Text style={styles.wasteCardTitle}>{item.title}</Text>
                <Text style={styles.wasteCardDesc}>{item.desc}</Text>
                <Text style={{ fontSize: 10, color: COLOR_MUTED, fontStyle: 'italic', marginBottom: 10 }}>📍 {item.suburbGen}</Text>
                
                <View style={styles.wasteCardFooter}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="cash-outline" size={14} color={COLOR_PRIMARY} />
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLOR_PRIMARY, marginLeft: 4 }}>
                      {item.weightRate}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.logThisWasteBtn}
                    onPress={() => {
                      setScannedCategory(item.category.split(' ')[0]);
                      setScannedItemName(item.title);
                      setCurrentScreen('SCAN');
                    }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 11 }}>Log & Clean This</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    );
  };

  // ==========================================
  // SCREEN: COMMUNITY WASTE POOLS
  // ==========================================
  const renderPoolsScreen = () => (
    <View style={styles.screenContainer}>
      {renderHeader("Community Waste Pools")}
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Select Suburb</Text>
        <View style={styles.suburbPickerRow}>
          {(['Mbare', 'Mufakose', 'Dzivarasekwa'] as const).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.suburbChip, selectedSuburb === s && styles.suburbChipActive]}
              onPress={() => setSelectedSuburb(s)}
            >
              <Text style={[styles.suburbChipText, selectedSuburb === s && styles.suburbChipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.poolTargetCard}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLOR_DARK }}>{selectedSuburb} Dispatch Target</Text>
          <Text style={{ fontSize: 12, color: COLOR_MUTED, marginVertical: 6 }}>
            Target: 5,000 kg total to trigger partner truck pickup.
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: selectedSuburb === 'Mbare' ? '64%' : selectedSuburb === 'Mufakose' ? '82%' : '45%' }]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // ==========================================
  // SCREEN: ECOCASH WALLET
  // ==========================================
  const renderWalletScreen = () => {
    const usdValue = (profile.points * 2.5).toFixed(2);
    return (
      <View style={styles.screenContainer}>
        {renderHeader("EcoCash & USD Wallet")}
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          <View style={styles.walletHero}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' }}>TOTAL EARNINGS</Text>
            <Text style={styles.walletBalanceText}>${usdValue} USD</Text>
            <Text style={{ color: '#FFF', fontSize: 13, marginTop: 4 }}>
              {profile.points} S.A.N.O.V.A. Points Available
            </Text>
          </View>

          <View style={styles.walletFormCard}>
            <Text style={{ fontWeight: 'bold', fontSize: 15, color: COLOR_DARK, marginBottom: 10 }}>Instant EcoCash Payout</Text>
            <TextInput style={styles.textInput} value={ecoCashPhone} onChangeText={setEcoCashPhone} placeholder="EcoCash Phone Number" />
            <TouchableOpacity
              style={styles.actionButtonPrimary}
              onPress={() => alert('EcoCash payout successful!')}
            >
              <Text style={styles.actionButtonText}>Withdraw to EcoCash</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // ==========================================
  // SCREEN: VULNERABILITY HOTSPOT ALERTS
  // ==========================================
  const renderVulnerabilityScreen = () => (
    <View style={styles.screenContainer}>
      {renderHeader("Overland Hazard Reporting")}
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, color: COLOR_DARK, marginBottom: 12 }}>Report Illegal Dump or Drain</Text>
          <TextInput style={styles.textInput} value={hazardLocation} onChangeText={setHazardLocation} placeholder="Location Landmark" />
          <TouchableOpacity
            style={[styles.actionButtonPrimary, { backgroundColor: COLOR_DANGER, marginTop: 14 }]}
            onPress={() => {
              setProfile(p => ({ ...p, points: p.points + 5 }));
              alert('Hazard Alert Logged! +5 Bounty Points awarded.');
              setCurrentScreen('HOME');
            }}
          >
            <Text style={styles.actionButtonText}>Dispatch Hazard Alert</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // ==========================================
  // SCAN SCREEN
  // ==========================================
  const renderScanScreen = () => (
    <View style={styles.screenContainer}>
      {renderHeader("Log Recycled Waste")}
      <View style={styles.scannerViewbox}>
        <View style={styles.scannerOverlayBox}>
          <Ionicons name="scan" size={64} color="#FFF" style={{ opacity: 0.8 }} />
          <Text style={{ color: '#FFF', fontWeight: 'bold', marginTop: 12 }}>Align waste item within frame</Text>
        </View>
      </View>
      <View style={styles.scanFormBody}>
        <Text style={styles.inputLabel}>Weight (Kg)</Text>
        <TextInput style={styles.textInput} value={scannedWeight} onChangeText={setScannedWeight} keyboardType="numeric" />
        <TouchableOpacity
          style={styles.actionButtonPrimary}
          onPress={() => {
            const w = parseFloat(scannedWeight) || 1.0;
            const pts = Math.round(w / 1.5);
            setProfile(p => ({ ...p, points: p.points + pts }));
            alert(`Waste Logged! +${pts} Points earned.`);
            setCurrentScreen('WALLET');
          }}
        >
          <Text style={styles.actionButtonText}>Submit Waste</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ==========================================
  // STATS SCREEN
  // ==========================================
  const renderStatsScreen = () => (
    <View style={styles.screenContainer}>
      {renderHeader("Environmental Impact")}
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <View style={styles.chartPlaceholderCard}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLOR_DARK }}>Total Impact: 352 Kg Diverted</Text>
          <Text style={{ fontSize: 12, color: COLOR_MUTED, marginTop: 4 }}>Zero Open Burning Smoke Recorded</Text>
        </View>
      </ScrollView>
    </View>
  );

  // ==========================================
  // PROFILE SCREEN
  // ==========================================
  const renderProfileScreen = () => (
    <View style={styles.screenContainer}>
      {renderHeader("User Profile", false)}
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileBigAvatar}><Text style={{ color: '#FFF', fontSize: 22, fontWeight: 'bold' }}>JK</Text></View>
          <Text style={styles.profileNameText}>{profile.name}</Text>
          <Text style={styles.profileEmailText}>{profile.email}</Text>
          <Text style={{ color: COLOR_PRIMARY, fontWeight: 'bold', fontSize: 12, marginTop: 4 }}>{profile.level}</Text>
        </View>
      </ScrollView>
    </View>
  );

  // ==========================================
  // FAQ SCREEN
  // ==========================================
  const renderFAQScreen = () => (
    <View style={styles.screenContainer}>
      {renderHeader("FAQ & Mission Guide")}
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <View style={styles.faqCard}>
          <Text style={{ fontWeight: 'bold', fontSize: 13, color: COLOR_DARK }}>What does S.A.N.O.V.A. do?</Text>
          <Text style={{ fontSize: 12, color: COLOR_MUTED, marginTop: 4 }}>We exchange waste for money and stop climate-damaging open burning in Harare.</Text>
        </View>
      </ScrollView>
    </View>
  );

  // ==========================================
  // HISTORY SCREEN
  // ==========================================
  const renderHistoryScreen = () => (
    <View style={styles.screenContainer}>
      {renderHeader("Recycling History")}
      <ScrollView contentContainerStyle={styles.scrollBody}>
        {items.map((it, idx) => (
          <View key={idx} style={styles.historyCard}>
            <Text style={{ fontWeight: 'bold', fontSize: 13, color: COLOR_DARK }}>{it.name}</Text>
            <Text style={{ fontSize: 12, color: COLOR_PRIMARY }}>+{it.weightKg} kg ({it.status})</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // ==========================================
  // REWARD QR SCREEN
  // ==========================================
  const renderRewardQRScreen = () => (
    <View style={styles.screenContainer}>
      {renderHeader("Physical Cash QR Pass")}
      <ScrollView contentContainerStyle={[styles.scrollBody, { alignItems: 'center', justifyContent: 'center' }]}>
        <View style={styles.qrCardMain}>
          <Ionicons name="qr-code" size={160} color={COLOR_PRIMARY} />
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: COLOR_PRIMARY, marginTop: 16 }}>{profile.points} Points Available</Text>
        </View>
      </ScrollView>
    </View>
  );

  // ==========================================
  // AI SUPPORT CHAT SCREEN (10+ AI Options)
  // ==========================================
  const renderSupportChatScreen = () => (
    <KeyboardAvoidingView 
      style={styles.screenContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {renderHeader("S.A.N.O.V.A. AI Assistant")}
      
      <View style={styles.quickChipsContainer}>
        <Text style={styles.quickChipsLabel}>Explore 10 AI Assistant Topics:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage("What does the app do?")}>
            <Ionicons name="help-circle-outline" size={14} color={COLOR_PRIMARY} />
            <Text style={styles.suggestionChipText}>1. What does the app do?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage("How do I get into the program?")}>
            <Ionicons name="rocket-outline" size={14} color={COLOR_SECONDARY} />
            <Text style={styles.suggestionChipText}>2. Join the program</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage("How does EcoCash payout work?")}>
            <Ionicons name="cash-outline" size={14} color="#F59E0B" />
            <Text style={styles.suggestionChipText}>3. EcoCash payouts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage("How does this stop climate change and open burning?")}>
            <Ionicons name="flame-outline" size={14} color={COLOR_DANGER} />
            <Text style={styles.suggestionChipText}>4. Climate & Burning</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage("How do Suburb Waste Pools work?")}>
            <Ionicons name="people-outline" size={14} color={COLOR_PRIMARY} />
            <Text style={styles.suggestionChipText}>5. Suburb Pools</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage("What is the Overland Hazard reporting tool?")}>
            <Ionicons name="warning-outline" size={14} color={COLOR_DANGER} />
            <Text style={styles.suggestionChipText}>6. Hazard Hotline</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage("What waste categories are accepted?")}>
            <Ionicons name="cube-outline" size={14} color={COLOR_SECONDARY} />
            <Text style={styles.suggestionChipText}>7. Accepted Waste</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage("Why will S.A.N.O.V.A. win the $20,000 grant?")}>
            <Ionicons name="trophy-outline" size={14} color="#F59E0B" />
            <Text style={styles.suggestionChipText}>8. Grant Win Pitch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage("Can I pay utility bills like ZETDC?")}>
            <Ionicons name="flash-outline" size={14} color="#F59E0B" />
            <Text style={styles.suggestionChipText}>9. Utility Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSendMessage("How do I contact human support?")}>
            <Ionicons name="call-outline" size={14} color={COLOR_PRIMARY} />
            <Text style={styles.suggestionChipText}>10. Human Support</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.chatScrollBody} showsVerticalScrollIndicator={false}>
        {chatMessages.map((msg, idx) => (
          <View key={idx} style={[styles.chatBubble, msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleSupport]}>
            {msg.sender === 'support' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="sparkles" size={12} color={COLOR_PRIMARY} style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: COLOR_PRIMARY }}>AI ASSISTANT</Text>
              </View>
            )}
            <Text style={{ fontSize: 13, color: msg.sender === 'user' ? '#FFF' : COLOR_DARK, lineHeight: 18 }}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.chatInputRow}>
        <TextInput
          style={styles.chatTextInput}
          placeholder="Ask AI about the grant, payouts, or climate action..."
          value={chatInput}
          onChangeText={setChatInput}
          onSubmitEditing={() => handleSendMessage()}
        />
        <TouchableOpacity style={styles.chatSendBtn} onPress={() => handleSendMessage()}>
          <Ionicons name="send" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLOR_PRIMARY} />
      
      {currentScreen === 'HOME' && renderHomeScreen()}
      {currentScreen === 'WASTE_GALLERY' && renderWasteGalleryScreen()}
      {currentScreen === 'POOLS' && renderPoolsScreen()}
      {currentScreen === 'WALLET' && renderWalletScreen()}
      {currentScreen === 'VULNERABILITY' && renderVulnerabilityScreen()}
      {currentScreen === 'SCAN' && renderScanScreen()}
      {currentScreen === 'STATS' && renderStatsScreen()}
      {currentScreen === 'PROFILE' && renderProfileScreen()}
      {currentScreen === 'FAQ' && renderFAQScreen()}
      {currentScreen === 'HISTORY' && renderHistoryScreen()}
      {currentScreen === 'REWARD_QR' && renderRewardQRScreen()}
      {currentScreen === 'SUPPORT_CHAT' && renderSupportChatScreen()}

      {renderNavBar()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 60,
    backgroundColor: COLOR_PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBackBtn: {
    padding: 4,
  },
  headerAvatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
  },
  headerPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  headerPointsText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  homeTopBanner: {
    backgroundColor: COLOR_PRIMARY,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  homeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  missionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  missionBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  missionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  missionPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLOR_PRIMARY,
    marginLeft: 4,
  },
  missionHeader: {
    fontWeight: 'bold',
    fontSize: 15,
    color: COLOR_DARK,
    lineHeight: 20,
  },
  missionBody: {
    fontSize: 11,
    color: COLOR_MUTED,
    marginTop: 4,
    lineHeight: 16,
  },
  mainActionBtn: {
    backgroundColor: COLOR_PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  mainActionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollBody: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLOR_DARK,
    marginBottom: 10,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  gridIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    color: COLOR_DARK,
  },
  gridSub: {
    fontSize: 10,
    color: COLOR_MUTED,
    marginTop: 2,
  },
  navBar: {
    height: 62,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navScanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLOR_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
    elevation: 4,
  },
  navText: {
    fontSize: 10,
    color: COLOR_MUTED,
    marginTop: 2,
  },
  navTextActive: {
    color: COLOR_PRIMARY,
    fontWeight: 'bold',
  },
  // Waste Gallery Specific Styles
  galleryIntroBanner: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wasteCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  wasteCardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#CBD5E1',
  },
  wasteCardContent: {
    padding: 14,
  },
  wasteCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  wasteCategoryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLOR_DANGER,
  },
  wasteCardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: COLOR_DARK,
    marginBottom: 4,
  },
  wasteCardDesc: {
    fontSize: 12,
    color: COLOR_MUTED,
    lineHeight: 18,
    marginBottom: 6,
  },
  wasteCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  logThisWasteBtn: {
    backgroundColor: COLOR_PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  suburbPickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  suburbChip: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  suburbChipActive: {
    backgroundColor: COLOR_PRIMARY,
    borderColor: COLOR_PRIMARY,
  },
  suburbChipText: {
    fontSize: 12,
    color: COLOR_DARK,
  },
  suburbChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  poolTargetCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLOR_PRIMARY,
  },
  walletHero: {
    backgroundColor: COLOR_PRIMARY,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  walletBalanceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  walletFormCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scannerViewbox: {
    height: 220,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerOverlayBox: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: COLOR_PRIMARY,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFormBody: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLOR_DARK,
    marginBottom: 4,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLOR_DARK,
  },
  actionButtonPrimary: {
    backgroundColor: COLOR_PRIMARY,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chartPlaceholderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileHeaderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  profileBigAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLOR_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileNameText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLOR_DARK,
  },
  profileEmailText: {
    fontSize: 11,
    color: COLOR_MUTED,
  },
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrCardMain: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    marginTop: 10,
  },
  quickChipsContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  quickChipsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLOR_MUTED,
    marginBottom: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLOR_DARK,
    marginLeft: 4,
  },
  chatScrollBody: {
    padding: 16,
  },
  chatBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  chatBubbleSupport: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatBubbleUser: {
    backgroundColor: COLOR_PRIMARY,
    alignSelf: 'flex-end',
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  chatSendBtn: {
    backgroundColor: COLOR_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    borderRadius: 8,
    marginLeft: 8,
  },
});