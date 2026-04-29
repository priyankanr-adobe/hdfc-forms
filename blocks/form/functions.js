/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

/**
 * Custom submit function
 * @param {scope} globals
 */
function submitFormArrayToString(globals) {
  const data = globals.functions.exportData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(',');
    }
  });
  globals.functions.submitForm(data, true, 'application/json');
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns {number} returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
* Masks the first 5 digits of the mobile number with *
* @param {*} mobileNumber
* @returns {string} returns the mobile number with first 5 digits masked
*/
function maskMobileNumber(mobileNumber) {
  if (!mobileNumber) {
    return '';
  }
  const value = mobileNumber.toString();
  // Mask first 5 digits and keep the rest
  return ` ${'*'.repeat(5)}${value.substring(5)}`;
}

/* timer function */
/**
 * @param {scope} globals
 */
function startOtpTimer(globals) {
  debugger;
  const timerField = globals.form.otp_verification_panel.timer
  let seconds = 30;
 
  if (!timerField) {
    return '00:30';
  }
 
  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
    window.otpTimerInterval = null;
  }
 
  globals.functions.setProperty(timerField, {
    value: '00:30',
  });
 
  window.otpTimerInterval = setInterval(() => {
    seconds -= 1;
 
    if (seconds >= 10) {
      globals.functions.setProperty(timerField, {
        value: `00:${seconds}`,
      });
    } else if (seconds >= 0) {
      globals.functions.setProperty(timerField, {
        value: `00:0${seconds}`,
      });
    }
 
    if (seconds <= 0) {
      clearInterval(window.otpTimerInterval);
      window.otpTimerInterval = null;
 
      globals.functions.setProperty(timerField, {
        value: 'Time expired',
      });
    }
  }, 1000);
 
  return '00:30';
}
 
/**
 * @param {scope} globals
 */
function stopOtpTimer(globals) {
  const timerField =globals.form.otp_verification_panel.timer
 
  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
    window.otpTimerInterval = null;
  }
}


/**
 * OTP valid handler
 * @param {scope} globals
 * @returns {string}
 */
function handleValidOtp(globals) {
  const panel = globals?.form?.otp_verification_panel;
  const validationMessage = panel?.validation_message;
  const resendBtn = panel?.resend_otp;
  const submitBtn = globals?.form?.otp_verification_panel?.otp_submit;

  if (validationMessage) {
    globals.functions.setProperty(validationMessage, {
      value: "OTP validated successfully",
      visible: true
    });
  }

  if (resendBtn) {
    globals.functions.setProperty(resendBtn, {
      visible: false,
      enabled: false
    });
  }

  if (submitBtn) {
    globals.functions.setProperty(submitBtn, {
      visible: true,
      enabled: true
    });
  }

  return "OTP validated successfully";
}


/**
 * OTP invalid handler
 * @param {scope} globals
 * @returns {string}
 */

function handleInvalidOtp(globals) {
  const panel = globals?.form?.otp_verification_panel;

  const validationMessage = panel?.validation_message;
  const attemptInfo = panel?.attempt_info;
  const submitBtn = panel?.otp_submit;

  window.otpAttemptsLeft = window.otpAttemptsLeft || 3;

  if (window.otpAttemptsLeft > 0) {
    window.otpAttemptsLeft -= 1;
  }

  if (validationMessage) {
    globals.functions.setProperty(validationMessage, {
      value: "Invalid OTP",
      visible: true
    });
  }

  if (attemptInfo) {
    globals.functions.setProperty(attemptInfo, {
      value: `${window.otpAttemptsLeft}/3 attempt(s) left`
    });
  }

  if (submitBtn) {
    globals.functions.setProperty(submitBtn, {
      enabled: window.otpAttemptsLeft > 0
    });
  }

  return "Invalid OTP";
}


/**
 * Resend OTP click handler
 * @param {scope} globals
 * @returns {string}
 */
function handleResendOtp(globals) {
  const panel = globals?.form?.otp_verification_panel;
  const validationMessage = panel?.validation_message;
  const otpField = panel?.otp;
  const submitBtn = panel?.otp_submit;
  const resendBtn = panel?.resend_otp;

  if (validationMessage) {
    globals.functions.setProperty(validationMessage, {
      value: "",
      visible: false
    });
  }

  if (otpField) {
    globals.functions.setProperty(otpField, {
      value: ""
    });
  }

  if (submitBtn) {
    globals.functions.setProperty(submitBtn, {
      enabled: true
    });
  }

  if (resendBtn) {
    globals.functions.setProperty(resendBtn, {
      visible: false,
      enabled: false
    });
  }

  startOtpTimer(globals);

  return "OTP resent";
}

// eslint-disable-next-line import/prefer-default-export
export {
  getFullName, days, submitFormArrayToString, maskMobileNumber, startOtpTimer, stopOtpTimer, handleValidOtp,
  handleInvalidOtp,
  handleResendOtp,
};
