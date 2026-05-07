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

  const panel =
    globals.form.otp_verification_panel;

  const validationMessage =
    panel.validation_message;

  const resendBtn =
    panel.resend_otp;

  const submitBtn =
    panel.otp_submit;

  stopOtpTimer(globals);

  window.otpResendAttemptsLeft = 3;

  window.otpTimerExpired = false;

  /* SUCCESS MESSAGE */

  globals.functions.setProperty(
    validationMessage,
    {
      value: "OTP validated successfully",
      visible: true
    }
  );

  /* BUTTON STATES */

  globals.functions.setProperty(
    resendBtn,
    {
      visible: false,
      enabled: false
    }
  );

  globals.functions.setProperty(
    submitBtn,
    {
      enabled: true
    }
  );

  /* CALL REVIEW DETAILS API */

  fetchReviewDetailsAPI(globals);

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
 * Fetch Review Details
 * @param {scope} globals
 */
function fetchReviewDetailsAPI(globals) {

  const phone =
    document.querySelector('input[name="mobile"]')?.value || "";

  fetch("https://junction-buffoon-amplify.ngrok-free.dev/review-details", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ phone })
  })

    .then((res) => res.json())

    .then((response) => {

      console.log(response);

      if (!response.success) return;

      const data = response.data;

      /* LOAN DETAILS */

      globals.functions.setProperty(
        globals.form.review_details_panel.review_details.form_accordion1776849406288.loan_details.tenure,
        {
          value: data.tenure
        }
      );

      globals.functions.setProperty(
        globals.form.review_details_panel.review_details.form_accordion1776849406288.loan_details.processing_fee,
        {
          value: data.processingFees
        }
      );

      globals.functions.setProperty(
        globals.form.review_details_panel.review_details.form_accordion1776849406288.loan_details.employer_name,
        {
          value: data.employerName
        }
      );

      globals.functions.setProperty(
        globals.form.review_details_panel.review_details.form_accordion1776849406288.loan_details.schedule_of_charges,
        {
          value: data.scheduleOfCharges
        }
      );

      globals.functions.setProperty(
        globals.form.review_details_panel.review_details.form_accordion1776849406288.loan_details.type_of_loan,
        {
          value: data.typeOfLoan
        }
      );

      /* PERSONAL DETAILS */

      globals.functions.setProperty(
        globals.form.review_details_panel.review_details.form_accordion1776849406288.personal_details.full_name,
        {
          value: data.name
        }
      );

      globals.functions.setProperty(
        globals.form.review_details_panel.review_details.form_accordion1776849406288.personal_details.pan,
        {
          value: data.pan
        }
      );

      globals.functions.setProperty(
        globals.form.review_details_panel.review_details.form_accordion1776849406288.personal_details.current_address,
        {
          value: data.currentAddress
        }
      );

      globals.functions.setProperty(
        globals.form.review_details_panel.review_details.form_accordion1776849406288.personal_details.residence_type,
        {
          value: data.residenceType
        }
      );

      console.log("Values populated");

    })

    .catch((err) => {
      console.error(err);
    });

  return "API called";
}


/*Loan application number*/
/**
 * Proceed API
 * @param {scope} globals
 * @returns {string}
 */
function handleProceedAPI(globals) {

  const phone =
    document.querySelector('input[name="mobile"]')?.value || "";

  fetch("https://junction-buffoon-amplify.ngrok-free.dev/proceed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ phone })
  })

    .then((res) => res.json())

    .then((response) => {

      console.log("Proceed Response:", response);

      if (!response.success) return;

      const applicationNumber =
        response.data.loanApplicationNumber;

      /* SET APPLICATION NUMBER */

      globals.functions.setProperty(
        globals.form.loan_success_page.main_success_card.text_input1777273799589,
        {
          value: applicationNumber
        }
      );

      /* SHOW SUCCESS PAGE */

      globals.functions.setProperty(
        globals.form.review_details_panel,
        {
          visible: false
        }
      );

      globals.functions.setProperty(
        globals.form.success_panel,
        {
          visible: true
        }
      );

    })

    .catch((err) => {
      console.error(err);
    });

  return "Proceed API called";
}

// eslint-disable-next-line import/prefer-default-export
export {
  getFullName, days, submitFormArrayToString, maskMobileNumber, startOtpTimer, stopOtpTimer, handleOtpSuccess, handleOtpResend,
  handleOtpInvalid, handleOtpGenerated, updateLoanDetails,
  updateLoanDisplay,
  getRate,
  getTax, fetchReviewDetailsAPI, handleProceedAPI,
};
