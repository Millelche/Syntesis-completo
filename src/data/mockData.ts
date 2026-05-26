import flyerVol4 from "@/assets/flyer-vol4.webp";
import flyerVol5 from "@/assets/flyer-vol5.webp";
import flyerVol7 from "@/assets/vol8.jpg";
import flyerVol8 from "@/assets/vol7.jpg";
import flyerVol6 from "@/assets/flyer-vol6.webp";
import bondarukSmtImg from "@/assets/artists/bondaruk-smt.webp";
import pakardImg from "@/assets/artists/pakard.webp";
import francoLorenzoImg from "@/assets/artists/franco-lorenzo.webp";
import delOlmoImg from "@/assets/artists/del-olmo.webp";

export interface Artist {
  id: string;
  name: string;
  slug: string;
  image: string;
  bio: string;
  genre: string;
  performances: string[];
  labels: string[];
  location: string;
  nationality: string;
  representation: string;
  socials: { name: string; url: string }[];
  order: number;
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  flyer: string;
  description: string;
  lineup: string[];
  setTimes?: { artist: string; time: string }[];
  ticketLinks?: { name: string; url: string }[];
  recordedSets?: string;
  isPast: boolean;
}

export interface BookingDate {
  id: string;         // ID único para el CRUD
  date: string;       // ISO 8601 (YYYY-MM-DD)
  artist: string;     // Nombre del artista
  artistSlug: string;
  venue: string;      // Nombre del venue
  promoter: string;
  country: string;
  city: string;
  ticketUrl?: string;
}

export const artists: Artist[] = [
  {
    id: "1",
    name: "BONDARÜK & SMT",
    slug: "bondaruk-smt",
    image: bondarukSmtImg,
    genre: "Techno",
    bio: "Bondarük & SMT es un dúo argentino de productores y DJs integrado por Tomi y Mati, conectados por una misma sensibilidad artística y una visión compartida sobre la producción musical como forma de arte.\n\nEn cabina, construyen atmósferas de groove hipnótico, bajos contundentes y melodías envolventes que impulsan un movimiento constante en la pista. Desde su debut oficial en junio de 2024 en Buenos Aires, han llevado su propuesta a espacios como Under Club, Crobar, Somnus y FVR, además de presentarse en Santiago de Chile.\n\nSus producciones trascendieron fronteras, sonando en escenarios emblemáticos como Tresor, Berghain, HOR, Boiler Room y Moog Barcelona, y recibiendo el respaldo de figuras como Lindsey Herbert, Introversión, Cleric, Shlomi Aber, Richie Hawtin y muchos más.",
    performances: ["DJ SET", "B2B"],
    labels: ["ROOM", "444 Series", "Existentia", "Wangan Club", "Bipolar Disorder", "Evil Groove"],
    location: "Buenos Aires, Argentina",
    nationality: "Argentina",
    representation: "Worldwide",
    socials: [
      {name:"SOUNDCLOUD", url: "https://soundcloud.com/ma-bondar-k"},
      {name:"INSTAGRAM", url: "https://www.instagram.com/bondarukkkk/"},
      {name:"BANDCAMP", url: "https://roomarg.bandcamp.com/"},
       {name:"SPOTIFY", url: "https://open.spotify.com/intl-es/artist/0PekByCcyLIrgwHwHM21sE"},
    ],
    order: 1,
  },
  {
    id: "2",
    name: "PAKARD",
    slug: "pakard",
    image: pakardImg,
    genre: "Techno",
    bio: "Pakard, productor y DJ originario de Santa Fe, Argentina, es una de las figuras más prometedoras de la nueva generación techno. Con una proyección internacional en pleno ascenso, desarrolla un sonido basado en raw techno, atravesado por texturas hipnóticas y minimalistas, transitando entre lo tribal, lo oscuro y lo experimental, siempre con un groove contundente orientado a la pista de baile.\n\nSu gran dedicación y pasión por la creación musical se evidencian tanto en su extenso catálogo musical como en su habilidad para producir con secuenciadores y máquinas de ritmo. Editando su música en labels de renombre como BCCO, Duplicity, Thumb Out Traxx, Secta, Reverse y RI7MO ha recibido el respaldo de referentes como Richie Hawtin, Nastia, MARRØN, Bours?, Alarico, The Chronics, JKS, entre otros.",
    performances: ["DJ SET"],
    labels: ["Maison Close", "BCCO", "Thump Out Traxx", "Duplicity", "RI7MO"],
    location: "Santa Fé, Argentina",
    nationality: "Argentina",
    representation: "Worldwide",
    socials: [
      {name:"SOUNDCLOUD", url: "https://soundcloud.com/pakard_ar"},
      {name:"INSTAGRAM", url: "https://www.instagram.com/pakard.ar/"},
      {name:"RESIDENT ADVISOR", url: "https://es.ra.co/dj/pakard"},
       {name:"BANDCAMP", url: "https://maisoncloserecords.bandcamp.com/"},
       {name:"SPOTIFY", url: "https://open.spotify.com/intl-es/artist/2uGm2g4peXlYlx77uhWZNb"},
    ],
    order:2,
  },
  {
    id: "3",
    name: "FRANCO LORENZO",
    slug: "franco-lorenzo",
    image: francoLorenzoImg,
    genre: "Techno / Trance",
    bio: "Franco Lorenzo es un DJ y productor argentino, nacido y establecido en Buenos Aires. Tras varios años de desarrollo sostenido en la producción musical y el arte del mixing, en 2024 Franco Lorenzo decide consolidar su identidad artística y enfocar su sonido hacia un trance contemporáneo, caracterizado por una búsqueda sonora profunda, enérgica y emocional.\n\nSus sets se construyen a partir de un trance envolvente y energético, donde se combinan bajos grooveros, vocales melódicas y atmósferas hipnóticas que dan forma a viajes sonoros intensos y sensibles. A lo largo de su recorrido ha compartido cabina con artistas como Prada2000, Gastón Fiore, Cami Vasquez y Marcos Fagoaga, mientras que sus producciones han recibido el respaldo de referentes como Richie Hawtin, Gastón Fiore, David Löhlein y Tinkerhell.",
    performances: ["DJ SET"],
    labels: ["Fat Grooves", "Xelima", "Underzone", "Calvaria Records"],
    location: "Buenos Aires, Argentina",
    nationality: "Argentina",
    representation: "Worldwide",
    socials: [
      {name:"SOUNDCLOUD", url: "https://soundcloud.com/franco_pepe"},
      {name:"INSTAGRAM", url: "https://www.instagram.com/francolorenzo___/"},
      {name:"RESIDENT ADVISOR", url: "https://es.ra.co/dj/francolorenzo"},
       {name:"BANDCAMP", url: "https://francolorenzo.bandcamp.com/"},
       {name:"SPOTIFY", url: "https://open.spotify.com/intl-es/artist/0k4tcLFPJie9ErMR6TqTRj"},
    ],
    order:3,
  },
  {
    id: "4",
    name: "DEL OLMO",
    slug: "del-olmo",
    image: delOlmoImg,
    genre: "Techno / Dub Techno",
    bio: "Florián Del Olmo es un DJ, productor, músico y pianista radicado en Buenos Aires. Su enfoque artístico se basa en la búsqueda de una estética futurista basada en el diseño y la ingeniería sonora para construir una identidad única. En la pista, despliega una paleta sonora minimalista con infusiones de dub e intenciones viscerales.\n\nEsta amplitud artística, sumada a su incansable búsqueda y dedicación al aprendizaje, se ve reflejada en un catálogo que no puede ser definido por un estilo sino en un viaje continuo de exploración musical sin límites. Ha lanzado música en sellos como Wangan Club, Ghetto Rhythm, ROOM, Life In Patterns y RI7MO, y ha participado en eventos destacados como SYNTESIS y Under Club. Su música ha sido apoyada por referentes de la escena como FJAAK, Frederic, Pan-Pot, Gaston Fiore y DJ Swisherman, entre otros.",
    performances: ["DJ SET", "VINYL SET"],
    labels: ["Life In Patterns", "Wangan Club", "TNR MEDIA", "RI7MO", "Sufrimiento Records"],
    location: "Buenos Aires, Argentina",
    nationality: "Argentina",
    representation: "Worldwide",
    socials: [
      {name:"SOUNDCLOUD", url: "https://soundcloud.com/floriandelolmo"},
      {name:"INSTAGRAM", url: "https://www.instagram.com/delolmo.wav/"},
      {name:"RESIDENT ADVISOR", url: "https://es.ra.co/dj/delolmo-2"},
       {name:"BANDCAMP", url: "https://bandcamp.com/floriandelolmo"},
       {name:"SPOTIFY", url: "https://open.spotify.com/intl-es/artist/3Djmtpydr6PgWbsyB6Ch1o"},
    ],
    order:4,
  },
  {
    id: "5",
    name: "FRVNCCSCV",
    slug: "frvnccscv",
    image: "",
    genre: "Techno / Trance / Hard House / UK Garage",
    bio: "Francesca Patiño, known as FRVNCCSCV, is a DJ and music producer from Santiago, Chile, who has made a strong impact on the electronic music scene with a style that blends techno, trance, bounce, and hard house. Since 2018, her sets have stood out as a whirlwind of captivating melodies, driving rhythms, and high-energy vocals, creating an intense and dynamic experience that invites constant movement and deep emotional connection.\n\nInfluenced by Eurodance, trance, and hard house, FRVNCCSCV has shared the booth with artists such as Narciss, Regal, Chontane, Bad Boombox, Mishluft, Felicie, RUIZ OSC1, SUPERGLOSS, Adrian Mills, Serafina, Fumi, Cloudy, among others, solidifying her presence at key events within the Chilean scene.",
    performances: ["DJ SET"],
    labels: [],
    location: "Santiago de Chile, Chile",
    nationality: "Chile",
    representation: "LATAM",
    socials: [
   
      {name:"INSTAGRAM", url: "https://www.instagram.com/frvnccscv/"},
       {name:"BANDCAMP", url: "https://frvnccscv.bandcamp.com/"},
    ],
    order:5,
  },
];

export const events: Event[] = [
  {
    id: "8",
    name: "SYNTESIS 008",
    slug: "syntesis-008",
    date: "2026-05-24",
    time: "23:59",
    venue: "Club de Pescadores",
    city: "Ciudad de Buenos Aires",
    flyer: flyerVol8,
    description: "La octava edición de Syntesis.",
    lineup: ["Hyvrid", "FRVNCCSCV", "Franck"],
    ticketLinks: [
      { name: "Bombo", url: "https://wearebombo.app.link/gdRmDhkaZ1b" },
      { name: "Resident Advisor", url: "https://es.ra.co/events/2409057" },
    ],
    isPast: false,
  },
  {
    id: "7",
    name: "SYNTESIS 007",
    slug: "syntesis-007",
    date: "2026-03-21",
    time: "23:59",
    venue: "Club de Pescadores",
    city: "Ciudad de Buenos Aires",
    flyer: flyerVol7,
    description: "Séptima edición de Syntesis con Gastón Fiore & Yenkov desde Francia y TINKERHELL.",
    lineup: ["FRANCO LORENZO", "GASTÓN FIORE & YENKOV", "TINKERHELL"],
    setTimes: [
      { artist: "FRANCO LORENZO", time: "00:00 - 02:00" },
      { artist: "GASTÓN FIORE & YENKOV", time: "02:00 - 05:00" },
      { artist: "TINKERHELL", time: "05:00 - 06:45" },
    ],
    recordedSets: "https://soundcloud.com/syntesis-485323313/sets/syntesis-007-buenos-aires-21",
    isPast: true,
  },
  {
    id: "6",
    name: "SYNTESIS 006 / ROOM SHOWCASE",
    slug: "syntesis-006",
    date: "2025-12-05",
    time: "23:59",
    venue: "Roxy",
    city: "Ciudad de Buenos Aires",
    flyer: flyerVol6,
    description: "Syntesis presenta Room Showcase. Una noche de techno underground con Pakard, Bondarük & SMT y Vilchezz desde España.",
    lineup: ["PAKARD", "BONDARÜK & SMT", "VILCHEZZ"],
    setTimes: [
      { artist: "PAKARD", time: "00:00 - 02:00" },
      { artist: "BONDARÜK & SMT", time: "02:00 - 04:00" },
      { artist: "VILCHEZZ (ES)", time: "04:00 - 07:00" },
    ],
    recordedSets: "https://soundcloud.com/syntesis-485323313/sets/syntesis-pres-room-05-12",
    isPast: true,
  },
  {
    id: "5",
    name: "SYNTESIS 005 / ANIVERSARY",
    slug: "syntesis-005",
    date: "2025-10-11",
    time: "23:59",
    venue: "The Sub",
    city: "Ciudad de Buenos Aires",
    flyer: flyerVol5,
    description: "Edición Aniversario con Prada2000 desde Alemania, Cami Vásquez desde Colombia y Franco Lorenzo de Argentina.",
    lineup: ["FRANCO LORENZO", "CAMI VÁSQUEZ", "PRADA2000", "GASTÓN FIORE"],
    setTimes: [
      { artist: "FRANCO LORENZO", time: "00:00 - 02:00" },
      { artist: "CAMI VÁSQUEZ (COL)", time: "02:00 - 04:00" },
      { artist: "PRADA2000 (ALE)", time: "04:00 - 06:00" },
      { artist: "GASTÓN FIORE", time: "06:00 - 07:00" },
    ],
    recordedSets: "https://soundcloud.com/syntesis-485323313/sets/syntesis-11-oct-aniversario",
    isPast: true,
  },
  {
    id: "4",
    name: "SYNTESIS 004",
    slug: "syntesis-004",
    date: "2025-06-21",
    time: "23:59",
    venue: "Teatro Unione e Benevolenza",
    city: "Ciudad de Buenos Aires",
    flyer: flyerVol4,
    description: "La cuarta edición de Syntesis con PPZZ, Giu Geniola, Atmosfear & Melnyk, y Franco Lorenzo & Federico Guerrero.",
    lineup: ["ATMOSFEAR & MELNYK", "PPZZ", "GIU GENIOLA", "FRANCO LORENZO & FEDERICO GUERRERO"],
    setTimes: [
      { artist: "ATMOSFEAR & MELNYK", time: "23:00 - 01:00" },
      { artist: "PPZZ", time: "01:00 - 02:30" },
      { artist: "GIU GENIOLA", time: "02:30 - 04:30" },
      { artist: "FRANCO LORENZO & FEDERICO GUERRERO", time: "04:30 - 07:00" },
    ],
    recordedSets: "https://soundcloud.com/syntesis-485323313/sets/syntesis-21-jun",
    isPast: true,
  },
  {
    id: "3",
    name: "SYNTESIS 003 / F2F",
    slug: "syntesis-003",
    date: "2025-03-23",
    time: "23:59",
    venue: "The Sub",
    city: "Ciudad de Buenos Aires",
    flyer: "",
    description: "Tercera edición de Syntesis en formato Face to Face.",
    lineup: ["BONDARÜK F2F SMT", "MARCOS FAGOAGA F2F SOCIEDAD ANÓNIMA", "GASTÓN FIORE F2F FRANCO LORENZO"],
    setTimes: [
      { artist: "BONDARÜK F2F SMT", time: "00:00 - 02:00" },
      { artist: "MARCOS FAGOAGA F2F SOCIEDAD ANÓNIMA", time: "02:00 - 04:00" },
      { artist: "GASTÓN FIORE F2F FRANCO LORENZO", time: "04:00 - 07:00" },
    ],
    isPast: true,
  },
  {
    id: "2",
    name: "SYNTESIS 002",
    slug: "syntesis-002",
    date: "2024-12-21",
    time: "23:59",
    venue: "Bastarda",
    city: "Ciudad de Buenos Aires",
    flyer: "",
    description: "Segunda edición de Syntesis con Dit Zy desde Italia.",
    lineup: ["NEOBABE", "DEL OLMO", "DIT ZY"],
    setTimes: [
      { artist: "NEOBABE", time: "23:00 - 01:00" },
      { artist: "DEL OLMO", time: "01:00 - 02:30" },
      { artist: "DIT ZY (IT)", time: "02:30 - 05:00" },
    ],
    isPast: true,
  },
  {
    id: "1",
    name: "SYNTESIS 001",
    slug: "syntesis-001",
    date: "2024-09-28",
    time: "23:59",
    venue: "Teatro Union Española e Benevolenza",
    city: "Ciudad de Buenos Aires",
    flyer: "",
    description: "La primera edición de Syntesis. El inicio de todo.",
    lineup: ["ATMOSFEAR", "EME KULHNEK", "SMT & BONDARÜK", "GASTÓN FIORE"],
    setTimes: [
      { artist: "ATMOSFEAR", time: "23:00 - 01:00" },
      { artist: "EME KULHNEK", time: "01:00 - 02:30" },
      { artist: "SMT & BONDARÜK", time: "02:30 - 04:30" },
      { artist: "GASTÓN FIORE", time: "04:30 - 07:00" },
    ],
    isPast: true,
  },
];

export const bookingDates: BookingDate[] = [
  {
    id: "1",
    date: "2026-05-24",
    artist: "BONDARÜK & SMT",
    artistSlug: "bondaruk-smt",
    venue: "Club de Pescadores",
    promoter: "Syntesis",
    country: "Argentina",
    city: "Buenos Aires",
    ticketUrl: "https://wearebombo.app.link/gdRmDhkaZ1b",
  },
  {
    id: "2",
    date: "2026-05-24",
    artist: "FRVNCCSCV",
    artistSlug: "frvnccscv",
    venue: "Club de Pescadores",
    promoter: "Syntesis",
    country: "Argentina",
    city: "Buenos Aires",
    ticketUrl: "https://wearebombo.app.link/gdRmDhkaZ1b",
  },
];
