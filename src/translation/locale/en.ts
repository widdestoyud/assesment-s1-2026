export default {
  /* GLOBAL */
  greeting: 'Hi from Web',
  web_global_back_text: 'Back',
  web_login_input_failed_character_number_text:
    'Please enter a valid number (8-13 characters)',
  web_login_input_failed_telkomsel_number_text:
    'Please enter your Telkomsel number',
  web_input_failed_nik_number_text: 'Please enter your valid identity number',
  web_input_failed_kk_number_text: 'Please enter your valid family card number',
  'enter-data': 'This field must be filled in',

  /* NOTFOUND */
  not_found_title: 'Page not found',
  not_found_text: 'Sorry, the page you are referring to cannot be found.',
  not_found_backtohome: 'Back to Home',

  /* APP */
  app_popup_error_title: 'Something went wrong!',
  app_popup_error_message:
    'Sorry, an error has occurred. Please try again later',
  app_popup_close_button_label: 'Close',

  /* Document Title */
  web_register_landing_document_title: 'Prepaid Registration | Telkomsel',
  web_register_verification_document_title:
    'Prepaid Number Verification | Telkomsel',
  web_register_personal_data_document_title:
    'Personal Data Verification | Telkomsel',
  web_register_success_register_document_title:
    'Registration Request Processed | Telkomsel',
  web_register_landing_check_status_document_title:
    'Checking Registered Telkomsel Number | Telkomsel',
  web_register_check_status_result_document_title:
    'Registered Telkomsel Number | Telkomsel',

  web_register_landing_title: 'Card Registration',
  web_register_landing_info_title: 'Quick & Easy SIM Registration',
  web_register_landing_info_text:
    'Follow the steps below, after successful registration you will receive a confirmation SMS',
  web_register_landing_info_text2:
    'Follow the steps below for SIM registration',
  web_register_landing_info_text3:
    'You will receive a confirmation SMS after successful registration',
  web_register_landing_info_dsc_sim_text: 'Prepare a Prepaid SIM',
  web_register_landing_info_dsc_sim_subtext:
    'Insert a SIM card into your device.',
  web_register_landing_info_dsc_verif_text: 'Verify Number',
  web_register_landing_info_dsc_verif_subtext:
    'Enter OTP code for number verification.',
  web_register_landing_info_dsc_indentity_text: 'Identity Information',
  web_register_landing_info_dsc_indentity_subtext:
    'Enter ID & KK identity information.',
  web_register_landing_button: 'Register Now',
  web_register_landing_check_number:
    'Check the Telkomsel number connected to your NIK.',

  // number
  web_register_verification_title: 'Card Registration',
  web_register_verification_text: 'Verify Number',
  web_register_verification_subtext:
    'Make sure your SIM card is installed and your phone is active.',
  web_register_verification_phone_text: 'Telkomsel Number To Be Registered',
  web_register_verification_phone_placeholder: 'Example: 0811123456789',

  // OTP
  web_register_verification_button: 'Send OTP',
  web_register_verification_otp_title: 'OTP Verification',
  web_register_verification_otp_text2:
    'Enter the OTP sent to number <strong>{{msisdn}}</strong>',
  web_register_verification_otp_button: 'Submit',
  web_register_verification_subtext1:
    'Valid until <strong>{{countdown}}</strong>',
  web_register_verification_subtext2: 'Please wait to resend the OTP',
  web_register_verification_otp_resend: 'Resend OTP code',
  web_register_verification_otp_invalid_text:
    'The OTP number you entered is incorrect',
  web_register_verification_otp_expired_text:
    'Your OTP code has expired, please resend the OTP code',
  web_register_verification_otp_alert_text:
    'Sorry, the OTP you entered is invalid or expired',
  web_register_verification_otp_error_text: 'Sorry an error occurred',
  web_register_verification_otp_requested_text:
    'Please enter the previously sent OTP',

  // Personal data
  web_register_personal_data_title: 'Enter Personal Data',
  web_register_personal_data_text:
    'Make sure your data is correct to proceed with the registration process for your new prepaid SIM.',
  web_register_personal_data_ktp_text: 'KTP number',
  web_register_personal_data_ktp_placeholder: 'Enter ID number',
  web_register_personal_data_nik_text: 'Family Card Number',
  web_register_personal_data_nik_placeholder: 'Enter family card number',
  web_register_personal_data_button: 'Continue',
  web_register_confirmation_data_title: 'Confirm Information',
  web_register_confirmation_data_text:
    'Re-check your booking details before proceeding to the next process.',
  web_register_confirmation_data_msisdn_text: 'Prepaid Number',
  web_register_confirmation_data_ktp_text: 'KTP number',
  web_register_confirmation_data_nik_text: 'Family Card Number',
  web_register_confirmation_data_button: 'Submit Card Registration',
  web_register_success_register_title: 'Card Registration Processed',
  web_register_success_register_text:
    'Please wait 2 - 5 minutes for activation time and a confirmation SMS will be sent to you.',
  web_register_success_register_trx_id: 'Transaction Number',
  web_register_success_register_status: 'Card Registration',
  web_register_success_register_status_subtext: 'Prepaid Number {{msisdn}}',
  web_register_success_register_button: 'Back To Home',
  web_register_success_register_status_process: 'In Process',
  web_register_success_register_subtext:
    'Having problems with this transaction? <0>Help Center</0>',
  web_register_success_register_banner_title:
    'Be more profitable with MyTelkomsel',
  web_register_pop_up_verified_personal_data_title: 'You Already Have 3 SIMs',
  web_register_pop_up_verified_personal_data_text:
    'Based on the regulations from Kominfo, you are only allowed to have 3 SIM cards registered with your KTP',
  web_register_pop_up_verified_personal_data_primary_button:
    'Check Connected Number',
  web_register_pop_up_verified_personal_data_secondary_button: 'Cancel',
  web_register_pop_up_invalid_personal_data_title: 'Invalid ID and KK Number',
  web_register_pop_up_invalid_personal_data_text:
    'Your KTP number and Family Card number have not been verified, please check again.',
  web_register_pop_up_invalid_personal_data_subtext:
    'You have the opportunity to check your <b>{count}x</b> data again',
  web_register_pop_up_invalid_personal_data_button: 'Check information back',
  web_register_pop_up_invalid_personal_data_subtext1:
    'You have used the <b>{count}x</b> opportunity to check your personal data information',
  web_register_pop_up_invalid_personal_data_call_button: 'Contact Call Center',
  web_register_pop_up_help_cs_title: 'Customer Service',
  web_register_pop_up_help_cs_text: 'Contact Customer Service at 188',

  // Check Status
  web_register_landing_check_status_text:
    'Check the Telkomsel number that is connected to your NIK.',
  web_register_check_status_personal_data_header: 'Check Number',
  web_register_check_status_personal_data_header_back: 'Back',
  web_register_check_status_not_found: 'Phone Number not found.',
  web_register_check_status_registered_number:
    'Your number is already registered',
  web_register_check_status_personal_data_title:
    'Check the Telkomsel number that has been registered to your NIK',
  web_register_check_status_personal_data_text:
    'Checking only shows Telkomsel numbers registered with NIK & KK Number',
  web_register_check_status_personal_data_ktp_text: 'KTP Number',
  web_register_check_status_personal_data_ktp_placeholder:
    'Enter your KTP number',
  web_register_check_status_personal_data_nik_text: 'Family Card Number',
  web_register_check_status_personal_data_nik_placeholder:
    'Enter your KK number',
  web_register_check_status_personal_data_msisdn_text:
    'One of Telkomsel Number',
  web_register_check_status_personal_data_nsisdn_placeholder:
    'Example : 0811123456789',
  web_register_check_status_personal_data_button: 'Check Status',
  web_register_check_status_result_header: 'Check Number',
  web_register_check_status_result_title: 'Your Telkomsel Number',
  web_register_check_status_result_text:
    'The following are Telkomsel numbers that are integrated with NIK {{nik}}',
  web_register_check_status_result_button: 'Finish',
  web_register_check_status_invalid_title: 'Invalid KTP and KK Numbers',
  web_register_check_status_invalid_text:
    'The information you entered is invalid. Please check again.',
  web_register_check_status_invalid_button: 'Check Information Again',
  web_register_check_status_invalid_phone_title: 'Invalid Telkomsel Number',
  web_register_check_status_invalid_phone_text:
    'The number you entered is not valid with your KTP & KK.',
  web_register_check_status_invalid_phone_button: 'Check Information Again',
  web_register_check_status_invalid_all_title: 'Invalid Data',
  web_register_check_status_invalid_all_text:
    'The information you entered is invalid, please check again.',
  web_register_check_status_invalid_all_button: 'Check Information Again',
  web_register_check_status_not_found_title: 'Data Not Found',
  web_register_check_status_not_found_text:
    'The information you entered is not found, please check again.',
  web_register_check_status_not_found_button: 'Check Information Again',
  web_register_check_status_result_prepaid_number: 'Prepaid Card',
  web_register_check_status_result_postpaid_number: 'Halo Card',

  // Transaction Detail
  web_register_transaction_detail_back_to: 'Back to',
  web_register_transaction_detail_telkomsel_prepaid: 'Telkomsel Prabayar',
  web_register_transaction_detail_telkomsel_postpaid: 'Telkomsel Halo',
  web_register_transaction_detail_grapari_online: 'GraPARI Online',
  cta_transaction_detail_telkomsel_prepaid: 'Telkomsel Prabayar',
  cta_transaction_detail_telkomsel_postpaid: 'Telkomsel Halo',
  cta_transaction_detail_grapari_online: 'GraPARI Online',
  web_register_transaction_detail_help: `Having problems with this transaction? Contact the  <a href="https://www.telkomsel.com/support" target="_blank">Help Center</a>`,

  // eSIM Registration
  web_register_personal_data_registrasi_sim_order_msisdn:
    'Your Telkomsel Number',
};
