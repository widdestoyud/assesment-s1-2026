import arrowLeft from '@images/arrow-left.svg';
import prepaid from '@images/content/prepaid-banner.png';
import errorLogo from '@images/error.png';
import enFlag from '@images/icons/icon_en.png';
import idFlag from '@images/icons/icon_id.png';
import arrowRight from '@images/landing/arrow_right.svg';
import phone from '@images/landing/device-bundling.svg';
import simCard from '@images/landing/prepaid-registration-card.svg';
import user from '@images/landing/profile.png';
import phoneSuccess from '@images/landing/success_phone.png';
import loading from '@images/loader.svg';
import tselLogo from '@images/logos/Telkomsel-Logo.svg';
import tselIcon from '@images/logos/logo.png';
import regDetail from '@images/reg-detail-banner.png';
import appGalery from '@images/store/appGalery.svg';
import appMarket from '@images/store/appMarket.svg';
import appStore from '@images/store/appStore.svg';
import playstore from '@images/store/playstore.svg';
import success from '@images/success_hand.svg';

export default {
  arrowLeft,
  loading,
  errorLogo,
  success,
  regDetail,
  content: {
    prepaidBanner: prepaid,
  },
  landing: {
    arrowRight,
    phone,
    simCard,
    user,
    phoneSuccess,
  },
  icon: {
    enFlag,
    idFlag,
  },
  logo: {
    icon: tselIcon,
    full: tselLogo,
  },
  store: {
    appMarket,
    playstore,
    appStore,
    appGalery,
  },
};
