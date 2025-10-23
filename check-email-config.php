<?php
/**
 * Email Configuration Checker
 * Run this file to verify your email setup is working
 * Access: http://localhost/your-path/check-email-config.php
 */

echo "<html><head><title>Email Config Checker</title>";
echo "<style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    .success { color: green; font-weight: bold; }
    .error { color: red; font-weight: bold; }
    .warning { color: orange; font-weight: bold; }
    .info { color: blue; }
    .box { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background: #f9f9f9; }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 30px; }
    pre { background: #f4f4f4; padding: 10px; border-radius: 3px; overflow-x: auto; }
    .step { margin: 20px 0; padding: 15px; border-left: 4px solid #007bff; background: #f8f9fa; }
</style></head><body>";

echo "<h1>📧 Email Configuration Checker</h1>";

// Check 1: PHPMailer availability
echo "<h2>1. Checking PHPMailer Installation</h2>";
echo "<div class='box'>";

$phpmailer_found = false;
$load_method = '';

if (file_exists('vendor/autoload.php')) {
    require 'vendor/autoload.php';
    $phpmailer_found = true;
    $load_method = 'Composer (vendor/autoload.php)';
} elseif (file_exists('../vendor/autoload.php')) {
    require '../vendor/autoload.php';
    $phpmailer_found = true;
    $load_method = 'Composer (../vendor/autoload.php)';
} elseif (file_exists('capstone-api/api/PHPMailer/src/PHPMailer.php')) {
    require_once 'capstone-api/api/PHPMailer/src/Exception.php';
    require_once 'capstone-api/api/PHPMailer/src/PHPMailer.php';
    require_once 'capstone-api/api/PHPMailer/src/SMTP.php';
    $phpmailer_found = true;
    $load_method = 'Manual (capstone-api/api/PHPMailer/)';
}

if ($phpmailer_found) {
    echo "<span class='success'>✅ PHPMailer is installed!</span><br>";
    echo "<span class='info'>Load method: {$load_method}</span>";
} else {
    echo "<span class='error'>❌ PHPMailer NOT found!</span><br>";
    echo "<p>Install with: <code>composer require phpmailer/phpmailer</code></p>";
    echo "<p>Or download from: <a href='https://github.com/PHPMailer/PHPMailer/releases'>GitHub</a></p>";
}
echo "</div>";

// Check 2: forgot-password.php exists
echo "<h2>2. Checking Backend File</h2>";
echo "<div class='box'>";

if (file_exists('capstone-api/api/forgot-password.php')) {
    echo "<span class='success'>✅ forgot-password.php exists!</span><br>";
    
    // Check if credentials are configured
    $content = file_get_contents('capstone-api/api/forgot-password.php');
    
    if (strpos($content, 'your-email@gmail.com') !== false) {
        echo "<br><span class='error'>❌ Email credentials NOT configured!</span><br>";
        echo "<p>You need to update the following in <code>capstone-api/api/forgot-password.php</code>:</p>";
        echo "<pre>Line ~88-91:
\$mail->Username   = 'your-email@gmail.com';    // ← Change this
\$mail->Password   = 'your-app-password';        // ← And this

Line ~98:
\$mail->setFrom('your-email@gmail.com', ...)    // ← And this
</pre>";
    } else {
        echo "<br><span class='success'>✅ Email credentials appear to be configured!</span>";
    }
} else {
    echo "<span class='error'>❌ forgot-password.php NOT found!</span><br>";
    echo "<p>The file should be at: <code>capstone-api/api/forgot-password.php</code></p>";
}
echo "</div>";

// Check 3: Database connection
echo "<h2>3. Checking Database Connection</h2>";
echo "<div class='box'>";

if (file_exists('capstone-api/api/conn.php')) {
    echo "<span class='success'>✅ Database connection file exists!</span><br>";
    
    try {
        include 'capstone-api/api/conn.php';
        echo "<span class='success'>✅ Database connection successful!</span>";
    } catch (Exception $e) {
        echo "<span class='error'>❌ Database connection failed!</span><br>";
        echo "<span class='error'>Error: " . $e->getMessage() . "</span>";
    }
} else {
    echo "<span class='error'>❌ conn.php NOT found!</span>";
}
echo "</div>";

// Instructions
echo "<h2>📝 Next Steps</h2>";

echo "<div class='step'>";
echo "<h3>Step 1: Install PHPMailer (if not installed)</h3>";
echo "<pre>cd capstone-api
composer require phpmailer/phpmailer</pre>";
echo "</div>";

echo "<div class='step'>";
echo "<h3>Step 2: Generate Gmail App Password</h3>";
echo "<ol>";
echo "<li>Go to: <a href='https://myaccount.google.com/security' target='_blank'>Google Account Security</a></li>";
echo "<li>Enable <strong>2-Step Verification</strong></li>";
echo "<li>Go to: <a href='https://myaccount.google.com/apppasswords' target='_blank'>App Passwords</a></li>";
echo "<li>Select: <strong>Mail</strong> and <strong>Other (Custom name)</strong></li>";
echo "<li>Enter name: <strong>A.G Home</strong></li>";
echo "<li>Click <strong>Generate</strong></li>";
echo "<li>Copy the 16-character password (no spaces)</li>";
echo "</ol>";
echo "</div>";

echo "<div class='step'>";
echo "<h3>Step 3: Update forgot-password.php</h3>";
echo "<p>Edit: <code>capstone-api/api/forgot-password.php</code></p>";
echo "<pre>// Line ~88-91
\$mail->Username   = 'youractual@gmail.com';     // Your Gmail
\$mail->Password   = 'abcdefghijklmnop';          // Your 16-char app password

// Line ~98
\$mail->setFrom('youractual@gmail.com', 'A.G Home');
</pre>";
echo "</div>";

echo "<div class='step'>";
echo "<h3>Step 4: Test the Feature</h3>";
echo "<ol>";
echo "<li>Open your login page</li>";
echo "<li>Click \"Forgot Password?\"</li>";
echo "<li>Enter a valid email from your database</li>";
echo "<li>Click \"Send Code\"</li>";
echo "<li>Check your email for the verification code</li>";
echo "</ol>";
echo "</div>";

echo "<h2>📖 Full Documentation</h2>";
echo "<div class='box'>";
echo "<p>For complete setup guide, see: <code>EMAIL_SETUP_GUIDE.md</code></p>";
echo "</div>";

echo "</body></html>";
?>

