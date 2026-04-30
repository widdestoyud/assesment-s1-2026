import type { AxiosRequestConfig } from 'axios';
import type { HttpResponse } from '@core/protocols/http';
import type { AwilixRegistry } from '@di/container';
import type { TranslationResource } from '@src/infrastructure/http/translation.ts';

export const ConfigService = ({
  http,
  config,
}: AwilixRegistry): ConfigServiceInterface => {
  return {
    getWebUIConfig: (query: string) => {
      const apiPath = 'web-ui-config/';
      return http.post<
        HttpResponse<WebUIData>,
        {
          q: string;
        },
        AxiosRequestConfig
      >(apiPath, {
        q: query,
      });
    },
    getAssets: () => {
      const apiPath = 'v1/asset/web';
      return http.get<WcmsDataInterface, AxiosRequestConfig>(apiPath, {
        baseURL: config.api.wcmsUrl,
      });
    },
  };
};

export interface ConfigServiceInterface {
  getWebUIConfig: (query: string) => Promise<HttpResponse<WebUIData>>;
  getAssets: () => Promise<WcmsDataInterface>;
}

export interface WebUIData {
  isUsingRemoteConfig: boolean;
  isUsingAuth0: boolean;
  banner: Banner;
  page: Page;
  appDeepLink: object;
  externalLink: ExternalLink;
  footerAppsIcon: FooterAppsIcon[];
  sendGiftTransferCredit: boolean;
  sendGiftAddCredit: boolean;
  pinLocation: boolean;
  starterpackPinLocation: boolean;
  verifyEmailDeeplink: string;
  socialMedia: SocialMedia;
  loyaltyIcon: LoyaltyIcon[];
  ocrProbabilityThreshold: number;
  isEnablePKCEAuth: boolean;
  upp_status: Status[];
  maintenancePage: MaintenancePage[];
  sim_replacement_question: boolean;
  simReplacementEnableNodeflux: boolean;
  dukcapilMaintenance: boolean;
  transaction_page: TransactionPage[];
  popupPromotion: PopupPromotion;
  isOTPLogin: boolean;
  oneLinkRedirect: OneLinkRedirect[];
  enableGifting: boolean;
  isOTPLoginALP: boolean;
  psbRevampDisableShipping: boolean;
  footerDashboard: FooterDashboard;
  isTheSkin: boolean;
  isOTPThe: boolean;
  socialMediaThe: SocialMediaThe;
  THE2: The2;
  quickLaunch: QuickLaunch[];
  timeIntervalLoading: number;
  psbRevampEsim: PsbRevampEsim;
  psbDownloadFaktur: PsbDownloadFaktur;
  ocrThreshold: OcrThreshold;
  isTheSkinURLRedirect: boolean;
  isWebRevampURLIsNotApp: string[];
  isWebRevampURLWithParams: string[];
  specialOfferConfig: string;
  eSIM: ESim;
  psb: Psb;
  segment_gift: string[];
  psbSkipConfirmation: boolean;
  basic: Basic2;
}

export interface Banner {
  enabled: boolean;
  closeTimeout: number;
}

export interface Page {
  svoc: boolean;
}

export interface ExternalLink {
  playStore: string;
  appStore: string;
  basic: Basic;
}

export interface Basic {
  playStore: string;
  appStore: string;
}

export interface FooterAppsIcon {
  name: string;
  url_link: string;
  keyWCMS: string;
}

export interface SocialMedia {
  list: string[];
}

export interface LoyaltyIcon {
  name: string;
  imgUrl: string;
  pageUrl: string;
}

export interface Status {
  page: string;
  isEnable: boolean;
  version: number;
}

export interface MaintenancePage {
  page: string;
  isMaintenance: boolean;
  url?: string;
}

export interface TransactionPage {
  page: string;
  enable: boolean;
  cta_1: Cta1;
  cta_2: Cta2;
}

export interface Cta1 {
  wcmsKey: keyof TranslationResource;
  link: string;
}

export interface Cta2 {
  wcmsKey: keyof TranslationResource;
  link: string;
}

export interface PopupPromotion {
  enable: boolean;
  button: Button[];
  content: Content[];
}

export interface Button {
  label: string;
  cta: string;
}

export interface Content {
  image: string;
  label: string;
  link: string;
}

export interface OneLinkRedirect {
  type: string;
  isEnable: boolean;
}

export interface FooterDashboard {
  socialMedia: SocialMedia[];
}

export interface SocialMedia {
  icon: string;
  title: string;
  cta: string;
}

export interface SocialMediaThe {
  list: string[];
}

export interface The2 {
  loginTabs: LoginTabs;
  isOTPLoginTHE2: boolean;
}

export interface LoginTabs {
  showMobile: boolean;
  showOrbit: boolean;
  showIndihome: boolean;
}

export interface QuickLaunch {
  icon: string;
  title: string;
  desc: string;
  link: string;
  enabled: boolean;
}

export interface PsbRevampEsim {
  showEsim: boolean;
  infoEsim: boolean;
}

export interface PsbDownloadFaktur {
  leftSide: LeftSide[];
  rightSide: RightSide[];
}

export interface LeftSide {
  index: number;
  label: string;
  value: string;
}

export interface RightSide {
  index: number;
  icon: string;
  value: string;
}

export interface OcrThreshold {
  simr: number;
  psb: number;
  p2p: number;
}

export interface ESim {
  activationPageTabs: ActivationPageTab[];
  eSIMFee: ESimfee;
  eSIMLimitOrder: ESimlimitOrder;
}

export interface ActivationPageTab {
  title: string;
  showEsimSP: boolean;
  showEsimPSB: boolean;
  showEsimRoaming: boolean;
  showSimtoEsim: boolean;
  showActivationAndroid?: boolean;
  showActivationiOS?: boolean;
}

export interface ESimfee {
  esimSP: number;
  esimRoaming: number;
  esimPSB: number;
}

export interface ESimlimitOrder {
  esimSP: number;
  esimRoaming: number;
  esimPSB: number;
  simToEsim: number;
}

export interface Psb {
  minimumPackagePriceGoldenNumber: number;
  skipConfirmationPage: boolean;
  enableShipping: boolean;
  enablePickup: boolean;
  showGoldenNumber: boolean;
}

export interface Basic2 {
  showInboxPopupPromo: boolean;
  showInboxIcon: boolean;
}

export interface TranslationInterface {
  en?: TranslationResource;
  id?: TranslationResource;
}

export interface WcmsDataInterface {
  [key: string]: string;
}
