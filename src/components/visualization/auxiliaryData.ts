// Define a sophisticated color palette for categories
export const categoryColors: Record<string, string> = {
  'Sociaal & Maatschappelijk': '#0699a9',
  'Economisch': '#702f8e',
  'Ecologisch': '#84b440',
  'Geopolitiek & militair': '#a8aaad',
  'Technologisch & digitaal': '#abccd5',
  'Gezondheid': '#e42259'
};

// Optional renaming of 'Dreiging' attribute (key = old name, value = new name)
export const nodeRename: Record<string, string> = {"(heimelijke) beïnvloeding en hybride operaties door statelijke actoren die aangrijpen op het maatschappelijk debat": "Heimelijke beïnvloeding die aangrijpt op het maatschappelijk debat"};
export const gebiedRename: Record<string, string> = {'samenleving (sociaal/psychologisch)': 'samenleving', 'kritieke infrastructuur en functies': 'kritieke infrastructuur'};

// Map Dreiging to category
const nodeCategoryMap: Record<string, string> = {
    'Overstroming zee': 'Ecologisch',
    'Pandemie door een mens overdraagbaar virus': 'Gezondheid',
    'IS grijpt de macht in Marokko': 'Geopolitiek & militair',
    'Inzet van kernwapens Saoedi-Arabië – Iran': 'Geopolitiek & militair',
    'Geïnduceerde aardbeving': 'Ecologisch',
    'Keteneffecten elektriciteitsuitval': 'Technologisch & digitaal',
    'Chinese hereniging Taiwan': 'Geopolitiek & militair',
    'Tijdelijke bezetting van een EU-lidstaat': 'Geopolitiek & militair',
    'Overstroming rivier': 'Ecologisch',
    'Griep pandemie': 'Gezondheid',
    'Uiteenvallen van de NAVO': 'Geopolitiek & militair',
    'Systeempartij in de financiële sector in zwaar weer': 'Economisch',
    'Hitte/droogte': 'Ecologisch',
    'Onzekerheid energievoorziening': 'Economisch',
    'Aanval Cloud Service Provider': 'Technologisch & digitaal',
    'Kerncentrale Borssele': 'Technologisch & digitaal',
    'Treinramp met gaswolkbrand': 'Technologisch & digitaal',
    'Ransomware telecom': 'Technologisch & digitaal',
    'Handelsoorlog waar de EU bij betrokken is': 'Economisch',
    'Meervoudige terroristische aanslag': 'Sociaal & Maatschappelijk',
    'Verstoring van het betalingsverkeer': 'Economisch',
    'Staatlijke verwerving van een belang in grote telecom-aanbieder': 'Economisch',
    'Infiltratie openbaar bestuur': 'Sociaal & Maatschappelijk',
    'Sneeuwstorm': 'Ecologisch',
    'Crisis in de Zuid-Chinese Zee': 'Geopolitiek & militair',
    'Tweespalt in de EU': 'Geopolitiek & militair',
    'Crimineel geweld richting media en overheid': 'Sociaal & Maatschappelijk',
    'Ongewenste buitenlandse inmenging in diasporagemeenschappen': 'Sociaal & Maatschappelijk',
    'Bestorming en gijzeling Tweede Kamer': 'Sociaal & Maatschappelijk',
    'Landelijke black-out': 'Technologisch & digitaal',
    '(heimelijke) beïnvloeding en hybride operaties door statelijke actoren die aangrijpen op het maatschappelijk debat': 'Geopolitiek & militair',
    'Polarisatie rond complottheorieën': 'Sociaal & Maatschappelijk',
    'Desintegratie van Bosnië-Herzegovina': 'Geopolitiek & militair',
    'Griep epidemie': 'Gezondheid',
    'Verstoring van handel door productieproblemen buitenland': 'Economisch',
    'Natuurbranden': 'Ecologisch',
    'Stralingsongeval in Europa': 'Technologisch & digitaal',
    'Falen opslagtank ammoniak': 'Technologisch & digitaal',
    'Europese schuldencrisis': 'Economisch',
    'Cyberaanvallen kritieke infrastructuur': 'Technologisch & digitaal',
    'Ransomware zorgsector': 'Technologisch & digitaal',
    'Terroristische aanslag met een bio-wapen': 'Gezondheid',
    'Uiteenspatten van de OVSE': 'Geopolitiek & militair',
    'Aanval op pride evenement': 'Sociaal & Maatschappelijk',
    'Natuurlijke aardbeving': 'Ecologisch',
    'Geweldsescalatie rechtsextremisten': 'Sociaal & Maatschappelijk',
    'Anarcho-extremisme': 'Sociaal & Maatschappelijk',
    'Buitenlandse regulering techbedrijven': 'Economisch',
    'Ondermijnende enclaves': 'Sociaal & Maatschappelijk',
    'Cyberspionage overheid': 'Technologisch & digitaal',
    'Georganiseerde criminaliteit door heel Nederland': 'Sociaal & Maatschappelijk',
    'Uitbraak MKZ onder koeien': 'Gezondheid',
    'Klassieke statelijke spionage': 'Geopolitiek & militair',
    'Innovatie nucleaire overbrengingsmiddelen': 'Geopolitiek & militair',
    'Correctie op waardering financiële activa': 'Economisch',
    'Misconfiguratie Internetdienstverlener': 'Technologisch & digitaal',
    'Criminele inmenging bedrijfsleven': 'Sociaal & Maatschappelijk',
    'Anti-overheidsextremisme': 'Sociaal & Maatschappelijk',
    'Collateral damage': 'Geopolitiek & militair',
    'Uitbraak zoönotische variant vogelgriep': 'Gezondheid',
    'Tekorten essentiële grondstoffen': 'Economisch',
    'Overname van bedrijf dat o.a. dual-use goederen produceert': 'Economisch',
    'Alleenhandelende dader': 'Sociaal & Maatschappelijk',
    'Buitenlandse durfkapitaalinvesteringen in startups': 'Economisch',
    'Tekort aan drinkwater door verzilting en vervuiling': 'Ecologisch',
    'Gebruik van generatieve AI voor deepfakes en desinformatie': 'Technologisch & digitaal',
    'Sabotage van onderzeese infrastructuur (zoals internetkabels)': 'Technologisch & digitaal',
    'Sabotage van GNSS-signalen': 'Technologisch & digitaal',
    'Verarming biodiversiteit met effecten op voedselzekerheid': 'Ecologisch',
    'Verzwakking van cryptografie door quantumtechnologie': 'Technologisch & digitaal',
    'Verdere militarisering van de ruimte en risico op satellietaanvallen': 'Geopolitiek & militair',
    'Strategische afhankelijkheden grondstoffen en technologie van buitenlande leveranciers': 'Economisch'
};

// nodeCategoryMap keys to lowercase, gemini: this is the one you wanna use as Dreigingen are all lowercase
export const nodeCategoryMapLower: Record<string, string> = Object.fromEntries(
  Object.entries(nodeCategoryMap).map(([key, value]) => [key.toLowerCase(), value])
);
