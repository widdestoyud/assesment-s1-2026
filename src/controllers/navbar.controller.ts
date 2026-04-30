import type { AwilixRegistry } from '@di/container.ts';
import type { LangData } from '@components/LangSelector';

export interface NavbarControllerInterface {
  languages: LangData[];
  onChangeLng: (lang: string) => Promise<void>;
  onHomeClick: () => void;
}

const NavbarController = ({
  useTranslation,
  helpers,
  useState,
  useLoading,
  useLng,
  images,
  useNavigation,
}: AwilixRegistry): NavbarControllerInterface => {
  const { toggleLoading } = useLoading();
  const { lng, setLng } = useLng();
  const { navigate } = useNavigation();

  const { i18n } = useTranslation();
  const { changeLanguage } = i18n;

  const [languages, setLanguages] = useState<LangData[]>([
    {
      img: images.icon.idFlag,
      name: 'ID',
      active: helpers.normalizeLang(lng).toUpperCase() === 'ID',
    },
    {
      img: images.icon.enFlag,
      name: 'EN',
      active: helpers.normalizeLang(lng).toUpperCase() === 'EN',
    },
  ]);

  const onChangeLng = async (lang: string) => {
    const normalizedLang = helpers.normalizeLang(lang);
    if (normalizedLang !== lng) {
      toggleLoading();
      await changeLanguage(normalizedLang);
      setLng(normalizedLang);
      setLanguages(
        languages.map(language => {
          return {
            ...language,
            active: normalizedLang === language.name.toLowerCase(),
          };
        })
      );
      setTimeout(() => toggleLoading(), 300);
    }
  };

  const onHomeClick = () => {
    navigate({
      to: 'landing-page',
      viewTransition: true,
    });
  };

  return {
    languages,
    onChangeLng,
    onHomeClick,
  };
};

export default NavbarController;
