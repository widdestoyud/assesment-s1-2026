import config from '@src/infrastructure/config';

export default class GoogleTagManager {
  static initGoogleTagManager() {
    const { id, enable } = config.gtm;
    if (enable && id) {
      const trackingId = id;

      // Add custom script for Google Tag Manager
      const headTarget = document.getElementsByTagName('head')[0];
      const bodyTarget = document.getElementsByTagName('body')[0];
      const newScript = document.createElement('script');
      const newNoScript = document.createElement('noscript');
      const inlineScript =
        document.createTextNode(`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${trackingId}');`);
      // iframe Google Tag Manager script
      const bodyScript =
        document.createTextNode(`<iframe src="https://www.googletagmanager.com/ns.html?id=${trackingId}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>`);

      // Initiate Google Tag Manager script
      newScript.appendChild(inlineScript);
      headTarget.appendChild(newScript);

      // Initiate Googe Tag Manager iframe
      newNoScript.appendChild(bodyScript);
      bodyTarget.appendChild(newNoScript);
    } else {
      return null;
    }
  }
}
