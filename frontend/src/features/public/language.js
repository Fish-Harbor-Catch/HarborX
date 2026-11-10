import { useLanguage as useAppLanguage } from "../../i18n.jsx";
const nav = {
  en: [
    "Home",
    "Services",
    "Gallery",
    "About Us",
    "Contact Us",
    "How It Works",
    "Talk to Us",
    "Login",
    "Register",
  ],
  si: [
    "මුල් පිටුව",
    "සේවාවන්",
    "ඡායාරූප",
    "අප ගැන",
    "අමතන්න",
    "ක්‍රියා කරන ආකාරය",
    "අප හා කතා කරන්න",
    "පිවිසෙන්න",
    "ලියාපදිංචි වන්න",
  ],
  ta: [
    "முகப்பு",
    "சேவைகள்",
    "புகைப்படங்கள்",
    "எம்மைப் பற்றி",
    "தொடர்பு",
    "செயல்முறை",
    "எம்முடன் பேசுங்கள்",
    "உள்நுழைக",
    "பதிவு செய்க",
  ],
};
const hero = {
  en: [
    "Connecting Sri Lanka’s",
    "fishing harbors to",
    "digital markets.",
    "A stronger connection between our fishing communities and the people they feed. Discover a simpler way to record, auction and trade the day’s catch.",
    "Go to marketplace",
    "Join our community",
  ],
  si: [
    "ශ්‍රී ලංකාවේ ධීවර",
    "වරායන් ඩිජිටල්",
    "වෙළඳපොළට සම්බන්ධ කරමු.",
    "අපගේ ධීවර ප්‍රජාවන් සහ ගැනුම්කරුවන් එක් කරන සරල ඩිජිටල් අත්දැකීමක්.",
    "වෙළඳපොළට යන්න",
    "අප හා එක්වන්න",
  ],
  ta: [
    "இலங்கையின் மீன்பிடித்",
    "துறைமுகங்களை டிஜிட்டல்",
    "சந்தைகளுடன் இணைக்கிறோம்.",
    "மீன்பிடிச் சமூகங்களையும் வாங்குபவர்களையும் இணைக்கும் எளிய டிஜிட்டல் அனுபவம்.",
    "சந்தைக்குச் செல்லுங்கள்",
    "எம்முடன் இணையுங்கள்",
  ],
};

export function useLanguage() {
  const { lang, setLang } = useAppLanguage();
  const language = nav[lang] ? lang : "en";
  return {
    language,
    setLanguage: setLang,
    nav: nav[language],
    hero: hero[language],
  };
}
