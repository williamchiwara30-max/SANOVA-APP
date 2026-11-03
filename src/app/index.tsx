import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

/* =========================================================
   S.A.N.O.V.A. — Sanitation Alert Network and Overland
   Vulnerability Action. Exchange waste for money.
   Install: npx expo install expo-image-picker expo-location
   ========================================================= */

type ScreenType =
  | 'HOME' | 'GALLERY' | 'SCAN' | 'WALLET' | 'CHAT'
  | 'POOLS' | 'HAZARD' | 'DONATE' | 'HISTORY' | 'PROFILE';

type Category = 'Plastic' | 'Metal' | 'Paper' | 'Electronics' | 'Glass';
type Suburb = 'Mbare' | 'Mufakose' | 'Dzivarasekwa' | 'Kambuzuma' | 'Kuwadzana';

interface RecycledItem {
  id: string; name: string; category: Category; weightKg: number;
  date: string; status: 'Approved' | 'Pending' | 'Rejected';
}
interface ChatMessage {
  sender: 'user' | 'support'; text: string;
  action?: { label: string; screen: ScreenType };
}

// ---------- Rewards: 1.5 kg = 1 point, 1 point = $2.50 ----------
const KG_PER_POINT = 1.5;
const USD_PER_POINT = 2.5;
const kgToPoints = (kg: number) => Math.round((kg / KG_PER_POINT) * 10) / 10;

// ---------- Theme (same green as before) ----------
const C = {
  primary: '#059669', deep: '#064E3B', soft: '#ECFDF5', mint: '#D1FAE5',
  bg: '#F3F7F5', card: '#FFFFFF', ink: '#0F172A', muted: '#64748B',
  line: '#E2E8F0', gold: '#F59E0B', danger: '#EF4444', blue: '#0284C7',
};

// ---------- REAL WASTE PHOTOS ----------
// Replace these with your own photos of real Harare dumpsites for best results.
// Local file option: image: require('./assets/waste/plastic.jpg')
// If a URL fails to load, a clean placeholder tile is shown instead of a broken image.
const WASTE_STREAMS: {
  category: Category; title: string; where: string; desc: string; uri: string; icon: string;
}[] = [
  {
    category: 'Plastic', icon: 'water-outline', title: 'Plastic bottles & litter heaps',
    where: 'Roadside trenches and market edges',
    desc: 'Used PET bottles and packaging that pile up after rains and end up burnt.',
    uri: 'https://commons.wikimedia.org/wiki/Special:FilePath/Plastic_waste_dump.jpg?width=800',
  },
  {
    category: 'Metal', icon: 'construct-outline', title: 'Rusted scrap metal & iron sheets',
    where: 'Yard clearances and old roofing',
    desc: 'Old roofing sheets, drums and frames. Metal pays the most per trip.',
    uri: 'https://commons.wikimedia.org/wiki/Special:FilePath/Scrap_metal_pile.jpg?width=800',
  },
  {
    category: 'Paper', icon: 'document-text-outline', title: 'Dumpsite refuse & cardboard',
    where: 'Uncollected dump spots in the suburbs',
    desc: 'Mixed refuse where cartons and paper can be pulled out before burning.',
    uri: 'https://commons.wikimedia.org/wiki/Special:FilePath/Landfill_dump_site.jpg?width=800',
  },
  {
    category: 'Electronics', icon: 'hardware-chip-outline', title: 'Discarded electronic waste',
    where: 'Old TVs, circuit boards and cables',
    desc: 'E-waste holds toxic parts. Never burn it; log it for safe collection.',
    uri: 'https://commons.wikimedia.org/wiki/Special:FilePath/Electronic_waste.jpg?width=800',
  },
  {
    category: 'Glass', icon: 'wine-outline', title: 'Glass bottles & broken shards',
    where: 'Shopping centres and footpaths',
    desc: 'Glass left on paths causes injuries. Collect it and earn points.',
    uri: 'https://commons.wikimedia.org/wiki/Special:FilePath/Glass_bottles_waste.jpg?width=800',
  },
];

// ---------- Suburb pools (sample data, replace with your backend) ----------
const SUBURBS: Suburb[] = ['Mbare', 'Mufakose', 'Dzivarasekwa', 'Kambuzuma', 'Kuwadzana'];
const POOLS: Record<Suburb, {
  targetKg: number; households: number; kg: Record<Category, number>;
}> = {
  Mbare:        { targetKg: 10000, households: 1480, kg: { Plastic: 4000, Metal: 2000, Paper: 600, Electronics: 150, Glass: 250 } },
  Mufakose:     { targetKg: 8000,  households: 1000, kg: { Plastic: 3000, Metal: 1000, Paper: 200, Electronics: 80, Glass: 120 } },
  Dzivarasekwa: { targetKg: 8000,  households: 760,  kg: { Plastic: 1900, Metal: 800,  Paper: 300, Electronics: 60, Glass: 140 } },
  Kambuzuma:    { targetKg: 6000,  households: 640,  kg: { Plastic: 1700, Metal: 900,  Paper: 250, Electronics: 40, Glass: 110 } },
  Kuwadzana:    { targetKg: 9000,  households: 1120, kg: { Plastic: 2600, Metal: 1500, Paper: 400, Electronics: 90, Glass: 180 } },
};
const CAT_ICON: Record<Category, string> = {
  Plastic: 'water-outline', Metal: 'construct-outline', Paper: 'document-text-outline',
  Electronics: 'hardware-chip-outline', Glass: 'wine-outline',
};

// ---------- Donation channels ----------
const DONATE_CHANNELS = [
  { id: 'visa', label: 'Visa', icon: 'card-outline', card: true },
  { id: 'mastercard', label: 'Mastercard', icon: 'card', card: true },
  { id: 'ecocash', label: 'EcoCash', icon: 'phone-portrait-outline', card: false },
  { id: 'onemoney', label: 'OneMoney', icon: 'phone-portrait', card: false },
  { id: 'bank', label: 'Bank transfer', icon: 'business-outline', card: false },
];

// ---------- AI assistant: fixed topics so answers never go off topic ----------
type Topic =
  | 'what' | 'join' | 'payout' | 'recycle' | 'pools'
  | 'hazard' | 'categories' | 'donate' | 'utility' | 'support' | 'greet';

const QUICK: { topic: Topic; chip: string; question: string; icon: string }[] = [
  { topic: 'what', chip: 'What the app does', question: 'What does the app do?', icon: 'help-circle-outline' },
  { topic: 'join', chip: 'Join the program', question: 'How do I join the program?', icon: 'rocket-outline' },
  { topic: 'payout', chip: 'EcoCash payouts', question: 'How does EcoCash payout work?', icon: 'cash-outline' },
  { topic: 'recycle', chip: 'Why recycle?', question: 'How does recycling help the environment?', icon: 'leaf-outline' },
  { topic: 'pools', chip: 'Suburb pools', question: 'How do suburb waste pools work?', icon: 'people-outline' },
  { topic: 'hazard', chip: 'Hazard reports', question: 'What is the hazard reporting tool?', icon: 'warning-outline' },
  { topic: 'categories', chip: 'Waste categories', question: 'What waste categories are accepted?', icon: 'cube-outline' },
  { topic: 'donate', chip: 'Donate', question: 'Do you wish to donate?', icon: 'heart-outline' },
  { topic: 'utility', chip: 'Utility payments', question: 'Can I pay utility bills like ZETDC?', icon: 'flash-outline' },
  { topic: 'support', chip: 'Human support', question: 'How do I contact human support?', icon: 'call-outline' },
];

const ANSWERS: Record<Topic, { text: string; action?: { label: string; screen: ScreenType } }> = {
  greet: { text: 'Hello! I can help with S.A.N.O.V.A. Tap a topic above or ask about logging waste, points, payouts or donations.' },
  what: {
    text: 'S.A.N.O.V.A. (Sanitation Alert Network and Overland Vulnerability Action) lets you exchange waste for money. Collect and sort waste, take a photo, log it with GPS, and a recycling company comes to collect it. Your kilograms turn into points you cash out to EcoCash.',
    action: { label: 'Log waste', screen: 'SCAN' },
  },
  join: {
    text: 'Joining takes three steps:\n1. Create an account in the app.\n2. Sort your waste, take photos and log the weight.\n3. Join your suburb pool. When the pool reaches its target, a recycling company collects from your area.',
    action: { label: 'Open suburb pools', screen: 'POOLS' },
  },
  payout: {
    text: 'Every 1.5 kg of sorted waste earns 1 point. Each point is worth $2.50 USD, paid out to your EcoCash number from the Wallet.',
    action: { label: 'Open wallet', screen: 'WALLET' },
  },
  recycle: {
    text: 'S.A.N.O.V.A. recycling helps the environment by saving natural resources, cutting energy use, lowering pollution and reducing landfill waste, as outlined in the EPA Recycling Basics and Benefits.\n\nKey ways recycling helps the planet:\n• Conserves natural resources: recycling paper, metals, glass and plastic means fewer trees cut down and less mining and drilling. Every ton of recycled paper saves about 17 trees.\n• Saves energy: making products from recycled materials takes much less energy. Recycling aluminum uses about 95% less energy than making it from raw bauxite ore.\n• Reduces greenhouse gas emissions: recycled materials cut factory energy needs, and keeping organic waste out of landfills reduces methane.\n• Protects wildlife and habitats: keeping trash out of forests, rivers and oceans stops animals being hurt or poisoned by plastic and electronic waste.\n• Cuts landfill waste: diverting materials to recycling slows how fast dumps grow and lowers the risk of toxic leaks into soil and water.\n\nTo learn more, see the BBC Climate and Recycling Guide.\n\nWould you like tips on sorting your household recyclables, or ideas for reusing common items at home?',
  },
  pools: {
    text: 'A suburb pool adds up everyone\'s logged waste in your area (for example Mbare, Mufakose, Dzivarasekwa, Kambuzuma and Kuwadzana). When the pool reaches its target, a recycling partner collects the combined load in one trip.',
    action: { label: 'See pools', screen: 'POOLS' },
  },
  hazard: {
    text: 'Use Hazard Reports to flag illegal dump sites and blocked drains with your GPS location before the rains cause flooding. Verified reports earn +5 bonus points.',
    action: { label: 'Report a hazard', screen: 'HAZARD' },
  },
  categories: {
    text: 'Accepted waste categories:\n• Plastic (PET bottles, containers)\n• Metal (scrap iron, aluminium, copper, roofing sheets)\n• Paper (cardboard, cartons, office paper)\n• Electronics (e-waste, circuit boards, cables)\n• Glass (bottles and cullet)\n\nSort each category separately and rinse items to speed up approval.',
    action: { label: 'Log waste', screen: 'SCAN' },
  },
  donate: {
    text: 'Do you wish to donate? Your gift funds collection trucks and community clean-ups. You can give with:\n• Visa\n• Mastercard\n• EcoCash\n• OneMoney\n• Bank transfer',
    action: { label: 'Donate now', screen: 'DONATE' },
  },
  utility: {
    text: 'Besides EcoCash, you can convert points to ZETDC prepaid electricity, City of Harare water bill offsets, or Econet and NetOne airtime.',
    action: { label: 'Open wallet', screen: 'WALLET' },
  },
  support: {
    text: 'Our Harare field team is on +263 78 166 5064 or support@sanova.org.zw, Monday to Saturday, 08:00 to 17:00.',
  },
};

const KEYWORDS: Record<Exclude<Topic, 'greet'>, string[]> = {
  what: ['what does the app', 'about the app', 'sanova', 'what is the app', 'what is this app'],
  join: ['join', 'program', 'sign up', 'signup', 'register', 'account', 'start'],
  payout: ['ecocash', 'payout', 'cash out', 'cashout', 'withdraw', 'money', 'points', 'point', 'earn', 'paid'],
  recycle: ['recycling', 'recycle', 'environment', 'climate', 'burn', 'burning', 'smoke', 'planet', 'pollution'],
  pools: ['pool', 'pools', 'truck', 'target', 'suburb', 'mbare', 'mufakose', 'kambuzuma', 'kuwadzana', 'dzivarasekwa'],
  hazard: ['hazard', 'dump', 'dumpsite', 'drain', 'flood', 'vulnerability', 'report'],
  categories: ['category', 'categories', 'accepted', 'accept', 'plastic', 'metal', 'paper', 'glass', 'electronics', 'ewaste', 'e-waste', 'waste types'],
  donate: ['donate', 'donation', 'give', 'visa', 'mastercard', 'support the project'],
  utility: ['zetdc', 'electricity', 'water bill', 'bill', 'bills', 'airtime', 'utility'],
  support: ['human', 'contact', 'admin', 'agent', 'phone number', 'email', 'help desk'],
};

function detectTopic(query: string): Topic | null {
  const text = ' ' + query.toLowerCase().replace(/[^a-z0-9$\- ]/g, ' ').replace(/\s+/g, ' ') + ' ';
  let best: Topic | null = null;
  let bestScore = 0;
  (Object.keys(KEYWORDS) as (keyof typeof KEYWORDS)[]).forEach(topic => {
    let score = 0;
    KEYWORDS[topic].forEach(k => {
      if (text.includes(' ' + k + ' ') || text.includes(' ' + k + 's ')) score += k.includes(' ') ? 2 : 1;
    });
    if (score > bestScore) { best = topic; bestScore = score; }
  });
  if (best) return best;
  const words = text.trim().split(' ');
  if (words.length <= 4 && words.some(w => ['hi', 'hie', 'hello', 'hey'].includes(w))) return 'greet';
  return null;
}

const OFF_TOPIC =
  'I can only help with S.A.N.O.V.A.: logging waste, points and payouts, suburb pools, accepted waste categories, hazard reports, recycling and donations. Pick one of the topics above to continue.';

// ---------- Small reusable pieces ----------
function Photo({ uri, icon, style }: { uri: string; icon: string; style: any }) {
  const [failed, setFailed] = useState(false);
  if (failed || !uri) {
    return (
      <View style={[style, { backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name={icon as any} size={40} color={C.primary} />
      </View>
    );
  }
  return <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setFailed(true)} />;
}

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('HOME');
  const [points, setPoints] = useState(120);
  const [items, setItems] = useState<RecycledItem[]>([
    { id: 'SAN-901', name: 'PET bottles', category: 'Plastic', weightKg: 12.5, date: '2026-10-30', status: 'Approved' },
    { id: 'SAN-902', name: 'Scrap iron & roof sheets', category: 'Metal', weightKg: 24, date: '2026-10-28', status: 'Approved' },
    { id: 'SAN-903', name: 'Cardboard & cartons', category: 'Paper', weightKg: 8.5, date: '2026-10-25', status: 'Pending' },
    { id: 'SAN-904', name: 'Computer motherboards', category: 'Electronics', weightKg: 3.2, date: '2026-10-21', status: 'Approved' },
  ]);
  const name = 'John Kundai';
  const homeSuburb: Suburb = 'Mbare';

  const [pool, setPool] = useState<Suburb>('Mbare');

  // Log waste
  const [logCategory, setLogCategory] = useState<Category>('Plastic');
  const [logWeight, setLogWeight] = useState('10');
  const [logPhoto, setLogPhoto] = useState<string | null>(null);
  const [logCoords, setLogCoords] = useState<string | null>(null);

  // Wallet / hazard
  const [phone, setPhone] = useState('+263 77 123 4567');
  const [hazardLocation, setHazardLocation] = useState('');

  // Donate
  const [channel, setChannel] = useState('ecocash');
  const [amount, setAmount] = useState('5');
  const [cardNo, setCardNo] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Chat
  const [chat, setChat] = useState<ChatMessage[]>([
    { sender: 'support', text: 'S.A.N.O.V.A. assistant here. Tap a topic or type a question about the app.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const usd = (points * USD_PER_POINT).toFixed(2);
  const totalKg = items.reduce((s, i) => s + i.weightKg, 0);

  // ---------- actions ----------
  const sendChat = (topic?: Topic, label?: string) => {
    const text = (label ?? chatInput).trim();
    if (!text) return;
    const resolved: Topic | null = topic ?? detectTopic(text);
    const reply: ChatMessage = resolved
      ? { sender: 'support', ...ANSWERS[resolved] }
      : { sender: 'support', text: OFF_TOPIC };
    setChat(prev => [...prev, { sender: 'user', text }, reply]);
    if (!label) setChatInput('');
  };

  const takePhoto = async (camera: boolean) => {
    try {
      const perm = camera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission needed', 'Allow access to add a photo of your waste.'); return; }
      const res = camera
        ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
      if (!res.canceled) setLogPhoto(res.assets[0].uri);
    } catch { Alert.alert('Photo failed', 'Could not open the camera or gallery. Try again.'); }
  };

  const getGps = async (setter: (v: string) => void) => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') { Alert.alert('Location needed', 'Allow location so collectors can find your waste.'); return; }
      const pos = await Location.getCurrentPositionAsync({});
      setter(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
    } catch { Alert.alert('Location failed', 'Could not read your GPS position. Check that location is on.'); }
  };

  const submitWaste = () => {
    const kg = parseFloat(logWeight);
    if (!kg || kg <= 0) { Alert.alert('Enter weight', 'Type the weight in kg, for example 10.'); return; }
    if (!logPhoto) { Alert.alert('Add a photo', 'Take or choose a photo of the waste first.'); return; }
    const pts = kgToPoints(kg);
    setItems(prev => [{
      id: `SAN-${900 + prev.length + 1}`, name: `${logCategory} waste`, category: logCategory,
      weightKg: kg, date: new Date().toISOString().slice(0, 10), status: 'Pending',
    }, ...prev]);
    setPoints(p => Math.round((p + pts) * 10) / 10);
    setLogPhoto(null); setLogCoords(null);
    Alert.alert('Waste logged', `+${pts} points earned (${kg} kg). A collector will review it.`);
    setScreen('WALLET');
  };

  const confirmDonation = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { Alert.alert('Enter amount', 'Choose or type a donation amount.'); return; }
    const ch = DONATE_CHANNELS.find(c => c.id === channel)!;
    if (ch.card && (cardNo.replace(/\s/g, '').length < 12 || !cardExp || cardCvc.length < 3)) {
      Alert.alert('Card details', 'Enter the card number, expiry and CVC.'); return;
    }
    // TODO: connect a real payment gateway (e.g. Paynow or Stripe). Never store card numbers in the app.
    Alert.alert('Thank you', `Your $${amt.toFixed(2)} donation via ${ch.label} is being processed.`);
    setCardNo(''); setCardExp(''); setCardCvc('');
    setScreen('HOME');
  };

  // ---------- shared chrome ----------
  const Header = ({ title }: { title: string }) => (
    <View style={s.header}>
      <TouchableOpacity onPress={() => setScreen('HOME')} style={s.backBtn}>
        <Ionicons name="chevron-back" size={22} color="#FFF" />
      </TouchableOpacity>
      <Text style={s.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={() => setScreen('WALLET')} style={s.balancePill}>
        <Ionicons name="wallet" size={13} color={C.gold} />
        <Text style={s.balancePillText}>${usd}</Text>
      </TouchableOpacity>
    </View>
  );

  const NavBar = () => {
    const tab = (id: ScreenType, label: string, on: string, off: string) => (
      <TouchableOpacity style={s.navItem} onPress={() => setScreen(id)} key={id}>
        <Ionicons name={(screen === id ? on : off) as any} size={22} color={screen === id ? C.primary : C.muted} />
        <Text style={[s.navText, screen === id && { color: C.primary, fontWeight: '700' }]}>{label}</Text>
      </TouchableOpacity>
    );
    return (
      <View style={s.navBar}>
        {tab('HOME', 'Home', 'home', 'home-outline')}
        {tab('GALLERY', 'Waste', 'images', 'images-outline')}
        <TouchableOpacity style={s.navItem} onPress={() => setScreen('SCAN')}>
          <View style={s.navFab}><Ionicons name="camera" size={26} color="#FFF" /></View>
          <Text style={[s.navText, { fontWeight: '700', color: C.primary }]}>Log</Text>
        </TouchableOpacity>
        {tab('WALLET', 'Wallet', 'cash', 'cash-outline')}
        {tab('CHAT', 'Assistant', 'chatbubbles', 'chatbubbles-outline')}
      </View>
    );
  };

  // ---------- HOME ----------
  const Home = () => (
    <ScrollView style={s.flex} showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        <View style={s.heroTop}>
          <View>
            <Text style={s.heroHello}>Good day,</Text>
            <Text style={s.heroName}>{name}</Text>
          </View>
          <TouchableOpacity style={s.heroAvatar} onPress={() => setScreen('PROFILE')}>
            <Text style={s.heroAvatarText}>JK</Text>
          </TouchableOpacity>
        </View>
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Your earnings</Text>
          <Text style={s.balanceValue}>${usd}</Text>
          <Text style={s.balanceSub}>{points} points · {totalKg.toFixed(1)} kg recycled</Text>
          <View style={s.balanceRow}>
            <TouchableOpacity style={s.balanceBtn} onPress={() => setScreen('WALLET')}>
              <Ionicons name="arrow-down-circle-outline" size={18} color="#FFF" />
              <Text style={s.balanceBtnText}>Cash out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.balanceBtn, s.balanceBtnLight]} onPress={() => setScreen('SCAN')}>
              <Ionicons name="add-circle-outline" size={18} color={C.deep} />
              <Text style={[s.balanceBtnText, { color: C.deep }]}>Log waste</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={s.body}>
        <Text style={s.h2}>Exchange waste for money</Text>
        <Text style={s.p}>1.5 kg of sorted waste = 1 point = $2.50 USD, paid to EcoCash.</Text>

        <View style={s.grid}>
          {([
            ['POOLS', 'people', 'Suburb pools', `${homeSuburb} and 4 more`],
            ['HAZARD', 'warning', 'Report hazard', '+5 bonus points'],
            ['DONATE', 'heart', 'Donate', 'Visa, Mastercard, EcoCash'],
            ['HISTORY', 'time', 'My history', `${items.length} logs`],
          ] as [ScreenType, string, string, string][]).map(([id, icon, t, sub]) => (
            <TouchableOpacity key={id} style={s.gridCard} onPress={() => setScreen(id)}>
              <View style={s.gridIcon}><Ionicons name={icon as any} size={20} color={C.primary} /></View>
              <Text style={s.gridTitle}>{t}</Text>
              <Text style={s.gridSub}>{sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.rowBetween}>
          <Text style={s.h2}>What we collect</Text>
          <TouchableOpacity onPress={() => setScreen('GALLERY')}><Text style={s.link}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {WASTE_STREAMS.map(w => (
            <TouchableOpacity key={w.category} style={s.miniCard} onPress={() => setScreen('GALLERY')}>
              <Photo uri={w.uri} icon={w.icon} style={s.miniImg} />
              <Text style={s.miniTitle}>{w.category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={{ height: 24 }} />
      </View>
    </ScrollView>
  );

  // ---------- GALLERY ----------
  const Gallery = () => (
    <View style={s.flex}>
      <Header title="Waste we collect" />
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {WASTE_STREAMS.map(w => (
          <View key={w.category} style={s.wasteCard}>
            <Photo uri={w.uri} icon={w.icon} style={s.wasteImg} />
            <View style={s.wasteBadge}><Text style={s.wasteBadgeText}>{w.category}</Text></View>
            <View style={{ padding: 14 }}>
              <Text style={s.cardTitle}>{w.title}</Text>
              <Text style={s.p}>{w.desc}</Text>
              <Text style={s.where}>{w.where}</Text>
              <View style={s.wasteFooter}>
                <Text style={s.rate}>1.5 kg = 1 point = $2.50</Text>
                <TouchableOpacity style={s.smallBtn} onPress={() => { setLogCategory(w.category); setScreen('SCAN'); }}>
                  <Text style={s.smallBtnText}>Log this</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // ---------- LOG WASTE ----------
  const Scan = () => {
    const kg = parseFloat(logWeight) || 0;
    return (
      <View style={s.flex}>
        <Header title="Log waste" />
        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={s.photoBox} onPress={() => takePhoto(true)} activeOpacity={0.85}>
            {logPhoto ? (
              <Image source={{ uri: logPhoto }} style={s.photoPreview} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={40} color={C.primary} />
                <Text style={s.photoText}>Take a photo of your waste</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => takePhoto(false)}>
            <Text style={[s.link, { textAlign: 'center', marginTop: 8 }]}>Choose from gallery instead</Text>
          </TouchableOpacity>

          <Text style={s.label}>Category</Text>
          <View style={s.chipRow}>
            {(Object.keys(CAT_ICON) as Category[]).map(c => (
              <TouchableOpacity key={c} style={[s.chip, logCategory === c && s.chipOn]} onPress={() => setLogCategory(c)}>
                <Ionicons name={CAT_ICON[c] as any} size={14} color={logCategory === c ? '#FFF' : C.primary} />
                <Text style={[s.chipText, logCategory === c && { color: '#FFF' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Weight (kg)</Text>
          <TextInput style={s.input} value={logWeight} onChangeText={setLogWeight} keyboardType="numeric" />
          <Text style={s.hint}>You will earn {kgToPoints(kg)} points (${(kgToPoints(kg) * USD_PER_POINT).toFixed(2)}).</Text>

          <Text style={s.label}>Location</Text>
          <TouchableOpacity style={s.gpsBtn} onPress={() => getGps(setLogCoords)}>
            <Ionicons name="location" size={18} color={C.primary} />
            <Text style={s.gpsText}>{logCoords ?? 'Tap to attach my GPS location'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.primaryBtn} onPress={submitWaste}>
            <Text style={s.primaryBtnText}>Submit waste</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // ---------- POOLS ----------
  const Pools = () => {
    const p = POOLS[pool];
    const total = Object.values(p.kg).reduce((a, b) => a + b, 0);
    const pct = Math.min(100, Math.round((total / p.targetKg) * 100));
    return (
      <View style={s.flex}>
        <Header title="Suburb pools" />
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
            {SUBURBS.map(sub => (
              <TouchableOpacity key={sub} style={[s.chip, pool === sub && s.chipOn]} onPress={() => setPool(sub)}>
                <Text style={[s.chipText, pool === sub && { color: '#FFF' }]}>{sub}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.poolCard}>
            <Text style={s.poolTitle}>{pool}</Text>
            <Text style={s.poolBig}>{total.toLocaleString()} kg</Text>
            <Text style={s.poolSub}>of {p.targetKg.toLocaleString()} kg needed for a truck · {p.households.toLocaleString()} households</Text>
            <View style={s.barBg}><View style={[s.barFill, { width: `${pct}%` }]} /></View>
            <Text style={s.poolPct}>{pct}% of target</Text>
          </View>

          <Text style={s.h2}>Collected by category</Text>
          {(Object.keys(p.kg) as Category[]).map(c => (
            <View key={c} style={s.catRow}>
              <View style={s.gridIcon}><Ionicons name={CAT_ICON[c] as any} size={18} color={C.primary} /></View>
              <Text style={s.catName}>{c}</Text>
              <Text style={s.catKg}>{p.kg[c].toLocaleString()} kg</Text>
            </View>
          ))}
          <Text style={s.hint}>Figures shown are sample data until your backend is connected.</Text>
        </ScrollView>
      </View>
    );
  };

  // ---------- WALLET ----------
  const Wallet = () => (
    <View style={s.flex}>
      <Header title="Wallet" />
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <View style={s.walletHero}>
          <Text style={s.balanceLabel}>Available</Text>
          <Text style={s.walletValue}>${usd}</Text>
          <Text style={s.balanceSub}>{points} points</Text>
        </View>
        <View style={s.formCard}>
          <Text style={s.cardTitle}>Withdraw to EcoCash</Text>
          <Text style={s.label}>EcoCash number</Text>
          <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => Alert.alert('Withdrawal requested', `$${usd} is on its way to ${phone}.`)}
          >
            <Text style={s.primaryBtnText}>Withdraw ${usd}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.outlineBtn} onPress={() => setScreen('DONATE')}>
          <Ionicons name="heart-outline" size={18} color={C.primary} />
          <Text style={s.outlineBtnText}>Donate to S.A.N.O.V.A.</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // ---------- DONATE ----------
  const Donate = () => {
    const ch = DONATE_CHANNELS.find(c => c.id === channel)!;
    return (
      <View style={s.flex}>
        <Header title="Donate" />
        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
          <Text style={s.h2}>Do you wish to donate?</Text>
          <Text style={s.p}>Your gift pays for collection trucks and clean-ups in Harare suburbs.</Text>

          <Text style={s.label}>Amount (USD)</Text>
          <View style={s.chipRow}>
            {['1', '5', '10', '20'].map(a => (
              <TouchableOpacity key={a} style={[s.chip, amount === a && s.chipOn]} onPress={() => setAmount(a)}>
                <Text style={[s.chipText, amount === a && { color: '#FFF' }]}>${a}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={[s.input, { marginTop: 10 }]} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Other amount" />

          <Text style={s.label}>Donating channel</Text>
          {DONATE_CHANNELS.map(c => (
            <TouchableOpacity key={c.id} style={[s.channelRow, channel === c.id && s.channelOn]} onPress={() => setChannel(c.id)}>
              <Ionicons name={c.icon as any} size={22} color={C.primary} />
              <Text style={s.channelText}>{c.label}</Text>
              <Ionicons name={channel === c.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={C.primary} />
            </TouchableOpacity>
          ))}

          {ch.card && (
            <View style={s.formCard}>
              <Text style={s.label}>Card number</Text>
              <TextInput style={s.input} value={cardNo} onChangeText={setCardNo} keyboardType="numeric" placeholder="1234 5678 9012 3456" maxLength={19} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Expiry</Text>
                  <TextInput style={s.input} value={cardExp} onChangeText={setCardExp} placeholder="MM/YY" maxLength={5} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>CVC</Text>
                  <TextInput style={s.input} value={cardCvc} onChangeText={setCardCvc} keyboardType="numeric" placeholder="123" maxLength={4} secureTextEntry />
                </View>
              </View>
            </View>
          )}
          {channel === 'ecocash' || channel === 'onemoney' ? (
            <View style={s.formCard}>
              <Text style={s.label}>Mobile number</Text>
              <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
          ) : null}
          {channel === 'bank' && (
            <View style={s.formCard}>
              <Text style={s.p}>You will receive the bank account details after you confirm.</Text>
            </View>
          )}

          <TouchableOpacity style={s.primaryBtn} onPress={confirmDonation}>
            <Text style={s.primaryBtnText}>Donate ${parseFloat(amount) || 0} with {ch.label}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // ---------- HAZARD ----------
  const Hazard = () => (
    <View style={s.flex}>
      <Header title="Report a hazard" />
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <View style={s.formCard}>
          <Text style={s.cardTitle}>Illegal dump or blocked drain</Text>
          <Text style={s.label}>Landmark</Text>
          <TextInput style={s.input} value={hazardLocation} onChangeText={setHazardLocation} placeholder="e.g. Near Mbare Musika terminus" />
          <TouchableOpacity style={[s.gpsBtn, { marginTop: 12 }]} onPress={() => getGps(setHazardLocation)}>
            <Ionicons name="location" size={18} color={C.primary} />
            <Text style={s.gpsText}>Use my GPS location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: C.danger }]}
            onPress={() => {
              if (!hazardLocation.trim()) { Alert.alert('Add a location', 'Type a landmark or use GPS.'); return; }
              setPoints(p => p + 5);
              setHazardLocation('');
              Alert.alert('Hazard reported', '+5 bonus points once the report is verified.');
              setScreen('HOME');
            }}
          >
            <Text style={s.primaryBtnText}>Send report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // ---------- HISTORY ----------
  const History = () => (
    <View style={s.flex}>
      <Header title="My history" />
      <ScrollView contentContainerStyle={s.body}>
        {items.map(it => (
          <View key={it.id} style={s.historyRow}>
            <View style={s.gridIcon}><Ionicons name={CAT_ICON[it.category] as any} size={18} color={C.primary} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.cardTitle}>{it.name}</Text>
              <Text style={s.where}>{it.id} · {it.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.catKg}>{it.weightKg} kg</Text>
              <Text style={[s.status, { color: it.status === 'Approved' ? C.primary : it.status === 'Pending' ? C.gold : C.danger }]}>{it.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // ---------- PROFILE ----------
  const Profile = () => (
    <View style={s.flex}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={s.body}>
        <View style={s.profileCard}>
          <View style={[s.heroAvatar, { width: 68, height: 68, borderRadius: 34 }]}><Text style={[s.heroAvatarText, { fontSize: 22 }]}>JK</Text></View>
          <Text style={s.h2}>{name}</Text>
          <Text style={s.p}>kundai@sanova.org.zw · {homeSuburb}, Harare</Text>
          <Text style={[s.link, { marginTop: 4 }]}>Community Climate Champion</Text>
        </View>
        <View style={s.statRow}>
          <View style={s.stat}><Text style={s.statNum}>{totalKg.toFixed(1)}</Text><Text style={s.statLbl}>kg recycled</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{points}</Text><Text style={s.statLbl}>points</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{Math.round(totalKg * 1.9)}</Text><Text style={s.statLbl}>kg CO₂ avoided*</Text></View>
        </View>
        <Text style={s.hint}>*Estimate for demonstration.</Text>
      </ScrollView>
    </View>
  );

  // ---------- CHAT ----------
  const Chat = () => (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <Header title="S.A.N.O.V.A. assistant" />
      <View style={s.topics}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
          {QUICK.map((q, i) => (
            <TouchableOpacity key={q.topic} style={s.chip} onPress={() => sendChat(q.topic, q.question)}>
              <Ionicons name={q.icon as any} size={14} color={C.primary} />
              <Text style={s.chipText}>{i + 1}. {q.chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView style={s.flex} contentContainerStyle={{ padding: 16 }}>
        {chat.map((m, i) => (
          <View key={i} style={[s.bubble, m.sender === 'user' ? s.bubbleUser : s.bubbleBot]}>
            <Text style={{ fontSize: 14, lineHeight: 20, color: m.sender === 'user' ? '#FFF' : C.ink }}>{m.text}</Text>
            {m.action && (
              <TouchableOpacity style={s.bubbleAction} onPress={() => setScreen(m.action!.screen)}>
                <Text style={s.bubbleActionText}>{m.action.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={s.chatInputRow}>
        <TextInput
          style={s.chatInput}
          placeholder="Ask about S.A.N.O.V.A."
          value={chatInput}
          onChangeText={setChatInput}
          onSubmitEditing={() => sendChat()}
          returnKeyType="send"
        />
        <TouchableOpacity style={s.sendBtn} onPress={() => sendChat()}>
          <Ionicons name="send" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      {screen === 'HOME' && Home()}
      {screen === 'GALLERY' && Gallery()}
      {screen === 'SCAN' && Scan()}
      {screen === 'POOLS' && Pools()}
      {screen === 'WALLET' && Wallet()}
      {screen === 'DONATE' && Donate()}
      {screen === 'HAZARD' && Hazard()}
      {screen === 'HISTORY' && History()}
      {screen === 'PROFILE' && Profile()}
      {screen === 'CHAT' && Chat()}
      {NavBar()}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.primary },
  flex: { flex: 1, backgroundColor: C.bg },
  body: { padding: 16 },

  // header
  header: { height: 58, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 18, fontWeight: '800', marginLeft: 12, letterSpacing: -0.3 },
  balancePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4 },
  balancePillText: { color: '#FFF', fontWeight: '800', fontSize: 12 },

  // home hero
  hero: { backgroundColor: C.primary, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 56, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heroHello: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  heroName: { color: '#FFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  heroAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { color: '#FFF', fontWeight: '800' },
  balanceCard: { backgroundColor: C.deep, borderRadius: 24, padding: 20, marginBottom: -48 },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  balanceValue: { color: '#FFF', fontSize: 40, fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  balanceSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  balanceRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  balanceBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.primary, paddingVertical: 12, borderRadius: 14 },
  balanceBtnLight: { backgroundColor: C.mint },
  balanceBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // type
  h2: { fontSize: 18, fontWeight: '800', color: C.ink, letterSpacing: -0.3, marginBottom: 4 },
  p: { fontSize: 13, color: C.muted, lineHeight: 19 },
  link: { color: C.primary, fontWeight: '700', fontSize: 13 },
  label: { fontSize: 13, fontWeight: '700', color: C.ink, marginTop: 16, marginBottom: 6 },
  hint: { fontSize: 12, color: C.muted, marginTop: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },

  // grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16, rowGap: 12 },
  gridCard: { width: '48.5%', backgroundColor: C.card, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: C.line },
  gridIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  gridTitle: { fontWeight: '800', fontSize: 14, color: C.ink, marginTop: 10 },
  gridSub: { fontSize: 11, color: C.muted, marginTop: 2 },

  miniCard: { width: 130 },
  miniImg: { width: 130, height: 110, borderRadius: 18 },
  miniTitle: { marginTop: 6, fontWeight: '700', fontSize: 13, color: C.ink },

  // gallery
  wasteCard: { backgroundColor: C.card, borderRadius: 24, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: C.line },
  wasteImg: { width: '100%', height: 190 },
  wasteBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: C.deep, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  wasteBadgeText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.ink, marginBottom: 4 },
  where: { fontSize: 12, color: C.muted, marginTop: 6 },
  wasteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line },
  rate: { color: C.primary, fontWeight: '700', fontSize: 12 },
  smallBtn: { backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  smallBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  // form
  formCard: { backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.line, marginTop: 12 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.ink },
  primaryBtn: { backgroundColor: C.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  outlineBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.primary, borderRadius: 16, paddingVertical: 13, marginTop: 14 },
  outlineBtnText: { color: C.primary, fontWeight: '800', fontSize: 14 },
  photoBox: { height: 190, borderRadius: 24, backgroundColor: C.soft, borderWidth: 2, borderColor: C.mint, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  photoText: { color: C.deep, fontWeight: '700', marginTop: 8 },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.soft, borderRadius: 14, padding: 14 },
  gpsText: { color: C.deep, fontWeight: '600', fontSize: 13, flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF', borderWidth: 1, borderColor: C.mint, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipOn: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: C.ink },
  channelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 14, marginBottom: 8 },
  channelOn: { borderColor: C.primary, backgroundColor: C.soft },
  channelText: { flex: 1, fontSize: 15, fontWeight: '700', color: C.ink },

  // pools
  poolCard: { backgroundColor: C.deep, borderRadius: 24, padding: 20, marginVertical: 16 },
  poolTitle: { color: 'rgba(255,255,255,0.75)', fontWeight: '700', fontSize: 13 },
  poolBig: { color: '#FFF', fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  poolSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  barBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, marginTop: 14, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#34D399', borderRadius: 5 },
  poolPct: { color: '#FFF', fontWeight: '700', fontSize: 12, marginTop: 6 },
  catRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 12, marginTop: 8, borderWidth: 1, borderColor: C.line },
  catName: { flex: 1, marginLeft: 12, fontWeight: '700', color: C.ink, fontSize: 14 },
  catKg: { fontWeight: '800', color: C.ink, fontSize: 14 },

  // wallet / history / profile
  walletHero: { backgroundColor: C.primary, borderRadius: 24, padding: 24, alignItems: 'center' },
  walletValue: { color: '#FFF', fontSize: 42, fontWeight: '800', letterSpacing: -1 },
  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  status: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  profileCard: { backgroundColor: C.card, borderRadius: 24, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: C.line, gap: 4 },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: { flex: 1, backgroundColor: C.card, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  statNum: { fontSize: 20, fontWeight: '800', color: C.primary },
  statLbl: { fontSize: 11, color: C.muted, marginTop: 2, textAlign: 'center' },

  // chat
  topics: { backgroundColor: '#FFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  bubble: { maxWidth: '88%', padding: 13, borderRadius: 18, marginBottom: 10 },
  bubbleBot: { backgroundColor: '#FFF', alignSelf: 'flex-start', borderWidth: 1, borderColor: C.line, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: C.primary, alignSelf: 'flex-end', borderTopRightRadius: 4 },
  bubbleAction: { alignSelf: 'flex-start', backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginTop: 10 },
  bubbleActionText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  chatInputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: C.line, gap: 8 },
  chatInput: { flex: 1, backgroundColor: C.bg, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },

  // nav
  navBar: { height: 64, backgroundColor: '#FFF', flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center' },
  navFab: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: -22, elevation: 5, borderWidth: 4, borderColor: '#FFF' },
  navText: { fontSize: 10, color: C.muted, marginTop: 2 },
});