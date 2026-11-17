<?php
/*
  PHP contact & Realtime Query submit handler
  Telugu IT Tutorials
*/

/***************** Configuration *****************/

  // Receiver email address
  $contact_email_to = "info@teluguittutorials.com";

  // Title prefixes
  $subject_title = "Query Ticket Submission:";

  // Error messages
  $contact_error_name = "Name is too short or empty!";
  $contact_error_email = "Please enter a valid email!";
  $contact_error_subject = "Subject is too short or empty!";
  $contact_error_message = "Message is too short! Please enter something.";

/********** Do not edit below ***********/

  function clean_string($var) {
    return trim(strip_tags($var ?? ''));
  }

  if (isset($_POST)) {

    $name       = clean_string($_POST["name"] ?? '');
    $email      = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
    $phone      = clean_string($_POST["phone"] ?? '');
    $query_type = clean_string($_POST["query_type"] ?? 'general');
    $priority   = clean_string($_POST["priority"] ?? 'Normal');
    $subject    = clean_string($_POST["subject"] ?? '');
    $message    = clean_string($_POST["message"] ?? '');
    $ticket_id  = clean_string($_POST["ticket_id"] ?? '#TIT-2026-QUERY');

    if (strlen($name) < 3) {
      http_response_code(400);
      die($contact_error_name);
    }

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
      http_response_code(400);
      die($contact_error_email);
    }

    if (strlen($subject) < 3) {
      http_response_code(400);
      die($contact_error_subject);
    }

    if (strlen($message) < 3) {
      http_response_code(400);
      die($contact_error_message);
    }

    $domain_host = !empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : ($_SERVER['SERVER_NAME'] ?? 'teluguittutorials.com');
    $domain_host = preg_replace('/^www\./i', '', explode(':', $domain_host)[0]);
    if (!filter_var("test@" . $domain_host, FILTER_VALIDATE_EMAIL)) {
      $domain_host = "teluguittutorials.com";
    }
    $contact_email_from = "no-reply@" . $domain_host;

    $encoded_name = '=?UTF-8?B?' . base64_encode($name) . '?=';
    $full_subject = "[" . strtoupper($query_type) . "] " . $ticket_id . " - " . $subject;
    $encoded_subject = '=?UTF-8?B?' . base64_encode($full_subject) . '?=';

    $headers = array();
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "From: Telugu IT Tutorials Contact <" . $contact_email_from . ">";
    $headers[] = "Reply-To: " . $encoded_name . " <" . $email . ">";
    $headers[] = "X-Mailer: PHP/" . phpversion();

    $headers_str = implode("\r\n", $headers);

    $message_content  = "<h2>Telugu IT Tutorials - New Real-Time Query Ticket</h2>";
    $message_content .= "<p><strong>Ticket ID:</strong> " . htmlspecialchars($ticket_id, ENT_QUOTES, 'UTF-8') . "</p>";
    $message_content .= "<p><strong>Query Type:</strong> " . htmlspecialchars(strtoupper($query_type), ENT_QUOTES, 'UTF-8') . "</p>";
    $message_content .= "<p><strong>Priority:</strong> " . htmlspecialchars($priority, ENT_QUOTES, 'UTF-8') . "</p>";
    $message_content .= "<hr>";
    $message_content .= "<p><strong>Applicant Name:</strong> " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "</p>";
    $message_content .= "<p><strong>Email Address:</strong> " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</p>";
    $message_content .= "<p><strong>WhatsApp / Phone:</strong> " . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</p>";
    $message_content .= "<p><strong>Subject:</strong> " . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . "</p>";
    $message_content .= "<p><strong>Query Details:</strong><br>" . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . "</p>";

    $sendemail = @mail($contact_email_to, $encoded_subject, $message_content, $headers_str);

    if ($sendemail) {
      echo 'OK';
    } else {
      http_response_code(500);
      echo 'MAIL_FAILED';
    }
  }
?>
