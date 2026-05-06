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
  if (response.success) {
  stopOtpTimer(globals);

  fetchReviewDetailsAPI(globals);

  globals.functions.setProperty(globals.form.review_details, {
    visible: true
  });

  globals.functions.setProperty(globals.form.otp_verification_panel, {
    visible: false
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


/*offer detail function */
/**
 * @param {scope} globals
 * @returns {string}
 */
function updateLoanDisplay(globals) {
  const data = globals.functions.exportData();

  const loanAmount = Number(data.loan_amount || 0);

  return loanAmount > 0
    ? `₹${loanAmount.toLocaleString('en-IN')}`
    : '';
}

/**
 * @param {scope} globals
 * @returns {string}
 */
function updateLoanDetails(globals) {
  const data = globals.functions.exportData();

  const loanAmount = Number(data.loan_amount || 0);
  const tenure = Number(data.loan_tenure || 0);

  if (!loanAmount || !tenure) return '';

  const rate = 10.97;
  const monthlyRate = rate / (12 * 100);

  const emi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);

  return `₹${Math.round(emi).toLocaleString('en-IN')}`;
}

/**
 * @returns {string}
 */
function getRate() {
  return '10.97%';
}

/**
 * @returns {string}
 */
function getTax() {
  const data = globals.functions.exportData();

  const loanAmount = Number(data.loan_amount || 0);

  if (!loanAmount) return '';

  const processingFee = loanAmount * 0.02;   // 2%
  const gst = processingFee * 0.18;          // 18% GST

  const totalCharges = processingFee + gst;

  return `₹${Math.round(totalCharges).toLocaleString('en-IN')}`
}

/*Proceed API Function*/
/**
 * Proceed API call (Tier 1 via JS)
 * @param {scope} globals
 * @returns {string}
 */
function handleProceedAPI(globals) {
  const form = globals.form;

  const payload = {
    phone: document.querySelector('input[name="mobile"]')?.value || "",

    name: document.querySelector('input[name="full_name"]')?.value || "",
    dob: document.querySelector('input[name="date_of_birth"]')?.value || "",
    pan: document.querySelector('input[name="pan"]')?.value || "",

    currentAddress: document.querySelector('input[name="current_address"]')?.value || "",
    residenceType: document.querySelector('input[name="residence_type"]')?.value || "",

    employerName: document.querySelector('input[name="employer_name"]')?.value || "",
    typeOfLoan: document.querySelector('input[name="type_of_loan"]')?.value || "",

    loanAmount: document.querySelector('input[name="loan_amount"]')?.value || "",
    tenure: document.querySelector('input[name="tenure"]')?.value || "",
    emiAmount: document.querySelector('input[name="emi_amount"]')?.value || "",
    rateOfInterest: document.querySelector('input[name="rate_of_interest"]')?.value || "",

    processingFees: document.querySelector('input[name="processing_fee"]')?.value || "",
    scheduleOfCharges: document.querySelector('input[name="schedule_of_charges"]')?.value || ""
  };

  console.log("Proceed payload:", payload);

  fetch("https://junction-buffoon-amplify.ngrok-free.dev/proceed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then((res) => res.json())
    .then((response) => {
      console.log("Proceed response:", response);

      globals.functions.setProperty(form.confirmation_message, {
        value: response.message,
        visible: true
      });

      if (response.success) {
        // Navigate to success / thank you panel
        globals.functions.setProperty(form.thank_you_panel, {
          visible: true
        });

        globals.functions.setProperty(form.review_details, {
          visible: false
        });
      }
    })
    .catch((err) => {
      console.error("Proceed API error:", err);

      globals.functions.setProperty(form.confirmation_message, {
        value: "Something went wrong. Please try again.",
        visible: true
      });
    });

  return "Proceed API called";
}


// eslint-disable-next-line import/prefer-default-export
export {
  getFullName, days, submitFormArrayToString, maskMobileNumber, startOtpTimer, stopOtpTimer, handleOtpSuccess, handleOtpResend,
  handleOtpInvalid, handleOtpGenerated, updateLoanDetails,
  updateLoanDisplay,
  getRate,
  getTax, fetchReviewDetailsAPI,
};
