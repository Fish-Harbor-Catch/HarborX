import negomboTour from "../../negombo-fish-market-tour.jpg";
import negomboWet from "../../negombo-fish-market-wet.jpg";
import dimitriCoast from "../../pexels-dimitri-dim-380720-1802183.jpg";
import romanCoast from "../../pexels-roman-odintsov-6534202.jpg";

export const photos = [
  {
    src: "/public-home/images/matara-harbor.jpg",
    alt: "Colorful fishing boats moored in Matara harbor, Sri Lanka",
    title: "A harbor full of possibility",
    location: "Matara, Southern coast",
    category: "Harbor life",
    position: "50% 55%",
  },
  {
    src: "/public-home/images/arugam-coast.jpg",
    alt: "Fishing boats along the turquoise shore at Arugam Bay, Sri Lanka",
    title: "Where every journey begins",
    location: "Arugam Bay, Eastern coast",
    category: "Harbor life",
    position: "50% 50%",
  },
  {
    src: "/public-home/images/fresh-catch.jpg",
    alt: "A display of fresh fish and seafood at a market",
    title: "Fresh from the sea",
    location: "Seafood market · illustrative",
    category: "The catch",
    position: "50% 50%",
  },
  {
    src: "/public-home/images/stilt-fishermen.jpg",
    alt: "Sri Lankan stilt fishermen working above the ocean",
    title: "Knowledge passed through generations",
    location: "Sri Lanka, Southern coast",
    category: "Our traditions",
    position: "50% 45%",
  },
];
// Preserve the original three hero photographs; other shared photos stay separate.
export const heroPhotos = [
  ...photos.slice(0, 3),
  {
    src: negomboTour,
    location: "Negombo fish market",
    position: "50% 55%",
  },
  {
    src: negomboWet,
    location: "Negombo wet fish market",
    position: "50% 50%",
  },
  {
    src: dimitriCoast,
    location: "Coastal shoreline · illustrative",
    position: "50% 50%",
  },
  {
    src: romanCoast,
    location: "Coastal shoreline · illustrative",
    position: "60% 50%",
  },
];
export const services = [
  {
    icon: "Fish",
    title: "Digital catch registration",
    text: "Give every catch a clear beginning. Record species, quantities and boat details in one organized place.",
  },
  {
    icon: "Gavel",
    title: "Online fish auctions",
    text: "Bring sellers and buyers together through an accessible, transparent auction experience.",
  },
  {
    icon: "Store",
    title: "Buyer marketplace",
    text: "Discover available catches, compare lots and find the seafood that fits your business.",
  },
  {
    icon: "ShieldCheck",
    title: "Harbor verification",
    text: "Keep a human checkpoint at the heart of a digital process, with review by a Harbor Auction Officer.",
  },
  {
    icon: "ReceiptText",
    title: "Transaction tracking",
    text: "Keep auction results, payments and collection records connected and easy to follow.",
  },
  {
    icon: "CloudOff",
    title: "Offline catch drafts",
    text: "Capture the details while you are at the harbor, even when connectivity is limited.",
  },
];
export const workflow = [
  [
    "UserRoundPlus",
    "Make your connection",
    "A seller registers and adds their boat information.",
  ],
  [
    "Fish",
    "Record the catch",
    "Species, quantities and landing details are recorded.",
  ],
  [
    "Gavel",
    "Open an auction",
    "The seller makes the recorded catch available for auction.",
  ],
  [
    "Store",
    "Find the right buyer",
    "Buyers browse available catches and place their bids.",
  ],
  [
    "ShieldCheck",
    "Verify at the harbor",
    "The Harbor Auction Officer checks the landed catch.",
  ],
  [
    "BadgeCheck",
    "Confirm the winner",
    "The auction outcome and winning buyer are confirmed.",
  ],
  [
    "Handshake",
    "Pay. Collect. Connect.",
    "Payment and collection complete the journey.",
  ],
];
