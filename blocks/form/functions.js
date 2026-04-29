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
  const panel = globals.form.otp_verification_panel;
    debugger;
  const timerField = panel.timer;
  const submitBtn = panel.otp_submit;
  const resendBtn = panel.resend_otp;

  let seconds = 10;

  if (!timerField) {
    return "00:30";
  }

  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
    window.otpTimerInterval = null;
  }

  globals.functions.setProperty(submitBtn, {
    enabled: true,
    visible: true
  });

  globals.functions.setProperty(resendBtn, {
    enabled: false,
    visible: false
  });

  globals.functions.setProperty(timerField, {
    value: "00:10"
  });

  window.otpTimerInterval = setInterval(() => {
    seconds -= 1;

    globals.functions.setProperty(timerField, {
      value: seconds >= 10 ? `00:${seconds}` : `00:0${seconds}`
    });

    if (seconds <= 0) {
      clearInterval(window.otpTimerInterval);
      window.otpTimerInterval = null;

      globals.functions.setProperty(timerField, {
        value: "Time expired"
      });

      globals.functions.setProperty(submitBtn, {
        enabled: false
      });

      globals.functions.setProperty(resendBtn, {
        enabled: true,
        visible: true
      });
    }
  }, 1000);

  return "00:30";
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
 * OTP success handler
 * @param {scope} globals
 * @returns {string}
 */
function handleOtpSuccess(globals) {
  const panel = globals.form.otp_verification_panel;

  const validationMessage = panel.validation_message;
  const resendBtn = panel.resend_otp;
  const submitBtn = panel.otp_submit;

  stopOtpTimer(globals);

  window.otpResendAttemptsLeft = 3;
  window.otpTimerExpired = false;

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
function handleOtpInvalid(globals) {
  const panel = globals.form.otp_verification_panel;

  const validationMessage = panel.validation_message;
  const resendBtn = panel.resend_otp;
  const submitBtn = panel.otp_submit;

  // reduce attempts
  window.otpResendAttemptsLeft = window.otpResendAttemptsLeft || 3;
  if (window.otpResendAttemptsLeft > 0) {
    window.otpResendAttemptsLeft -= 1;
  }

  // show invalid message
  if (validationMessage) {
    globals.functions.setProperty(validationMessage, {
      value: "Invalid OTP",
      visible: true
    });
  }

  // disable submit if no attempts left
  if (submitBtn) {
    globals.functions.setProperty(submitBtn, {
      enabled: window.otpResendAttemptsLeft > 0
    });
  }

  // show resend if attempts still available
  if (resendBtn) {
    globals.functions.setProperty(resendBtn, {
      visible: window.otpResendAttemptsLeft > 0,
      enabled: window.otpResendAttemptsLeft > 0
    });
  }

  return "Invalid OTP";
}


/**
 * Resend OTP handler
 * @param {scope} globals
 * @returns {string}
 */
function handleOtpResend(globals) {
  const panel = globals.form.otp_verification_panel;

  const attemptInfo = panel.attempt_info;
  const validationMessage = panel.validation_message;
  const resendBtn = panel.resend_otp;

  window.otpResendAttemptsLeft = window.otpResendAttemptsLeft ?? 3;

  if (window.otpResendAttemptsLeft > 0) {
    window.otpResendAttemptsLeft -= 1;
  }

  if (attemptInfo) {
    globals.functions.setProperty(attemptInfo, {
      value: `${window.otpResendAttemptsLeft}/3 attempt(s) left`
    });
  }

  if (validationMessage) {
    globals.functions.setProperty(validationMessage, {
      value: "",
      visible: false
    });
  }

  if (resendBtn) {
    globals.functions.setProperty(resendBtn, {
      visible: false,
      enabled: false
    });
  }

  startOtpTimer(globals);

  return `${window.otpResendAttemptsLeft}/3 attempt(s) left`;
}

/**
 * 3/3 attempts
 * @param {scope} globals
 * @returns {string}
 */
function handleOtpGenerated(globals) {
  const panel = globals.form.otp_verification_panel;
  const attemptInfo = panel.attempt_info;

  window.otpResendAttemptsLeft = 3;

  if (attemptInfo) {
    globals.functions.setProperty(attemptInfo, {
      value: "3/3 attempt(s) left"
    });
  }

  startOtpTimer(globals);

  return "OTP generated";
}


/**
 * Calculate EMI and update loan offer card
 * @param {scope} globals
 * @returns {string}
 */
function calculateLoanOffer(globals) {
  const form = globals.form;

  // CHANGE THESE PATHS if your field names are different
  const loanAmountField = form.loan_details.loan_amount;
  const tenureField = form.loan_details.loan_tenure;

  const personalLoanAmountField = form.loan_details.personal_loan_amount;
  const emiAmountField = form.loan_details.emi_amount;
  const rateOfInterestField = form.loan_details.rate_of_interest;
  const taxesField = form.loan_details.taxes;

  const principal = Number(loanAmountField.value || 0);
  const tenureMonths = Number(tenureField.value || 0);

  const annualInterestRate = 10.97;
  const monthlyRate = annualInterestRate / (12 * 100);
  const taxes = 4000;

  if (!principal || !tenureMonths) {
    return "";
  }

  const emi =
    principal *
    monthlyRate *
    Math.pow(1 + monthlyRate, tenureMonths) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const formatINR = (amount) => {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  };

  globals.functions.setProperty(personalLoanAmountField, {
    value: formatINR(principal)
  });

  globals.functions.setProperty(emiAmountField, {
    value: formatINR(emi)
  });

  globals.functions.setProperty(rateOfInterestField, {
    value: `${annualInterestRate}%`
  });

  globals.functions.setProperty(taxesField, {
    value: formatINR(taxes)
  });

  return "Loan offer calculated";
}

// eslint-disable-next-line import/prefer-default-export
export {
  getFullName, days, submitFormArrayToString, maskMobileNumber, startOtpTimer, stopOtpTimer, handleOtpSuccess, handleOtpResend,
  handleOtpInvalid, handleOtpGenerated, calculateLoanOffer,
};
