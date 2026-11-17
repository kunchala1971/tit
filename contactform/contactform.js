jQuery(document).ready(function ($) {
  "use strict";

  // Generate unique Ticket Reference ID
  function generateTicketId() {
    var randomNum = Math.floor(1000 + Math.random() * 9000);
    return "#TIT-2026-" + randomNum;
  }

  var currentTicketId = generateTicketId();
  $("#previewTicketId").text(currentTicketId);
  $("#resTicketId").text(currentTicketId);

  // Set current timestamp in preview
  function updateTimestamp() {
    var now = new Date();
    var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    $("#previewTimestamp").text("Updated at " + timeStr);
  }
  updateTimestamp();

  var emailExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;

  // -------------------------------------------------------------
  // 1. REAL-TIME QUERY TYPE SELECTION
  // -------------------------------------------------------------
  $(".query-type-pill").on("click", function () {
    $(".query-type-pill").removeClass("active");
    $(this).addClass("active");

    var type = $(this).data("type");
    var badgeText = $(this).data("badge");
    var badgeColor = $(this).data("color");
    var badgeBg = $(this).data("bg");

    $("#query_type").val(type);

    // Update Live Preview Category Badge
    $("#previewCategory")
      .text(badgeText)
      .css({
        "color": badgeColor,
        "background-color": badgeBg
      });

    // Update WhatsApp Direct Link Text with encoded Query Type
    var waNumber = "918985472191";
    var waMsg = encodeURIComponent("Hello Telugu IT Tutorials, I want to inquire about: " + badgeText);
    $("#btnWhatsAppDirect").attr("href", "https://wa.me/" + waNumber + "?text=" + waMsg);

    updateTimestamp();
  });

  // -------------------------------------------------------------
  // 2. REAL-TIME INPUT VALIDATION & LIVE PREVIEW SYNC
  // -------------------------------------------------------------

  function validateField(input) {
    var i = $(input);
    var id = i.attr("id");
    var val = $.trim(i.val());
    var rule = i.attr("data-rule");
    var isValid = true;
    var errorMsg = i.attr("data-msg") || "Invalid input";

    if (rule !== undefined) {
      var pos = rule.indexOf(":");
      var exp = pos >= 0 ? rule.substr(pos + 1) : "";
      var ruleType = pos >= 0 ? rule.substr(0, pos) : rule;

      switch (ruleType) {
        case "required":
          if (val === "") isValid = false;
          break;
        case "minlen":
          if (val.length < parseInt(exp, 10)) isValid = false;
          break;
        case "email":
          if (!emailExp.test(val)) isValid = false;
          break;
      }

      var feedbackEl = $("#" + id + "Feedback");

      if (!isValid) {
        i.addClass("is-invalid").removeClass("is-valid");
        if (val !== "") {
          feedbackEl.text(errorMsg).removeClass("valid-feedback").addClass("invalid-feedback");
        } else {
          feedbackEl.text("").removeClass("invalid-feedback valid-feedback");
        }
      } else {
        i.addClass("is-valid").removeClass("is-invalid");
        feedbackEl.text("✓ Looks good!").removeClass("invalid-feedback").addClass("valid-feedback");
      }
    }

    return isValid;
  }

  // Live Sync to Ticket Preview Card
  function syncLivePreview() {
    var nameVal = $.trim($("#name").val());
    var emailVal = $.trim($("#email").val());
    var phoneVal = $.trim($("#phone").val());
    var priorityVal = $("#priority").val();
    var subjectVal = $.trim($("#subject").val());
    var messageVal = $.trim($("#message").val());

    $("#previewName").text(nameVal || "Your Full Name");
    $("#previewEmail").text(emailVal || "your.email@example.com");
    $("#previewPhone").text(phoneVal || "Not provided");
    $("#previewPriority").text(priorityVal);
    $("#previewSubject").text(subjectVal || "No subject entered yet");

    if (messageVal) {
      $("#previewMessage").text(messageVal).css("font-style", "normal");
    } else {
      $("#previewMessage")
        .text("Start typing your query on the left form to see a real-time ticket preview generated instantly...")
        .css("font-style", "italic");
    }

    updateTimestamp();
  }

  // Attach live input listeners
  $("#name, #email, #phone, #subject").on("input keyup blur", function () {
    validateField(this);
    syncLivePreview();
  });

  $("#priority").on("change", function () {
    syncLivePreview();
  });

  $("#message").on("input keyup blur", function () {
    var val = $(this).val();
    $("#charCount").text(val.length);

    if (val.length >= 480) {
      $(".char-counter").css("color", "#ef4444");
    } else {
      $(".char-counter").css("color", "#94a3b8");
    }

    validateField(this);
    syncLivePreview();
  });

  // -------------------------------------------------------------
  // 3. FORM SUBMISSION VIA AJAX
  // -------------------------------------------------------------
  $("#realtimeQueryForm").on("submit", function (e) {
    e.preventDefault();

    var isFormValid = true;
    $(this).find("input[data-rule], textarea[data-rule]").each(function () {
      if (!validateField(this)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      $("#errormessage")
        .html("<i class='bi bi-exclamation-triangle-fill me-1'></i> Please fix the highlighted errors before submitting.")
        .fadeIn().addClass("show");
      $("#sendmessage").hide().removeClass("show");
      return false;
    }

    $("#errormessage").hide().removeClass("show");
    var $submitBtn = $("#btnSubmitQuery");
    var originalBtnHtml = $submitBtn.html();
    $submitBtn.html("<i class='fa fa-spinner fa-spin me-1'></i> Submitting Ticket...").prop("disabled", true);

    var nameVal = $.trim($("#name").val());
    var emailVal = $.trim($("#email").val());
    var phoneVal = $.trim($("#phone").val());
    var priorityVal = $("#priority").val();
    var subjectVal = $.trim($("#subject").val());
    var messageVal = $.trim($("#message").val());
    var queryTypeVal = $("#query_type").val() || 'general';

    var formData = $(this).serialize() + "&ticket_id=" + encodeURIComponent(currentTicketId);
    var action = $(this).attr("action") || "contactform/contactform.php";

    // Build pre-filled mailto fallback URL
    var mailSubject = encodeURIComponent("[" + queryTypeVal.toUpperCase() + "] " + currentTicketId + " - " + subjectVal);
    var mailBody = encodeURIComponent(
      "Telugu IT Tutorials Query Ticket\n" +
      "-----------------------------------\n" +
      "Ticket ID: " + currentTicketId + "\n" +
      "Query Type: " + queryTypeVal.toUpperCase() + "\n" +
      "Priority: " + priorityVal + "\n\n" +
      "Applicant Name: " + nameVal + "\n" +
      "Email: " + emailVal + "\n" +
      "WhatsApp/Phone: " + phoneVal + "\n\n" +
      "Subject: " + subjectVal + "\n\n" +
      "Query Details:\n" + messageVal
    );
    var mailtoUrl = "mailto:info@teluguittutorials.com?subject=" + mailSubject + "&body=" + mailBody;

    function handleMailFailure(errText) {
      $("#sendmessage").hide().removeClass("show");
      var errorHtml = "<div class='mb-2'><strong><i class='bi bi-exclamation-triangle-fill me-1'></i> Direct Server Email Delivery Error:</strong> " + (errText || "Mail service unavailable") + "</div>";
      errorHtml += "<p class='small mb-2'>Don't worry! You can send your pre-formatted ticket directly using your device's email client or WhatsApp below:</p>";
      errorHtml += "<div class='d-flex flex-wrap gap-2 mt-2'>";
      errorHtml += "<a href='" + mailtoUrl + "' class='btn btn-sm btn-primary' target='_blank'><i class='bi bi-envelope-fill me-1'></i> Send via Email App (info@teluguittutorials.com)</a>";
      errorHtml += "</div>";
      $("#errormessage").html(errorHtml).fadeIn().addClass("show");
    }

    $.ajax({
      type: "POST",
      url: action,
      data: formData,
      success: function (msg) {
        var cleanMsg = $.trim(msg);
        if (cleanMsg === "OK") {
          $("#resTicketId").text(currentTicketId);
          $("#sendmessage").fadeIn().addClass("show");
          $("#errormessage").hide().removeClass("show");

          // Reset form fields
          $("#realtimeQueryForm")[0].reset();
          $("#realtimeQueryForm input, #realtimeQueryForm textarea").removeClass("is-valid is-invalid");
          $(".field-feedback").text("");
          $("#charCount").text("0");

          // Generate new draft Ticket ID for next query
          currentTicketId = generateTicketId();
          $("#previewTicketId").text(currentTicketId);
          syncLivePreview();
        } else {
          handleMailFailure(cleanMsg === "MAIL_FAILED" ? "Server mail function returned a delivery failure." : cleanMsg);
        }
      },
      error: function (xhr) {
        var respText = xhr.responseText ? $.trim(xhr.responseText) : "";
        if (respText === "MAIL_FAILED") {
          handleMailFailure("Server mail function returned a delivery failure.");
        } else if (respText && respText.length < 150 && !respText.includes("<html")) {
          handleMailFailure(respText);
        } else {
          handleMailFailure("PHP backend processing unavailable or local static environment.");
        }
      },
      complete: function () {
        $submitBtn.html(originalBtnHtml).prop("disabled", false);
      }
    });

    return false;
  });

});
